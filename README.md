# QZone Praise Automator

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.11.0-blue.svg)](https://github.com/llulun/qzone-praise-automator/releases/tag/v2.11.0)
[![Stars](https://img.shields.io/github/stars/llulun/qzone-praise-automator)](https://github.com/llulun/qzone-praise-automator/stargazers)
[![Forks](https://img.shields.io/github/forks/llulun/qzone-praise-automator)](https://github.com/llulun/qzone-praise-automator/network/members)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Compatible-green.svg)](https://www.tampermonkey.net/)

**🚀 智能化 QQ 空间自动点赞工具 | 功能丰富 | 界面精美 | 高度可定制**

</div>

<!-- 🧭 快速导航：参考优秀开源项目的入口式导航，方便用户在多应用仓库中快速定位文档 -->
<div align="center">

**🧭 快速导航**  
[项目总览](docs/OVERVIEW.md) · [应用列表](docs/APPS.md) · [自动登录脚本说明](qzone-auto-login-helper/README.md) · [仓库隐私政策](PRIVACY.md) · [自动登录隐私政策](qzone-auto-login-helper/PRIVACY.md) · [更新日志](CHANGELOG.md) · [贡献指南](CONTRIBUTING.md) · [行为准则](CODE_OF_CONDUCT.md) · [安全策略](SECURITY.md) · [开源许可证](LICENSE)

</div>

## 📖 项目简介

QZone Praise Automator 是一个功能强大的网页版 QQ 空间自动点赞工具，专为提升用户体验而设计。支持智能检测好友动态、自动点赞、滚动加载、定时刷新等核心功能。

### ✨ 核心特性

- 🎯 **智能点赞** - 自动检测并点赞好友动态，支持安全防重复机制
- 🎨 **精美界面** - 8种主题预设，支持暗黑模式和自定义样式
- 📊 **数据可视化** - 饼图展示点赞统计，实时监控性能数据
- 🔧 **高度可定制** - 丰富的配置选项，满足不同用户需求
- 📱 **响应式设计** - 适配各种屏幕尺寸，提供最佳体验
- 🛡️ **安全可靠** - 内置登录检测、错误处理和数据备份功能
![Control Panel](docs/control-panel.png)

## 🎯 功能特性

### 🤖 自动化功能
- **智能点赞** - 检测好友动态页面，安全点赞未赞内容，防止重复点赞导致取消
- **滚动模拟** - 模拟用户滚动行为，自动加载更多动态，确保完整覆盖
- **定时刷新** - 智能刷新页面，保持活跃状态，避免登录过期
- **登录检测** - 自动检测登录状态，支持自动重登录功能

### 🎨 界面与体验
- **精美主题** - 8种预设主题（默认、科技、生态、暗黑、紫色、日落、海洋、樱花）
- **响应式设计** - 适配各种屏幕尺寸，提供最佳视觉体验
- **微交互动画** - 涟漪效果、按钮反馈、加载动画等精致交互
- **暗黑模式** - 自动适配系统主题，保护视力

### 📊 数据与监控
- **可视化统计** - 饼图展示点赞数据，直观了解使用情况
- **性能监控** - 实时统计点赞成功率、跳过和错误次数
- **日志系统** - 支持 INFO/WARN/ERROR 级别，带时间戳的详细日志
- **数据导出** - 支持导出日志为 JSON 文件，便于调试分析

### ⚙️ 高级配置
- **过滤规则** - 动态关键词过滤（屏蔽/允许模式），支持正则表达式
- **用户管理** - 屏蔽用户、白名单、分组管理功能
- **限制控制** - 每日点赞上限设置，避免过度使用
- **多账号支持** - 切换不同账号配置，数据隔离存储

### 🛡️ 安全与稳定
- **安全机制** - 内置防重复点赞、错误重试、异常处理
- **数据备份** - 配置备份/恢复功能，防止数据丢失
- **兼容性** - 兼容主流浏览器，优化性能表现
- **辅助工具** - 可与 [QZone Auto Login Helper](qzone-auto-login-helper/README.md) 结合使用

## 🚀 快速开始

### 📦 安装步骤

1. **安装浏览器扩展**
   - 推荐使用 [Tampermonkey](https://www.tampermonkey.net/) （Chrome/Edge/Firefox）
   - 或者使用 [Violentmonkey](https://violentmonkey.github.io/) 作为替代

2. **获取脚本**
   ```bash
   # 方式一：直接下载
   wget https://github.com/llulun/qzone-praise-automator/raw/main/QZone%20Praise%20Automator%202.11.0.js
   
   # 方式二：克隆仓库
   git clone https://github.com/llulun/qzone-praise-automator.git
   ```

3. **安装脚本**
   - 打开 Tampermonkey Dashboard（浏览器工具栏 → Tampermonkey → 管理面板）
   - 点击 "+" 创建新脚本，或通过 "实用工具" → "从文件导入" 导入
   - 复制脚本内容并保存，脚本将自动启用

4. **验证安装**
   - 访问 [QQ空间](https://qzone.qq.com) 
   - 页面右上角应出现 "AL Menu" 浮动按钮

### 📱 使用指南

#### 🎛️ 控制面板
点击 "AL Menu" 按钮打开控制面板，包含以下功能模块：

| 模块 | 功能描述 |
|------|----------|
| **核心参数** | 刷新频率、点赞延迟、滚动数量、每日上限等基础设置 |
| **界面定制** | 8种主题选择、透明度、颜色、暗黑模式等视觉设置 |
| **过滤规则** | 屏蔽用户、白名单、关键词过滤（支持正则表达式） |
| **高级设置** | 重试次数、滚动步长、随机延迟、日志级别等专业配置 |
| **日志查看** | 实时日志显示，支持搜索、清除、导出为 JSON |
| **性能统计** | 点赞成功率、饼图可视化、数据清除功能 |
| **账号管理** | 多账号配置切换，数据隔离存储 |

#### 📊 状态栏
页面顶部的状态栏实时显示：
- 🎯 当前任务进度和剩余时间
- 📈 点赞统计和成功率
- ⚙️ 运行参数和状态信息
- 🎮 暂停/恢复控制按钮

#### ⌨️ 快捷操作
- **暂停/恢复**：点击状态栏中的暂停按钮
- **测试执行**：在控制面板中点击测试按钮
- **配置重置**：恢复默认设置
- **数据导出**：备份配置和日志数据

## 🔧 兼容性

### 浏览器支持
| 浏览器 | 版本要求 | 状态 |
|--------|----------|------|
| Chrome | 80+ | ✅ 完全支持 |
| Firefox | 75+ | ✅ 完全支持 |
| Edge | 80+ | ✅ 完全支持 |
| Safari | 14+ | ⚠️ 部分支持 |

### 扩展支持
| 扩展 | 版本要求 | 推荐度 |
|------|----------|--------|
| Tampermonkey | 4.0+ | ⭐⭐⭐⭐⭐ |
| Violentmonkey | 2.12+ | ⭐⭐⭐⭐ |
| Greasemonkey | 4.0+ | ⭐⭐⭐ |

### 推荐配置
```javascript
// 基础配置示例
{
  "refreshDelay": 180,     // 刷新频率：180秒
  "likeDelay": 5,          // 点赞延迟：5秒
  "scrollCount": 10,       // 滚动数量：10次
  "dailyLimit": 100,       // 每日上限：100个
  "logLevel": "INFO"       // 日志级别：显示所有日志
}
```

## 📋 更新日志

### 🎉 v2.11.0 (2025-10-26) - 最新版本
- ✨ **全面UI界面美化与优化**
  - 新增饼图数据可视化展示点赞统计
  - 优化状态栏显示效果（进度条动画、脉冲效果、滑入动画）
  - 重构控制面板布局（卡片式设计、过渡动画、响应式布局）
- 🎨 **主题系统升级**
  - 实现8种精美主题预设（默认、科技、生态、暗黑、紫色、日落、海洋、樱花）
  - 添加主题实时预览功能
- 🔧 **代码优化**
  - 清理重复函数定义和变量声明
  - 优化CSS样式，移除冗余样式定义
  - 改善代码结构和格式，提升维护性

### 🔄 v2.8.9 (2025-10-16)
- 📤 在控制面板的日志标签添加导出日志按钮
- 💾 允许用户下载日志为JSON文件，便于调试和分享

### 🔄 v2.8.8 (2025-10-15)
- 💾 使日志存储持久化，使用localStorage存储日志
- 🔄 避免页面刷新后日志丢失

### 🔄 v2.8.7 (2025-10-14)
- 👁️ 添加MutationObserver监控动态内容加载
- 📈 提高脚本对QQ空间无限滚动的响应性和稳定性
- 🛡️ 优化safeLike以避免重复触发

### 🔄 v2.8.6 (2025-10-13)
- 🔐 增强登录检测：添加自动重登录选项
- 🔄 检测到过期时可选重定向到登录页
- ⏱️ 添加冷却机制防止循环

### 🔄 v2.8.5 (2025-10-12)
- 💾 增强存储功能，使用localStorage存储性能统计数据
- 🔄 确保网页刷新后统计数据不会清空

### 🔄 v2.8.4 (2025-10-11)
- 🐛 修复控制面板浮动按钮被状态栏遮挡的问题
- 📱 提高浮动按钮z-index至10003

### 🔄 v2.8.3 (2025-10-10)
- 🔐 新增自动登录检测与提醒功能
- 📜 优化滚动模拟以支持无限滚动页面
- 💾 添加配置备份/恢复功能到控制面板
- 🌙 增强暗黑模式兼容性

### 🔄 v2.8.2 (2025-10-04)
- 🐛 修复关键词屏蔽不生效问题
- 🛡️ 加强已赞动态检测，防止重复点赞
- 📝 优化日志记录，添加详细匹配信息

### 🔄 v2.8.1 (2025-10-04)
- 🐛 修复动态元素事件监听器添加问题
- 🔧 优化JSON解析错误处理

### 🎨 v2.8.0 (2025-10-04) - 重大更新
- 🎨 UI美化升级：主题系统、响应式设计、微交互
- 🔍 新增动态关键词过滤（屏蔽/允许模式，支持正则）
- 👥 黑名单扩展：分组、白名单、导入/导出
- 📊 新增每日点赞上限、浏览器通知、性能监控
- 👤 多账号支持功能

### 📝 v2.7.2 (2025-09-23)
- 📋 新增系统日志模块（INFO/WARN/ERROR级别）
- 🕒 日志带时间戳，支持面板查看和清除
- 🔧 优化日志存储机制

<details>
<summary>查看更多历史版本</summary>

### v2.6.x 及更早版本
- 🔧 优化点赞逻辑，防止重复调用
- 🎨 美化状态栏：添加进度条、emoji
- 🐛 各种bug修复和性能优化

</details>

> 📖 完整变更历史请查看 [CHANGELOG.md](https://github.com/llulun/qzone-praise-automator/blob/main/CHANGELOG.md)

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是报告 bug、提出新功能建议，还是提交代码改进。

### 📋 贡献流程

1. **🔍 提出问题**
   - 通过 [Issues](https://github.com/llulun/qzone-praise-automator/issues) 报告 bug 或建议新功能
   - 提供详细的问题描述和复现步骤
   - 对于新功能，请说明使用场景和预期效果

2. **🔧 开发贡献**
   - Fork 本仓库到你的 GitHub 账户
   - 创建功能分支：`git checkout -b feature/your-feature-name`
   - 使用约定式提交格式：`feat: 添加新功能` 或 `fix: 修复bug`
   - 确保代码通过测试并在 Chrome/Firefox 上验证

3. **📤 提交 Pull Request**
   - 提供清晰的 PR 描述和变更说明
   - 对于 UI 改动，请附上前后对比截图
   - 包含测试步骤和验证方法
   - 等待代码审查和合并

### 🛠️ 开发规范

- **代码风格**：遵循 ESLint 规则
- **测试要求**：确保在主流浏览器上正常运行
- **文档更新**：重要变更需同步更新文档

### 📞 联系方式

- **Issues**：[GitHub Issues](https://github.com/llulun/qzone-praise-automator/issues)
- **Discussions**：[GitHub Discussions](https://github.com/llulun/qzone-praise-automator/discussions)

> 详细的贡献指南请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

```
MIT License

Copyright (c) 2025 llulun

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 📞 联系信息

- **👨‍💻 作者**：[llulun](https://github.com/llulun)
- **🏠 仓库**：https://github.com/llulun/qzone-praise-automator
- **🐛 问题反馈**：https://github.com/llulun/qzone-praise-automator/issues
- **💬 讨论交流**：https://github.com/llulun/qzone-praise-automator/discussions

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！**

[![Star History Chart](https://api.star-history.com/svg?repos=llulun/qzone-praise-automator&type=Date)](https://star-history.com/#llulun/qzone-praise-automator&Date)

</div>

---

## 🧩 多应用总览

本仓库包含多个应用（脚本/代码），支持独立或组合使用：

- 自动点赞脚本（本页）
- 自动登录辅助脚本：详见子模块说明文档 → [qzone-auto-login-helper/README.md](qzone-auto-login-helper/README.md)
- 项目总览与应用清单：
  - 总览 → [docs/OVERVIEW.md](docs/OVERVIEW.md)
  - 应用列表 → [docs/APPS.md](docs/APPS.md)

组合推荐：同时安装“自动登录辅助脚本”和“自动点赞脚本”。当登录过期或页面嵌入跨域登录框时，登录辅助脚本将自动跳转同源登录页并填入你的本地保存凭据，登录成功后自动点赞脚本继续执行，保障流程不中断。

## 🔒 隐私政策

- 仓库级隐私政策（覆盖所有应用）→ [PRIVACY.md](PRIVACY.md)
- 自动登录辅助脚本隐私政策（子模块）→ [qzone-auto-login-helper/PRIVACY.md](qzone-auto-login-helper/PRIVACY.md)