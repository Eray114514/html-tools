const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
darkModeMediaQuery.addListener((e) => {
    updateTheme(e.matches);
});

function updateTheme(isDark) {
    // 可以在这里添加额外的主题切换逻辑
    console.log('Theme changed to:', isDark ? 'dark' : 'light');
}

// 初始化主题
updateTheme(darkModeMediaQuery.matches);

let tableData = null;

// HTML文件处理
document.getElementById('htmlFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const htmlContent = e.target.result;
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const tables = doc.getElementsByTagName('table');

            if (tables.length > 0) {
                tableData = tables[0];
                document.getElementById('preview').innerHTML = tableData.outerHTML;
                document.getElementById('convertBtn').disabled = false;

                // 更新列选择器
                updateSelectors();
            } else {
                alert('未找到表格数据！');
                document.getElementById('convertBtn').disabled = true;
                document.getElementById('columnSelect').disabled = true;
                document.getElementById('exportTxtBtn').disabled = true;
            }
        };
        reader.readAsText(file);
    }
});

// TXT文件处理
document.getElementById('txtFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('textArea').value = e.target.result;
        };
        reader.readAsText(file);
    }
});

// 从HTML区域发送数据到文本区域
document.getElementById('sendToTxtBtn').addEventListener('click', function () {
    const directionSelect = document.getElementById('directionSelect');
    const headerSelect = document.getElementById('headerSelect');
    const index = parseInt(headerSelect.value);
    const isRow = directionSelect.value === 'row';

    if (!tableData || isNaN(index)) {
        alert('请选择要导出的内容！');
        return;
    }

    let content = [];
    const rows = tableData.getElementsByTagName('tr');

    if (isRow) {
        const selectedRow = rows[index];
        const cells = selectedRow.getElementsByTagName('td');
        const headers = selectedRow.getElementsByTagName('th');
        [...headers, ...cells].forEach(cell => {
            const text = cell.textContent.trim();
            if (text) content.push(text);
        });
    } else {
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            const headers = rows[i].getElementsByTagName('th');
            let cellContent = '';
            if (index < headers.length) {
                cellContent = headers[index].textContent.trim();
            } else if (index - headers.length < cells.length) {
                cellContent = cells[index - headers.length].textContent.trim();
            }
            if (cellContent) content.push(cellContent);
        }
    }

    document.getElementById('textArea').value = content.join('\n');

    // 自动切换到文本处理标签页
    const textTabButton = document.querySelector('.tab-button:not(.active)');
    openTab({ currentTarget: textTabButton }, 'textTab');
});

// 更新选择器状态
function updateSelectors() {
    const directionSelect = document.getElementById('directionSelect');
    const headerSelect = document.getElementById('headerSelect');
    const sendToTxtBtn = document.getElementById('sendToTxtBtn');
    const exportTxtBtn = document.getElementById('exportTxtBtn');
    const exportRule = document.getElementById('exportRule');

    directionSelect.disabled = !tableData;
    headerSelect.disabled = true;
    sendToTxtBtn.disabled = true;
    exportTxtBtn.disabled = true;
    exportRule.disabled = true;
    headerSelect.innerHTML = '<option value="">选择要导出的标题</option>';
}

document.getElementById('directionSelect').addEventListener('change', function () {
    const headerSelect = document.getElementById('headerSelect');
    const sendToTxtBtn = document.getElementById('sendToTxtBtn');
    const exportTxtBtn = document.getElementById('exportTxtBtn');

    headerSelect.innerHTML = '<option value="">选择要导出的标题</option>';

    if (!this.value || !tableData) {
        headerSelect.disabled = true;
        sendToTxtBtn.disabled = true;
        exportTxtBtn.disabled = true;
        return;
    }

    const isRow = this.value === 'row';
    const rows = tableData.getElementsByTagName('tr');

    if (isRow) {
        // 获取所有行的第一个单元格作为标题
        for (let i = 0; i < rows.length; i++) {
            const firstCell = rows[i].getElementsByTagName('td')[0] || rows[i].getElementsByTagName('th')[0];
            if (firstCell) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = firstCell.textContent.trim() || `行 ${i + 1}`;
                headerSelect.appendChild(option);
            }
        }
    } else {
        // 获取第一行的所有单元格作为列标题
        const firstRow = rows[0];
        const headers = firstRow.getElementsByTagName('th');
        const cells = firstRow.getElementsByTagName('td');

        for (let i = 0; i < Math.max(headers.length, cells.length); i++) {
            const cell = headers[i] || cells[i];
            if (cell) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = cell.textContent.trim() || `列 ${i + 1}`;
                headerSelect.appendChild(option);
            }
        }
    }

    headerSelect.disabled = false;
});

document.getElementById('headerSelect').addEventListener('change', function () {
    const sendToTxtBtn = document.getElementById('sendToTxtBtn');
    const exportRule = document.getElementById('exportRule');
    const exportTxtBtn = document.getElementById('exportTxtBtn');
    sendToTxtBtn.disabled = !this.value;
    exportRule.disabled = !this.value;
    exportTxtBtn.disabled = !this.value;
});

