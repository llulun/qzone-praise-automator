# QZone Praise Automator

QZone Praise Automator 是一个网页版 QQ 空间自动点赞工具，支持自动检测好友动态、点赞、滚动加载、刷新页面等功能。增强版包括简化工作流、延迟处理、安全点赞、菜单调整、状态栏美化、滚动模拟等。最新版本添加了系统日志模块，支持日志级别配置和面板内查看日志。
=======

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.7.2-blue.svg)](https://github.com/llulun/qzone-autopraise-pro/releases/tag/v2.7.2)
[![Stars](https://img.shields.io/github/stars/llulun/qzone-autopraise-pro)](https://github.com/llulun/qzone-autopraise-pro/stargazers)
[![Forks](https://img.shields.io/github/forks/llulun/qzone-autopraise-pro)](https://github.com/llulun/qzone-autopraise-pro/network/members)
![Control Panel](docs/control-panel.png)
## Features

- **自动点赞**：检测好友动态页面，安全点赞未赞内容，支持屏蔽用户和过滤游戏转发。
- **滚动模拟**：模拟用户滚动加载更多动态，确保完整覆盖。
- **自动刷新**：定时刷新页面，保持活跃状态。
- **控制面板**：自定义参数如刷新频率、延迟、透明度、颜色等，支持暂停/恢复和测试执行。
- **状态栏**：实时显示任务进度、剩余时间、参数等，美化 UI 支持 emoji 和进度条。
- **日志模块**（新增 v2.7）: 支持 INFO/WARN/ERROR 级别，日志存储并在面板查看，支持清除日志。
- **兼容性**：兼容旧浏览器，优化性能，修复多项 bug。
- **暗黑模式**：自动适配系统主题。
- **与辅助工具结合**：可与 QZone Auto Login Helper 结合，确保登录不中断。

## Installation

1. 安装 Tampermonkey 或 Violentmonkey 浏览器扩展（推荐 Tampermonkey，从 Chrome Web Store 或 Firefox Add-ons 下载）。
2. 下载本仓库的 `QZone Praise Automator.js` 文件（点击 Raw > 右键保存，或下载 ZIP 解压）。
3. 打开 Tampermonkey Dashboard（浏览器工具栏 > Tampermonkey > Dashboard）。
4. 点击 “+” 创建新脚本，或通过 “Utilities” > “Import from file” 导入文件。
5. 保存后，脚本将自动启用，匹配 `*://*.qzone.qq.com/*`。

**更新脚本**：在 Tampermonkey Dashboard 中编辑脚本，或重新导入最新版本。

## Usage

- 脚本加载后，页面右上角会出现 “AL Menu” 浮动按钮。
- 点击打开控制面板：
  - **核心参数**：调整刷新频率（秒）、延迟、滚动动态数、屏蔽用户等。
  - **界面自定义**：设置透明度、背景渐变、文字颜色、暗黑模式等。
  - **高级参数**：最大重试次数、滚动步长、初始延迟、日志级别。
  - **查看日志**：显示系统日志列表，支持滚动浏览和清除。
- 点击 “保存并应用” 立即生效（部分需刷新页面）。
- 状态栏（页面顶部）实时显示运行状态、剩余时间等。
- 支持暂停/恢复和测试执行按钮。
## Compatibility
- Browsers: Chrome, Firefox
- Extensions: Tampermonkey v4+ or Violentmonkey
**示例配置**：
- 刷新频率：180 秒
- 点赞延迟：5 秒
- 日志级别：INFO（显示所有日志）

## Changelog

### v2.7.2 (2025-09-23)
- 新增系统日志模块：支持 INFO/WARN/ERROR 级别，日志带时间戳。
- 在控制面板添加 “查看日志” 标签：显示日志列表（最大 500 条），支持清除。
- 优化日志存储：同时输出到控制台和面板视图。
- 修复潜在 bug，提升稳定性。

### v2.6 (Previous)
- 优化点赞逻辑，防止重复调用。
- 美化状态栏：添加进度条、emoji。
- 其他 bug 修复和性能优化。

完整变更历史见 [CHANGELOG.md](CHANGELOG.md)。

## Contributing

欢迎贡献！Fork 本仓库，提交 Pull Request。确保代码符合 ESLint 规则，并测试在 Chrome/Firefox 上运行。

- **Issues**：报告 bug 或建议新功能。
- **PRs**：添加新功能、修复 bug 或改进文档。

## License

MIT License. 见 [LICENSE](LICENSE) 文件。

作者：llulun (with contributions)  
仓库：https://github.com/llulun/qzone-autopraise-pro  
问题反馈：https://github.com/llulun/qzone-autopraise-pro/issues
