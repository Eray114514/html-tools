# HTML和文本处理工具

## 项目简介
这是一个用于处理HTML文件和文本文件的工具，支持从HTML表格中提取数据并转换为Excel文件，以及对文本内容进行格式化处理。

## 功能介绍
- **HTML处理**: 从HTML文件中提取表格数据，并转换为Excel文件。
- **文本处理**: 对文本内容进行格式化处理，并支持下载为TXT文件。

## 使用说明
### HTML处理
1. 点击“选择HTML文件”按钮，选择一个包含表格的HTML文件。
2. 选择导出方向（按行导出或按列导出）。
3. 选择要导出的标题。
4. 点击“转换并保存为Excel”按钮，将表格数据转换为Excel文件并下载。
5. 点击“发送到文本处理”按钮，将选中的表格数据发送到文本处理区域。

### 文本处理
1. 点击“选择TXT文件”按钮，选择一个TXT文件。
2. 在文本区域中输入或粘贴文本内容。
3. 选择格式化规则。
4. 点击“规则化”按钮，对文本内容进行格式化处理。
5. 点击“下载TXT”按钮，将处理后的文本内容下载为TXT文件。

## 依赖项
- [xlsx](https://unpkg.com/xlsx/dist/xlsx.full.min.js)
- [exceljs](https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js)

## 开发
1. 克隆项目到本地：
    ```bash
    git clone https://github.com/yourusername/html-tools.git
    ```
2. 打开项目目录：
    ```bash
    cd html-tools
    ```
3. 在浏览器中打开`index.html`文件，开始使用工具。

## 贡献
欢迎提交问题和拉取请求来改进此项目。

## 许可证
此项目基于MIT许可证。