// wildcards规则
function formatContent(text) {
    let result = text;

    // 1. 将所有中文符号改为英文符号（括号，逗号，句号）以及下划线替换为空格
    result = result.replace(/[，]/g, ',')
        .replace(/[。]/g, '.')
        .replace(/[（]/g, '(')
        .replace(/[）]/g, ')')
        .replace(/_/g, ' ');
    document.getElementById('textArea').value = result;

    // 2. 只删除逗号和括号左右的空格，保留换行符
    result = result.split('\n').map(line => {
        return line.replace(/\s*([,()])\s*/g, '$1').replace(/,\s*$/, '');
    }).join('\n');
    document.getElementById('textArea').value = result;

    // 3. 若有多个括号连在一起则改为一个逗号
    result = result.replace(/\)\(+/g, '),(');
    document.getElementById('textArea').value = result;

    // 4. 遍历每一个tag，处理括号组
    let lines = result.split('\n');
    lines = lines.map(line => {
        let tags = line.split(',');
        tags = tags.map(tag => {
            // 处理一个tag的函数
            function processTag(tagContent) {
                let processed = tagContent;
                let everRemoved = false; // 标记是否成功移除过括号

                // 1. 循环删除外层括号,直到不满足条件
                let changed = true;
                while (changed) {
                    changed = false;
                    if (processed.charAt(0) === '(' && processed.charAt(processed.length - 1) === ')') {
                        processed = processed.slice(1, -1);
                        changed = true;
                        everRemoved = true;
                    }
                }

                // 如果从未移除过括号(即第一次检查就不满足条件),直接使用原始内容处理
                if (!everRemoved) {
                    return processed
                        .replace(/\\/g, '') // 去除所有反斜杠
                        .replace(/\(/g, ' \\(')
                        .replace(/\)/g, '\\) ')
                        .replace(/\s+/g, ' ')
                        .trim();
                }

                // 2. 处理剩余的括号
                processed = processed
                    .replace(/\\/g, '') // 去除所有反斜杠
                    .replace(/\(/g, ' \\(')
                    .replace(/\)/g, '\\) ')
                    .replace(/\s+/g, ' ')
                    .trim();

                // 3. 添加一对外层括号(只在之前成功移除过括号的情况下)
                return `(${processed})`;
            }

            return processTag(tag);
        });
        return tags.join(',');
    });

    result = lines.join('\n');
    document.getElementById('textArea').value = result;

    return result;
}

// 添加规则选择切换函数
function toggleRuleOptions(value) {
    const formatRule = document.getElementById('formatRule');
    formatRule.style.display = value === 'formatted' ? 'inline-block' : 'none';
}

// 添加规则化按钮事件监听器
document.getElementById('formatBtn').addEventListener('click', function () {
    const textArea = document.getElementById('textArea');
    const formatRule = document.getElementById('formatRule');
    const content = textArea.value;

    if (formatRule.value === 'wildcards') {
        formatContent(content);
    }
    // 这里可以添加更多规则的处理分支
});

// 修改导出TXT文件的处理逻辑
document.getElementById('exportTxtBtn').addEventListener('click', function () {
    const textArea = document.getElementById('textArea');
    const content = textArea.value;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'processed_text.txt';
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});

document.getElementById('convertBtn').addEventListener('click', async function () {
    if (!tableData) {
        alert('请先选择HTML文件！');
        return;
    }

    // 创建工作簿和工作表
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    const rows = tableData.getElementsByTagName('tr');

    // 显示进度提示
    const progressDiv = document.createElement('div');
    progressDiv.style.position = 'fixed';
    progressDiv.style.top = '50%';
    progressDiv.style.left = '50%';
    progressDiv.style.transform = 'translate(-50%, -50%)';
    progressDiv.style.padding = '20px';
    progressDiv.style.background = 'rgba(0,0,0,0.7)';
    progressDiv.style.color = 'white';
    progressDiv.style.borderRadius = '5px';
    document.body.appendChild(progressDiv);

    // 创建一个数组来存储所有的处理Promise
    const processingPromises = [];

    // 处理每一行
    for (let i = 0; i < rows.length; i++) {
        progressDiv.textContent = `处理中...${Math.round((i / rows.length) * 100)}%`;

        const cells = rows[i].getElementsByTagName('td');
        const headers = rows[i].getElementsByTagName('th');
        const excelRow = worksheet.getRow(i + 1);

        // 处理表头
        for (let j = 0; j < headers.length; j++) {
            excelRow.getCell(j + 1).value = headers[j].textContent.trim();
        }

        // 处理数据单元格
        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            const img = cell.querySelector('img');
            const colIndex = headers.length + j + 1;

            if (img) {
                const promise = (async () => {
                    try {
                        const imgSrc = img.src;
                        worksheet.getRow(i + 1).height = 100;
                        worksheet.getColumn(colIndex).width = 15;

                        if (imgSrc.startsWith('data:image')) {
                            const imageId = workbook.addImage({
                                base64: imgSrc,
                                extension: 'png',
                            });
                            worksheet.addImage(imageId, {
                                tl: { col: colIndex - 1, row: i },
                                ext: { width: 100, height: 100 }
                            });
                        } else {
                            const response = await fetch(imgSrc);
                            const blob = await response.blob();
                            const base64 = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = (e) => resolve(e.target.result);
                                reader.readAsDataURL(blob);
                            });

                            const imageId = workbook.addImage({
                                base64: base64,
                                extension: 'png',
                            });
                            worksheet.addImage(imageId, {
                                tl: { col: colIndex - 1, row: i },
                                ext: { width: 100, height: 100 }
                            });
                        }
                    } catch (error) {
                        console.error('处理图片时出错:', error);
                        excelRow.getCell(colIndex).value = '图片加载失败';
                    }
                })();
                processingPromises.push(promise);
            } else {
                excelRow.getCell(colIndex).value = cell.textContent.trim();
            }
        }
    }

    // 等待所有图片处理完成
    await Promise.all(processingPromises);
    progressDiv.textContent = '正在生成Excel文件...';

    // 导出Excel文件
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'table_data.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    document.body.removeChild(progressDiv);
});

// 添加标签页切换功能
function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    const tabButtons = document.getElementsByClassName('tab-button');

    // 隐藏所有标签页内容
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }

    // 移除所有标签按钮的active类
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }

    // 显示当前标签页
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}
