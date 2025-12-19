/**
 * Data Studio Pro - Logic Controller
 * 包含：UI控制、Excel处理、图像提取打包(JSZip)、文本清洗
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // Core: State & Utils
    // ==========================================
    const state = {
        tableData: null,
        currentTab: 'html-panel'
    };

    const ui = {
        toast: (msg, type = 'info') => {
            const container = document.getElementById('status-bar');
            const el = document.createElement('div');
            el.className = 'toast';
            
            let icon = type === 'error' ? '<i class="fa-solid fa-circle-exclamation" style="color:var(--danger)"></i>' : 
                       type === 'success' ? '<i class="fa-solid fa-circle-check" style="color:var(--success)"></i>' :
                       '<i class="fa-solid fa-circle-info" style="color:var(--accent)"></i>';
            
            el.innerHTML = `${icon}<span>${msg}</span>`;
            container.appendChild(el);
            setTimeout(() => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                setTimeout(() => el.remove(), 300);
            }, 3000);
        },
        loader: (show, text = 'Processing...') => {
            const loader = document.getElementById('htmlLoader');
            const txt = document.getElementById('loaderText');
            if(show) {
                txt.textContent = text;
                loader.classList.add('show');
            } else {
                loader.classList.remove('show');
            }
        }
    };

    // Global Tab Switcher
    window.switchPanel = (panelId, btn) => {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.getElementById(panelId).classList.add('active');
        btn.classList.add('active');
        state.currentTab = panelId;
    };

    // ==========================================
    // Module 1: HTML & Table Processing
    // ==========================================
    
    // File Input & Drag-n-Drop
    const htmlZone = document.getElementById('htmlDropZone');
    const htmlInput = document.getElementById('htmlFile');

    htmlZone.addEventListener('click', () => htmlInput.click());
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        htmlZone.addEventListener(eventName, preventDefaults, false);
        document.getElementById('textArea').addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

    htmlZone.addEventListener('dragover', () => htmlZone.classList.add('drag-over'));
    htmlZone.addEventListener('dragleave', () => htmlZone.classList.remove('drag-over'));
    htmlZone.addEventListener('drop', (e) => {
        htmlZone.classList.remove('drag-over');
        handleHtmlFile(e.dataTransfer.files[0]);
    });

    htmlInput.addEventListener('change', (e) => handleHtmlFile(e.target.files[0]));

    function handleHtmlFile(file) {
        if (!file || !file.name.match(/\.(html|htm)$/i)) {
            ui.toast('请上传有效的 HTML 文件', 'error');
            return;
        }

        ui.loader(true, '正在解析 HTML 结构...');
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(e.target.result, 'text/html');
                const table = doc.querySelector('table');

                if (table) {
                    state.tableData = table;
                    renderPreview(table);
                    document.getElementById('htmlControls').style.display = 'block';
                    document.getElementById('htmlDropZone').style.display = 'none'; // Hide dropzone to save space
                    updateSelectors(true); // Reset selectors
                    ui.toast('表格解析成功', 'success');
                } else {
                    ui.toast('未在文件中找到 Table 标签', 'error');
                }
            } catch (err) {
                ui.toast('解析失败: ' + err.message, 'error');
            } finally {
                ui.loader(false);
            }
        };
        reader.readAsText(file);
    }

    function renderPreview(table) {
        const wrapper = document.getElementById('preview');
        wrapper.innerHTML = '';
        // Clone table to prevent modifying original data reference too much
        const clone = table.cloneNode(true);
        clone.style.width = '100%';
        clone.style.borderCollapse = 'collapse';
        clone.style.fontSize = '13px';
        
        // Add basic styles to the preview table cells
        const cells = clone.querySelectorAll('td, th');
        cells.forEach(td => {
            td.style.border = '1px solid var(--border-color)';
            td.style.padding = '8px';
            // Limit image size in preview
            const imgs = td.querySelectorAll('img');
            imgs.forEach(img => img.style.maxWidth = '100px');
        });

        wrapper.appendChild(clone);
    }

    // Selectors Logic
    const dirSelect = document.getElementById('directionSelect');
    const headSelect = document.getElementById('headerSelect');
    const sendTxtBtn = document.getElementById('sendToTxtBtn');
    const extImgBtn = document.getElementById('extractImgBtn');

    function updateSelectors(reset = false) {
        if (reset) {
            dirSelect.value = '';
            headSelect.innerHTML = '<option value="">请先选择方向</option>';
            headSelect.disabled = true;
            sendTxtBtn.disabled = true;
            extImgBtn.disabled = true;
            return;
        }
    }

    dirSelect.addEventListener('change', () => {
        if (!state.tableData) return;
        
        headSelect.innerHTML = '<option value="">加载中...</option>';
        const isRow = dirSelect.value === 'row';
        const rows = state.tableData.rows;
        
        const fragment = document.createDocumentFragment();
        
        // Add default option
        const defOpt = document.createElement('option');
        defOpt.value = "";
        defOpt.textContent = "请选择目标数据...";
        fragment.appendChild(defOpt);

        if (isRow) {
            Array.from(rows).forEach((row, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                const txt = row.cells[0]?.textContent.trim().substring(0, 40) || `Row ${i + 1}`;
                opt.textContent = `${i+1}. ${txt}`;
                fragment.appendChild(opt);
            });
        } else {
            const headerRow = rows[0];
            const maxCells = headerRow ? headerRow.cells.length : 0;
            for(let i=0; i<maxCells; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                const txt = headerRow.cells[i]?.textContent.trim().substring(0, 40) || `Col ${i+1}`;
                opt.textContent = `${i+1}. ${txt}`;
                fragment.appendChild(opt);
            }
        }

        headSelect.innerHTML = '';
        headSelect.appendChild(fragment);
        headSelect.disabled = false;
    });

    headSelect.addEventListener('change', () => {
        const hasValue = !!headSelect.value;
        sendTxtBtn.disabled = !hasValue;
        extImgBtn.disabled = !hasValue;
    });

    // Action: Extract Text
    sendTxtBtn.addEventListener('click', () => {
        const idx = parseInt(headSelect.value);
        if (isNaN(idx)) return;
        
        const isRow = dirSelect.value === 'row';
        let extracted = [];
        
        if (isRow) {
            const cells = state.tableData.rows[idx].cells;
            for(let cell of cells) extracted.push(cell.textContent.trim());
        } else {
            // Skip header if extracting column
            for(let i=1; i<state.tableData.rows.length; i++) {
                const cell = state.tableData.rows[i].cells[idx];
                if(cell) extracted.push(cell.textContent.trim());
            }
        }
        
        const textArea = document.getElementById('textArea');
        const existing = textArea.value;
        textArea.value = existing + (existing ? '\n' : '') + extracted.filter(t=>t).join('\n');
        
        // Switch tab
        document.querySelector('.nav-item:nth-child(3)').click();
        ui.toast(`已提取 ${extracted.length} 条文本数据`, 'success');
    });

    // Action: Extract Images (New Feature)
    extImgBtn.addEventListener('click', async () => {
        const idx = parseInt(headSelect.value);
        if (isNaN(idx)) return;

        ui.loader(true, '正在扫描图片资源...');
        const zip = new JSZip();
        const imgFolder = zip.folder("images");
        const isRow = dirSelect.value === 'row';
        let count = 0;

        const cellsToScan = [];
        if (isRow) {
            const cells = state.tableData.rows[idx].cells;
            for(let c of cells) cellsToScan.push(c);
        } else {
            for(let i=1; i<state.tableData.rows.length; i++) {
                const cell = state.tableData.rows[i].cells[idx];
                if(cell) cellsToScan.push(cell);
            }
        }

        const imgTasks = [];
        
        cellsToScan.forEach((cell, cellIndex) => {
            const imgs = cell.querySelectorAll('img');
            imgs.forEach((img, imgIndex) => {
                const src = img.src;
                const ext = src.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'png';
                const filename = `${isRow ? 'Col' : 'Row'}_${cellIndex + 1}_Img_${imgIndex + 1}.${ext}`;
                
                imgTasks.push(async () => {
                    try {
                        let blob;
                        if (src.startsWith('data:')) {
                            blob = await (await fetch(src)).blob();
                        } else {
                            // Fetch external (might fail due to CORS)
                            try {
                                const response = await fetch(src);
                                blob = await response.blob();
                            } catch (e) {
                                console.warn('CORS failed, ignoring', src);
                                return; 
                            }
                        }
                        if (blob) {
                            imgFolder.file(filename, blob);
                            count++;
                        }
                    } catch (e) { console.error(e); }
                });
            });
        });

        if (imgTasks.length === 0) {
            ui.loader(false);
            ui.toast('所选区域未找到图片', 'error');
            return;
        }

        ui.loader(true, `正在打包 ${imgTasks.length} 张图片...`);
        await Promise.all(imgTasks);

        if (count > 0) {
            const content = await zip.generateAsync({type:"blob"});
            saveAs(content, "extracted_images.zip");
            ui.toast(`成功导出 ${count} 张图片`, 'success');
        } else {
            ui.toast('无法下载图片 (可能是跨域限制)', 'error');
        }
        ui.loader(false);
    });

    // Action: Export Full Excel
    document.getElementById('convertBtn').addEventListener('click', async () => {
        if (!state.tableData) return;
        ui.loader(true, '正在生成 Excel...');
        
        try {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('Export');
            const rows = state.tableData.rows;

            // Simple text export first (Image in Excel is complex, simplified here for reliability)
            for(let i=0; i<rows.length; i++) {
                const cells = rows[i].cells;
                const rowData = [];
                for(let j=0; j<cells.length; j++) {
                    rowData.push(cells[j].textContent.trim());
                }
                ws.addRow(rowData);
            }

            const buf = await wb.xlsx.writeBuffer();
            const blob = new Blob([buf], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
            saveAs(blob, "data_export.xlsx");
            ui.toast('Excel 导出成功', 'success');
        } catch (e) {
            ui.toast('导出失败: ' + e.message, 'error');
        } finally {
            ui.loader(false);
        }
    });


    // ==========================================
    // Module 2: Text Processing
    // ==========================================
    
    // Drag drop for text area
    const txtArea = document.getElementById('textArea');
    txtArea.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if(file) loadTxtFile(file);
    });

    document.getElementById('txtFile').addEventListener('change', (e) => loadTxtFile(e.target.files[0]));

    function loadTxtFile(file) {
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            txtArea.value = e.target.result;
            ui.toast('文本已导入');
        };
        reader.readAsText(file);
    }

    document.getElementById('formatBtn').addEventListener('click', () => {
        const val = txtArea.value;
        if(!val) { ui.toast('编辑器为空', 'error'); return; }
        
        // Wildcards Logic (Same logic as before, optimized)
        const processed = processWildcards(val);
        txtArea.value = processed;
        ui.toast('规则化处理完成', 'success');
    });

    document.getElementById('exportTxtBtn').addEventListener('click', () => {
        const val = txtArea.value;
        if(!val) return;
        const blob = new Blob([val], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "clean_text.txt");
    });

    // Logic Refined from previous request
    function processWildcards(text) {
        let res = text
            .replace(/，/g, ',').replace(/。/g, '.').replace(/（/g, '(').replace(/）/g, ')')
            .replace(/_/g, ' ')
            .replace(/\s*([,()])\s*/g, '$1') // trim spaces around symbols
            .replace(/,$/mg, '') // remove end comma
            .replace(/\)\(+/g, '),('); // fix )(

        const lines = res.split('\n').map(line => {
            return line.split(',').map(tag => {
                let t = tag;
                let removed = false;
                while(t.startsWith('(') && t.endsWith(')')) {
                    t = t.slice(1, -1);
                    removed = true;
                }
                t = t.replace(/\\/g, '').replace(/\(/g, '\\(').replace(/\)/g, '\\)').trim();
                return removed ? `(${t})` : t;
            }).join(',');
        });
        return lines.join('\n');
    }
});
