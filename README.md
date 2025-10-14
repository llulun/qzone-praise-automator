# QZone Praise Automator

QZone Praise Automator 是一个网页版 QQ 空间自动点赞工具，支持自动检测好友动态、点赞、滚动加载、刷新页面等功能。增强版包括简化工作流、延迟处理、安全点赞、菜单调整、状态栏美化、滚动模拟等。最新版本添加了系统日志模块、UI 美化升级、动态关键词过滤、黑名单扩展、每日点赞上限、浏览器通知、性能监控和多账号支持等功能，支持日志级别配置和面板内查看日志。新增：集成自动登录辅助，确保点赞不因登录过期中断；日志搜索功能，NaN 处理优化；合并QZone Auto Login Helper；添加登录设置tab；浮动按钮移到右上角。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.8.7-blue.svg)](https://github.com/llulun/qzone-praise-automator/releases/tag/v2.8.7)
[![Stars](https://img.shields.io/github/stars/llulun/qzone-praise-automator)](https://github.com/llulun/qzone-praise-automator/stargazers)
[![Forks](https://img.shields.io/github/forks/llulun/qzone-praise-automator)](https://github.com/llulun/qzone-praise-automator/network/members)
![Control Panel](docs/control-panel.png)

## Features

- 自动点赞 ：检测好友动态页面，安全点赞未赞内容，支持屏蔽用户、过滤游戏转发、动态关键词过滤（屏蔽/允许模式，支持正则）和每日上限。
- 滚动模拟 ：模拟用户滚动加载更多动态，确保完整覆盖，防止重复点赞导致取消。
- 自动刷新 ：定时刷新页面，保持活跃状态。
- 控制面板 ：自定义参数如刷新频率、延迟、透明度、颜色、屏蔽用户、分组、白名单、关键词过滤、重试次数、滚动步长、初始延迟、随机延迟、日志级别和通知开关等，支持暂停/恢复、测试执行、重置默认和导出配置。新增：登录设置tab，配置自动登录参数。
- 状态栏 ：实时显示任务进度、剩余时间、参数等，美化 UI 支持 emoji、进度条和网格布局。
- 日志模块 ：支持 INFO/WARN/ERROR 级别，日志带时间戳，在面板查看、搜索和清除日志。
- 性能监控 ：统计点赞成功率、跳过和错误，支持图表查看和清除统计。
- 多账号支持 ：切换不同账号配置。
- 兼容性 ：兼容旧浏览器，优化性能，修复多项 bug，包括关键词屏蔽生效和已赞动态重复检测。
- 暗黑模式 ：自动适配系统主题。
- 集成自动登录 ：自动检测登录状态，如果失效触发浏览器 autofill，确保点赞不中断。
- 与辅助工具结合 ：原 QZone Auto Login Helper 已合并，确保登录不中断。

## Installation

1. 安装 Tampermonkey 或 Violentmonkey 浏览器扩展（推荐 Tampermonkey，从 Chrome Web Store 或 Firefox Add-ons 下载）。
2. 下载本仓库的 `QZone Praise Automator.js` 文件（点击 Raw > 右键保存，或下载 ZIP 解压）。
3. 打开 Tampermonkey Dashboard（浏览器工具栏 > Tampermonkey > Dashboard）。
4. 点击 “+” 创建新脚本，或通过 “Utilities” > “Import from file” 导入文件。
5. 保存后，脚本将自动启用，匹配 `*://*.qzone.qq.com/*`、`https://i.qq.com/*`、`*://*.ptlogin2.qq.com/*`。

**更新脚本**：在 Tampermonkey Dashboard 中编辑脚本，或重新导入最新版本。

## Usage

+ 脚本加载后，页面右上角会出现 “AL” 浮动按钮。
+ 点击打开控制面板：

  * 核心参数 ：调整刷新频率（秒）、延迟、滚动动态数、每日上限等。
  * 界面自定义 ：设置主题、透明度、背景渐变、文字颜色、暗黑模式等。
  * 过滤规则 ：配置屏蔽用户、白名单、分组、关键词过滤，支持导入/导出。
  * 高级参数 ：最大重试次数、滚动步长、初始延迟、随机延迟范围、日志级别和通知开关。
  * 登录设置 ：启用 autofill、检测间隔、触发阈值等。
  * 查看日志 ：显示系统日志列表，支持搜索、滚动浏览和清除。
  * 性能统计 ：查看点赞/跳过/错误统计、成功率和饼图，支持清除。
  * 账号管理 ：切换多账号配置。
+ 点击 “保存并应用” 立即生效（部分需刷新页面）。
+ 状态栏（页面顶部）实时显示运行状态、剩余时间等，支持点击展开/折叠。
+ 支持暂停/恢复和测试执行按钮。

## Compatibility

* Browsers: Chrome, Firefox
* Extensions: Tampermonkey v4+ or Violentmonkey 示例配置：
* 刷新频率：180 秒
* 点赞延迟：5 秒
* 日志级别：INFO（显示所有日志）

## Changelog

### v2.8.7 (2025-10-14)

- 合并 QZone Auto Login Helper：集成登录检测和 autofill 触发。
- 添加 "登录设置" tab 到控制面板。
- 修正浮动按钮到右上角。
- 新增日志搜索；NaN 处理；内存优化。
- 初始登录检查在 onload 后触发，确保自动登录工作流优先于点赞。

### v2.8.6 (2025-10-14)

* 新增：日志搜索功能（面板内输入框实时过滤）。
* 优化：所有 parseInt 添加 NaN 处理，确保默认值。
* 修复：潜在内存溢出，强化日志清除逻辑。

### v2.8.3 (2025-10-04)

* 新增自动登录检测与提醒（如果检测到登录过期，暂停脚本并通知用户）。
* 优化滚动模拟以支持无限滚动页面（动态检测底部加载元素）。
* 添加配置备份/恢复功能到控制面板。
* 修复多账号切换时日志和统计不隔离的问题。
* 增强暗黑模式兼容性，支持自定义主题色调调整。

完整变更历史见 [CHANGELOG.md](https://github.com/llulun/qzone-praise-automator/blob/main/CHANGELOG.md)。

## Contributing

欢迎贡献！Fork 本仓库，提交 Pull Request。确保代码符合 ESLint 规则，并测试在 Chrome/Firefox 上运行。

- **Issues**：报告 bug 或建议新功能。
- **PRs**：添加新功能、修复 bug 或改进文档。

## License

MIT License. 见 [LICENSE](LICENSE) 文件。

作者：llulun (with contributions)  
仓库: https://github.com/llulun/qzone-praise-automator
问题反馈：https://github.com/llulun/qzone-praise-automator/issues
