<p align="center">
  <img src="media/marketplace-icon.png" alt="Logo" width="128" />
</p>

<h1 align="center">Copilot Memory Explorer</h1>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=cat5th.copilot-memory-explorer">
    <img src="https://img.shields.io/badge/VS%20Code-1.96%2B-blue?logo=visualstudiocode" alt="VS Code" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  </a>
  <a href="https://github.com/harvey-woo/copilot-memory-explorer">
    <img src="https://img.shields.io/github/stars/harvey-woo/copilot-memory-explorer?style=social" alt="Stars" />
  </a>
  <br/>
  <a href="README.md">English</a> ·
  <a href="README.zh-cn.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

用 VS Code 原生界面浏览和管理 GitHub Copilot 的记忆文件。

GitHub Copilot 会在对话中积累"记忆"——记录你的项目上下文、编码偏好、架构决策等长期信息。这些记忆以 Markdown 文件形式存储在本地，但没有任何内置界面去浏览和管理它们。

**Copilot Memory Explorer** 填补了这一空白：它提供了一个 VS Code 原生侧边栏视图，让你可以按聊天会话浏览和管理所有 Copilot 记忆。

## 演示

<p align="center">
  <img src="docs/usage-demo.webp" alt="使用演示" width="720" />
</p>

## 功能

- **原生树视图** — 侧边栏视图，支持 VS Code 原生右键菜单
- **会话浏览** — 浏览所有有记忆条目的聊天会话
- **文件树** — 递归扫描会话目录，展示文件和子目录
- **Markdown 预览** — 点击文件即可在预览面板中查看渲染后的 Markdown
- **图片预览** — 在预览面板中查看图片
- **右键菜单** — 右键复制路径、在 Finder 中显示、删除或新建记忆
- **排序** — 从视图标题栏切换按名称或日期排序
- **新建记忆** — 直接从侧边栏创建新的记忆文件

## 使用方法

1. 点击活动栏中的 **Copilot 记忆** 图标
2. 浏览会话并展开查看记忆文件
3. 点击文件在编辑器和预览面板中打开
4. 右键查看菜单选项

## 系统要求

- VS Code 1.96+
- GitHub Copilot（用于生成记忆）

## 发布说明

版本历史见 [CHANGELOG.md](CHANGELOG.md)。

## 许可证

[MIT](LICENSE)