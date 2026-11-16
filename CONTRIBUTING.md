# 贡献指南 Contributing Guide

<div align="center">

![QZone Praise Automator](https://img.shields.io/badge/QZone-Praise%20Automator-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.11.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**欢迎为 QZone Praise Automator 贡献代码！** 🎉

</div>

感谢您对本项目的关注和贡献意愿！本项目是一个浏览器用户脚本，旨在为 QQ 空间用户提供自动点赞功能，保持简单、可靠，并面向中文用户友好。

## 📋 目录

- [快速开始](#-快速开始)
- [开发环境设置](#-开发环境设置)
- [贡献类型](#-贡献类型)
- [开发流程](#-开发流程)
- [代码规范](#-代码规范)
- [测试指南](#-测试指南)
- [提交规范](#-提交规范)
- [Pull Request 流程](#-pull-request-流程)
- [问题报告](#-问题报告)
- [社区准则](#-社区准则)

## 🚀 快速开始

### 1. Fork 和克隆仓库

```bash
# Fork 仓库到你的 GitHub 账号
# 然后克隆到本地
git clone https://github.com/YOUR_USERNAME/qzone-praise-automator.git
cd qzone-praise-automator
```

### 2. 创建分支

```bash
# 基于 main 分支创建功能分支
git checkout -b feature/your-feature-name

# 或者创建修复分支
git checkout -b fix/issue-description
```

### 3. 进行开发

- 编辑 `QZone Praise Automator 2.11.0.js` 文件
- 遵循现有的代码风格和结构
- 添加必要的注释和文档

### 4. 提交和推送

```bash
git add .
git commit -m "feat: 添加新功能描述"
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request

在 GitHub 上创建 Pull Request，详细描述您的更改。

## 🛠️ 开发环境设置

### 必需工具

1. **浏览器扩展**（选择其一）：
   - [Tampermonkey](https://www.tampermonkey.net/) （推荐）
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://www.greasespot.net/) （仅 Firefox）

2. **代码编辑器**：
   - [Visual Studio Code](https://code.visualstudio.com/) （推荐）
   - [WebStorm](https://www.jetbrains.com/webstorm/)
   - 或任何支持 JavaScript 的编辑器

3. **Git 版本控制**：
   - [Git](https://git-scm.com/)

### 推荐的 VS Code 扩展

```json
{
  "recommendations": [
    "ms-vscode.vscode-javascript",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "usernamehw.errorlens"
  ]
}
```

### 本地开发设置

1. **安装用户脚本**：

   ```javascript
   // 在 Tampermonkey 中创建新脚本
   // 复制 QZone Praise Automator 2.11.0.js 的内容
   // 保存并启用脚本
   ```

2. **测试环境**：
   - 访问 [QQ 空间](https://qzone.qq.com/)
   - 确保脚本正常加载和运行
   - 检查控制面板和状态栏是否显示

## 🎯 贡献类型

我们欢迎以下类型的贡献：

### 🐛 Bug 修复

- 修复现有功能的问题
- 改进错误处理
- 解决兼容性问题

### ✨ 新功能

- 添加新的自动化功能
- 改进用户界面
- 增强用户体验

### 📚 文档改进

- 更新 README
- 改进代码注释
- 添加使用示例

### 🔧 代码优化

- 性能优化
- 代码重构
- 依赖更新

### 🎨 UI/UX 改进

- 界面美化
- 交互优化
- 响应式设计

## 🔄 开发流程

### 1. 需求提出和讨论

**📝 创建 Issue**

- 在 [Issues](https://github.com/llulun/qzone-praise-automator/issues) 页面创建新条目
- 选择合适的模板：「功能建议」或「Bug 报告」
- 清晰描述现状、目标与动机
- 提供验收标准（例如：在好友动态页，10 分钟内自动点赞不少于 X 条，且不取消已赞）

**💬 方案讨论**

- 策划方：负责范围界定、用户体验与风险提示
- 开发者：负责技术方案、实现可行性与边界条件
- 共同拆解任务，产出最小可行迭代（MVP）与后续增强列表

**✅ 决策共识**

- 通过 Issue 评论或 [Discussions](https://github.com/llulun/qzone-praise-automator/discussions) 达成结论
- 形成「待实现任务清单」与「验收清单」
- 标注里程碑与优先级，避免一次性大改动影响稳定性

### 2. 开发实现

**🔧 技术要求**

- 基于现有分支创建功能分支
- 遵循代码规范和最佳实践
- 进行充分的本地测试

**📤 提交代码**

- 使用规范的提交信息
- 推送到个人 Fork 仓库
- 创建 Pull Request

## 📝 代码规范

### JavaScript 编码规范

```javascript
// ✅ 好的示例
function calculateLikeDelay(baseDelay, randomFactor) {
  const minDelay = baseDelay * 0.8;
  const maxDelay = baseDelay * 1.2;
  return Math.random() * (maxDelay - minDelay) + minDelay;
}

// ❌ 避免的写法
function calc(d, r) {
  return Math.random() * (d * 1.2 - d * 0.8) + d * 0.8;
}
```

### 核心原则

1. **保持轻量**：
   - 不引入大型依赖库
   - 优先使用原生 DOM/JavaScript API
   - 避免破坏现有工作流与 UI

2. **代码风格**：
   - 使用清晰的变量和函数名
   - 避免单字母变量（除循环计数器外）
   - 添加中文用户可读的注释
   - 保持与现有代码风格一致

3. **兼容性**：
   - 仅在 `*://*.qzone.qq.com/*` 相关页面运行
   - 避免对其他站点产生副作用
   - 确保 `@version`、菜单与状态栏的交互一致性

4. **性能与安全**：
   - 滚动与点赞逻辑需考虑节流/防抖
   - 避免过快操作导致取消点赞或被风控
   - 对异常添加日志与重试限制
   - 确保不会陷入死循环

## 🧪 测试指南

### 本地测试清单

在 QQ 空间好友动态页进行以下验证：

- [ ] **基础功能**
  - [ ] 首次加载正确显示控制按钮与状态栏
  - [ ] 能够正确识别点赞按钮
  - [ ] 执行「安全点赞」（不取消已赞）

- [ ] **自动化功能**
  - [ ] 滚动模拟按配置执行
  - [ ] 自动刷新功能正常
  - [ ] 过滤与白名单生效
  - [ ] 每日上限与重试策略正确

- [ ] **UI 测试**
  - [ ] 界面元素正确显示
  - [ ] 响应式设计适配
  - [ ] 无样式冲突

### 测试环境

- **浏览器**：Chrome、Firefox、Edge 最新版本
- **扩展**：Tampermonkey、Violentmonkey
- **页面**：QQ 空间好友动态页

## 📋 提交规范

### Conventional Commits

使用 [约定式提交](https://www.conventionalcommits.org/zh-hans/) 格式：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例

```bash
feat: 添加自定义点赞间隔设置

- 允许用户自定义点赞间隔时间
- 添加随机延迟避免被检测
- 更新设置面板UI

Closes #123
```

## 🔄 Pull Request 流程

### PR 创建清单

- [ ] **基本信息**
  - [ ] 清晰的标题和描述
  - [ ] 关联相关 Issue
  - [ ] 选择正确的目标分支

- [ ] **变更说明**
  - [ ] 变更概述与动机
  - [ ] 影响范围（行为、UI、性能、兼容性）
  - [ ] 验收步骤
  - [ ] 截图/录屏（如有 UI 改动）

- [ ] **质量检查**
  - [ ] 代码符合规范
  - [ ] 通过本地测试
  - [ ] 无明显性能问题

### PR 模板

```markdown
## 📝 变更描述

简要描述本次变更的内容和目的。

## 🔗 关联 Issue

Closes #123

## 📋 变更类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 🧪 测试说明

描述如何测试这些变更：

1. 步骤一
2. 步骤二
3. 步骤三

## 📸 截图/录屏

（如有 UI 变更，请提供前后对比）

## ⚠️ 注意事项

列出任何需要特别注意的事项或已知风险。
```

## 🐛 问题报告

### Bug 报告模板

在 [Issues](https://github.com/llulun/qzone-praise-automator/issues) 页面提交问题时，请包含：

1. **环境信息**：
   - 浏览器版本
   - 脚本管理器版本
   - 脚本版本

2. **问题描述**：
   - 复现步骤
   - 期望行为
   - 实际结果
   - 错误截图

3. **日志信息**：
   - 浏览器控制台错误
   - 脚本日志输出

### 安全问题

对于安全或隐私相关问题，请通过以下方式联系：

- 📧 邮箱：`mail@llulun.top`
- 🔒 请勿在公开 Issue 中披露安全漏洞

## 🤝 社区准则

### 行为准则

我们致力于为所有人提供友好、安全和欢迎的环境，无论：

- 性别、性别认同和表达
- 性取向
- 残疾
- 外貌
- 身体大小
- 种族
- 年龄
- 宗教

### 预期行为

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 不当行为

- 使用性化的语言或图像
- 人身攻击或政治攻击
- 公开或私下的骚扰
- 未经许可发布他人的私人信息
- 其他在专业环境中可能被认为不当的行为

## 📞 联系方式

- **项目维护者**：[@llulun](https://github.com/llulun)
- **邮箱**：mail@llulun.top
- **项目主页**：https://github.com/llulun/qzone-praise-automator
- **问题反馈**：https://github.com/llulun/qzone-praise-automator/issues
- **讨论区**：https://github.com/llulun/qzone-praise-automator/discussions

---

<div align="center">

**感谢您的贡献！** 🙏

让我们一起让 QZone Praise Automator 变得更好！

</div>
