# 📦 Data Studio Pro

**Data Studio Pro** 是一款专为高效数据处理设计的轻量级工作站。它集成了 HTML 表格解析、Excel 自动化导出、图片批量提取以及文本规则化清洗功能，旨在为数据采集与预处理提供极致的沉浸式体验。

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-2.0.0-success.svg)
![Style](https://img.shields.io/badge/Style-Minimalist-black.svg)

---

## ✨ 核心特性

### 📊 表格处理中心 (Table Processor)
*   **即时解析**：支持拖拽上传 HTML 文件，毫秒级还原表格结构。
*   **维度提取**：自由切换“按行”或“按列”模式，精准锁定目标数据。
*   **图片批量提取 (New)**：一键扫描特定行/列中的所有图像，自动打包并重命名为 `.zip` 下载。
*   **Excel 自动化**：一键将复杂的网页表格转换为标准的 `.xlsx` 文档。

### 🧹 文本清洗工坊 (Text Studio)
*   **Wildcards 规则引擎**：专为特定标记语言设计的标准化工具。
    *   自动更正全角符号（`，。、（）`）。
    *   智能处理括号组逻辑，修复连体括号 `)(` 为 `),(`。
    *   去除多余的反斜杠与首尾冗余符号。
*   **IDE 级体验**：沉浸式代码编辑器风格，支持大规模文本快速处理与导出。

---

## 🚀 技术栈

本项目坚持 **Zero-Backend (无后端)** 理念，所有数据处理均在浏览器本地完成，确保隐私安全。

| 模块 | 驱动技术 |
| :--- | :--- |
| **UI 框架** | Vanilla JS + Glassmorphism CSS |
| **表格导出** | [ExcelJS](https://github.com/exceljs/exceljs) |
| **图片打包** | [JSZip](https://stuk.github.io/jszip/) |
| **文件保存** | [FileSaver.js](https://github.com/eligrey/FileSaver.js/) |
| **图标库** | FontAwesome 6.4 |

---

## 🛠 如何使用

1.  **启动**：克隆仓库后，直接在浏览器中打开 `index.html`。
2.  **HTML 处理**：
    *   将 HTML 文件拖入侧边栏指定的上传区。
    *   在“数据提取配置”中选择方向（行/列）及具体序号。
    *   点击“提取文本”发送至编辑器，或点击“提取图片”批量下载。
3.  **文本清洗**：
    *   从 HTML 提取数据或手动粘贴文本。
    *   点击“执行清洗”应用 Wildcards 规则。
    *   点击“导出 TXT”获取最终结果。

---

## 🎨 设计理念

*   **极简主义**：采用类似 Linear/Vercel 的高对比度、低饱和度配色方案。
*   **响应式布局**：侧边栏导航配合 Bento-Grid 卡片设计，适配不同尺寸的工作屏幕。
*   **交互反馈**：全量覆盖 CSS 动效与异步加载状态提示。

---

## 📄 开源协议

本项目基于 **MIT License** 协议开源。
