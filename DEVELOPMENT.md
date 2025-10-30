# 开发指南 Development Guide

<div align="center">

![Development](https://img.shields.io/badge/Development-Guide-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.11.0-green?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge)

**QZone Praise Automator 开发环境搭建和调试指南** 🛠️

</div>

## 📋 目录

- [开发环境要求](#-开发环境要求)
- [环境搭建](#-环境搭建)
- [项目结构](#-项目结构)
- [开发流程](#-开发流程)
- [调试技巧](#-调试技巧)
- [代码规范](#-代码规范)
- [测试指南](#-测试指南)
- [构建和发布](#-构建和发布)
- [常见问题](#-常见问题)

## 🔧 开发环境要求

### 必需软件

| 软件 | 版本要求 | 说明 |
| --- | --- | --- |
| **浏览器** | 最新版本 | Chrome/Firefox/Edge |
| **用户脚本管理器** | 最新版本 | Tampermonkey（推荐）/Violentmonkey |
| **代码编辑器** | 任意 | VS Code（推荐）/WebStorm |
| **Git** | 2.0+ | 版本控制 |
| **Node.js** | 16.0+ | 可选，用于代码检查和工具 |

### 推荐配置

#### VS Code 扩展
```json
{
  "recommendations": [
    "ms-vscode.vscode-javascript",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "usernamehw.errorlens",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ]
}
```

#### VS Code 设置
```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true
}
```

## 🚀 环境搭建

### 1. 获取代码

```bash
# 方式一：Fork 后克隆（推荐用于贡献代码）
git clone https://github.com/YOUR_USERNAME/qzone-praise-automator.git
cd qzone-praise-automator

# 方式二：直接克隆（仅用于学习）
git clone https://github.com/llulun/qzone-praise-automator.git
cd qzone-praise-automator
```

### 2. 安装浏览器扩展

#### Tampermonkey（推荐）
- **Chrome**: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **Edge**: [Microsoft Store](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

#### Violentmonkey（备选）
- **Chrome**: [Chrome Web Store](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)

### 3. 安装开发脚本

#### 方法一：通过 Tampermonkey 安装
1. 打开 Tampermonkey 管理面板
2. 点击 "+" 创建新脚本
3. 复制 `QZone Praise Automator 2.11.0.js` 的完整内容
4. 粘贴到编辑器中
5. 保存脚本（Ctrl+S）

#### 方法二：通过文件安装
1. 在 Tampermonkey 管理面板中选择 "实用工具"
2. 选择 "从文件安装"
3. 选择项目中的 `.js` 文件

### 4. 可选：安装开发工具

```bash
# 安装 Node.js 依赖（可选）
npm install

# 或使用 yarn
yarn install
```

## 📁 项目结构

```
qzone-praise-automator/
├── 📄 QZone Praise Automator 2.11.0.js  # 主脚本文件
├── 📄 README.md                          # 项目说明
├── 📄 CHANGELOG.md                       # 更新日志
├── 📄 CONTRIBUTING.md                    # 贡献指南
├── 📄 DEVELOPMENT.md                     # 开发指南（本文件）
├── 📄 SECURITY.md                        # 安全政策
├── 📄 LICENSE                            # 许可证
├── 📄 .gitignore                         # Git 忽略规则
├── 📄 package.json                       # Node.js 配置（可选）
├── 📁 .github/                           # GitHub 配置
│   ├── 📁 ISSUE_TEMPLATE/               # Issue 模板
│   │   ├── 📄 bug_report.yml
│   │   ├── 📄 feature_request.yml
│   │   ├── 📄 question.yml
│   │   └── 📄 config.yml
│   ├── 📄 pull_request_template.md      # PR 模板
│   └── 📁 workflows/                    # GitHub Actions
│       └── 📄 npm-publish.yml
└── 📁 docs/                             # 文档目录（可选）
```

### 核心文件说明

#### 主脚本文件
- **文件名**: `QZone Praise Automator 2.11.0.js`
- **作用**: 包含所有功能代码
- **结构**: 
  - 脚本头部元数据
  - 全局变量和配置
  - 核心功能函数
  - UI 组件
  - 事件处理
  - 初始化代码

#### 配置文件
- **package.json**: Node.js 项目配置（可选）
- **.gitignore**: Git 忽略规则
- **各种 .md 文件**: 项目文档

## 🔄 开发流程

### 1. 创建开发分支

```bash
# 创建并切换到新分支
git checkout -b feature/your-feature-name

# 或者修复分支
git checkout -b fix/issue-description
```

### 2. 开发环境配置

#### 启用开发模式
在脚本中添加开发标志：
```javascript
// 在脚本顶部添加
const DEV_MODE = true;

// 使用开发模式日志
function devLog(message, ...args) {
  if (DEV_MODE) {
    console.log(`[QZone Dev] ${message}`, ...args);
  }
}
```

#### 热重载设置
1. 在 Tampermonkey 中启用脚本的"自动更新"
2. 设置更新 URL 为本地文件路径（如果支持）
3. 或者手动刷新页面测试更改

### 3. 代码编辑

#### 推荐的编辑流程
1. **小步迭代**: 每次只修改一个功能
2. **频繁测试**: 每次修改后立即测试
3. **版本控制**: 及时提交有意义的更改
4. **代码审查**: 自我审查代码质量

#### 实时调试
```javascript
// 在关键位置添加调试信息
console.log('Debug: 当前状态', currentState);
console.table(configObject);
console.time('性能测试');
// ... 代码 ...
console.timeEnd('性能测试');
```

### 4. 测试验证

#### 基础功能测试
- [ ] 脚本正常加载
- [ ] 控制面板显示
- [ ] 状态栏显示
- [ ] 基本点赞功能
- [ ] 配置保存/加载

#### 兼容性测试
- [ ] Chrome + Tampermonkey
- [ ] Firefox + Tampermonkey
- [ ] Edge + Tampermonkey
- [ ] 不同屏幕分辨率

### 5. 提交代码

```bash
# 添加更改
git add .

# 提交更改（使用规范的提交信息）
git commit -m "feat: 添加新功能描述"

# 推送到远程仓库
git push origin feature/your-feature-name
```

## 🐛 调试技巧

### 1. 浏览器开发者工具

#### 控制台调试
```javascript
// 查看脚本状态
console.log('脚本版本:', GM_info.script.version);
console.log('当前配置:', JSON.stringify(config, null, 2));

// 性能监控
console.time('点赞操作');
// ... 点赞代码 ...
console.timeEnd('点赞操作');

// 错误捕获
try {
  // 可能出错的代码
} catch (error) {
  console.error('错误详情:', error);
  console.trace(); // 显示调用栈
}
```

#### 网络监控
1. 打开开发者工具 (F12)
2. 切换到 "Network" 标签
3. 监控 AJAX 请求和响应
4. 检查请求头和响应数据

#### 元素检查
1. 右键点击页面元素
2. 选择 "检查元素"
3. 查看 DOM 结构和 CSS 样式
4. 测试 CSS 选择器

### 2. Tampermonkey 调试

#### 脚本日志
```javascript
// 使用 GM_log 记录日志
GM_log('这是一条日志信息');

// 查看日志：Tampermonkey 管理面板 -> 脚本 -> 日志
```

#### 脚本信息
```javascript
// 获取脚本信息
console.log('脚本信息:', GM_info);
console.log('脚本名称:', GM_info.script.name);
console.log('脚本版本:', GM_info.script.version);
```

### 3. 常用调试代码片段

#### 元素查找调试
```javascript
function debugSelector(selector) {
  const elements = document.querySelectorAll(selector);
  console.log(`选择器 "${selector}" 找到 ${elements.length} 个元素:`, elements);
  return elements;
}

// 使用示例
debugSelector('.like-button');
```

#### 事件监听调试
```javascript
function debugEvent(element, eventType) {
  element.addEventListener(eventType, function(e) {
    console.log(`事件 ${eventType} 被触发:`, e);
  });
}

// 使用示例
debugEvent(document, 'click');
```

#### 配置调试
```javascript
function debugConfig() {
  console.group('配置信息');
  console.log('当前配置:', config);
  console.log('默认配置:', defaultConfig);
  console.log('存储的配置:', GM_getValue('config'));
  console.groupEnd();
}
```

## 📏 代码规范

### 1. JavaScript 编码规范

#### 变量命名
```javascript
// ✅ 好的命名
const likeButtonSelector = '.like-button';
const maxLikesPerDay = 100;
const isAutoLikeEnabled = true;

// ❌ 避免的命名
const btn = '.like-button';
const max = 100;
const flag = true;
```

#### 函数定义
```javascript
// ✅ 好的函数定义
function calculateLikeDelay(baseDelay, randomFactor) {
  const minDelay = baseDelay * (1 - randomFactor);
  const maxDelay = baseDelay * (1 + randomFactor);
  return Math.random() * (maxDelay - minDelay) + minDelay;
}

// ✅ 箭头函数（简单逻辑）
const formatTime = (timestamp) => new Date(timestamp).toLocaleString();
```

#### 注释规范
```javascript
/**
 * 执行自动点赞操作
 * @param {HTMLElement} likeButton - 点赞按钮元素
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Promise<boolean>} 是否成功点赞
 */
async function performLike(likeButton, delay) {
  // 检查按钮是否可点击
  if (!likeButton || likeButton.disabled) {
    return false;
  }
  
  // 添加延迟避免被检测
  await sleep(delay);
  
  // 执行点击操作
  likeButton.click();
  return true;
}
```

### 2. CSS 规范

```css
/* QZone Praise Automator 样式 */
.qzone-praise-automator {
  /* 使用有意义的类名 */
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 9999;
}

.qzone-praise-automator__panel {
  /* BEM 命名规范 */
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.qzone-praise-automator__button--primary {
  /* 修饰符命名 */
  background-color: #1976d2;
  color: white;
}
```

### 3. 提交信息规范

```bash
# 格式：<类型>(<范围>): <描述>

# 功能
feat: 添加自定义点赞间隔设置
feat(ui): 改进控制面板布局

# 修复
fix: 修复点赞按钮识别问题
fix(config): 修复配置保存失败的问题

# 文档
docs: 更新 README 安装说明
docs(api): 添加函数注释

# 样式
style: 统一代码缩进格式

# 重构
refactor: 重构点赞逻辑代码

# 性能
perf: 优化页面滚动性能

# 测试
test: 添加配置验证测试

# 构建
chore: 更新依赖版本
```

## 🧪 测试指南

### 1. 手动测试清单

#### 基础功能测试
```markdown
- [ ] 脚本加载
  - [ ] 页面刷新后脚本正常加载
  - [ ] 控制面板正确显示
  - [ ] 状态栏正确显示
  
- [ ] 点赞功能
  - [ ] 手动点赞正常工作
  - [ ] 自动点赞正常工作
  - [ ] 不会取消已有的赞
  - [ ] 遵守点赞间隔设置
  
- [ ] 配置功能
  - [ ] 配置保存正常
  - [ ] 配置加载正常
  - [ ] 默认配置正确
  
- [ ] UI 功能
  - [ ] 按钮响应正常
  - [ ] 状态更新及时
  - [ ] 样式显示正确
```

#### 兼容性测试
```markdown
- [ ] 浏览器兼容性
  - [ ] Chrome 最新版
  - [ ] Firefox 最新版
  - [ ] Edge 最新版
  
- [ ] 脚本管理器兼容性
  - [ ] Tampermonkey
  - [ ] Violentmonkey
  
- [ ] 分辨率兼容性
  - [ ] 1920x1080
  - [ ] 1366x768
  - [ ] 移动端视图
```

### 2. 自动化测试

#### 单元测试示例
```javascript
// 测试配置验证函数
function testConfigValidation() {
  console.group('配置验证测试');
  
  // 测试有效配置
  const validConfig = {
    autoLike: true,
    likeDelay: 2000,
    maxLikesPerDay: 100
  };
  console.assert(validateConfig(validConfig), '有效配置应该通过验证');
  
  // 测试无效配置
  const invalidConfig = {
    autoLike: 'true', // 应该是布尔值
    likeDelay: -1000, // 应该是正数
    maxLikesPerDay: 'unlimited' // 应该是数字
  };
  console.assert(!validateConfig(invalidConfig), '无效配置应该被拒绝');
  
  console.groupEnd();
}

// 运行测试
if (DEV_MODE) {
  testConfigValidation();
}
```

#### 性能测试
```javascript
function performanceTest() {
  console.group('性能测试');
  
  // 测试点赞按钮查找性能
  console.time('查找点赞按钮');
  const buttons = findLikeButtons();
  console.timeEnd('查找点赞按钮');
  console.log(`找到 ${buttons.length} 个点赞按钮`);
  
  // 测试配置加载性能
  console.time('加载配置');
  const config = loadConfig();
  console.timeEnd('加载配置');
  
  console.groupEnd();
}
```

### 3. 测试数据

#### 测试配置
```javascript
const testConfigs = {
  minimal: {
    autoLike: false,
    likeDelay: 1000,
    maxLikesPerDay: 10
  },
  
  normal: {
    autoLike: true,
    likeDelay: 2000,
    maxLikesPerDay: 50,
    enableWhitelist: false,
    enableBlacklist: false
  },
  
  advanced: {
    autoLike: true,
    likeDelay: 3000,
    maxLikesPerDay: 100,
    enableWhitelist: true,
    whitelist: ['friend1', 'friend2'],
    enableBlacklist: true,
    blacklist: ['spam_user'],
    autoScroll: true,
    scrollDelay: 5000
  }
};
```

## 🚀 构建和发布

### 1. 版本管理

#### 版本号规则
- **主版本号**: 重大功能变更或不兼容更新
- **次版本号**: 新功能添加，向后兼容
- **修订版本号**: Bug 修复和小改进

#### 更新版本号
```javascript
// 在脚本头部更新
// @version      2.11.1

// 在代码中更新
const SCRIPT_VERSION = '2.11.1';
```

### 2. 发布清单

#### 发布前检查
```markdown
- [ ] 代码质量
  - [ ] 代码审查完成
  - [ ] 测试通过
  - [ ] 性能检查
  - [ ] 安全检查
  
- [ ] 文档更新
  - [ ] README.md
  - [ ] CHANGELOG.md
  - [ ] 版本号更新
  
- [ ] 兼容性确认
  - [ ] 多浏览器测试
  - [ ] 多脚本管理器测试
  
- [ ] 发布准备
  - [ ] 创建 Git 标签
  - [ ] 准备发布说明
```

#### 发布流程
```bash
# 1. 确保在 main 分支
git checkout main
git pull origin main

# 2. 合并开发分支
git merge feature/your-feature

# 3. 更新版本号和文档
# 编辑相关文件...

# 4. 提交版本更新
git add .
git commit -m "chore: 发布版本 2.11.1"

# 5. 创建标签
git tag -a v2.11.1 -m "版本 2.11.1"

# 6. 推送到远程
git push origin main
git push origin v2.11.1
```

### 3. GitHub Release

#### 创建 Release
1. 访问 GitHub 仓库页面
2. 点击 "Releases" -> "Create a new release"
3. 选择刚创建的标签
4. 填写发布标题和说明
5. 上传脚本文件（可选）
6. 发布 Release

#### Release 说明模板
```markdown
## 🎉 版本 2.11.1 发布

### ✨ 新功能
- 添加自定义点赞间隔设置
- 改进用户界面布局

### 🐛 Bug 修复
- 修复点赞按钮识别问题
- 修复配置保存失败的问题

### 🔧 改进
- 优化性能，减少内存占用
- 改进错误处理机制

### 📋 完整更新日志
查看 [CHANGELOG.md](./CHANGELOG.md) 获取详细信息。

### 📥 安装方法
1. 安装 [Tampermonkey](https://www.tampermonkey.net/)
2. 点击下方的脚本文件进行安装
3. 访问 QQ 空间即可使用

### 🔗 相关链接
- [使用文档](./README.md)
- [问题反馈](https://github.com/llulun/qzone-praise-automator/issues)
- [讨论区](https://github.com/llulun/qzone-praise-automator/discussions)
```

## ❓ 常见问题

### 1. 开发环境问题

#### Q: 脚本无法加载？
**A**: 检查以下几点：
- Tampermonkey 是否正确安装和启用
- 脚本是否保存并启用
- 浏览器是否允许扩展运行
- 检查控制台是否有错误信息

#### Q: 修改代码后没有生效？
**A**: 尝试以下解决方法：
- 刷新页面（F5 或 Ctrl+R）
- 重新保存脚本（Ctrl+S）
- 清除浏览器缓存
- 重启浏览器

#### Q: 如何查看脚本日志？
**A**: 
1. 打开浏览器开发者工具（F12）
2. 切换到 "Console" 标签
3. 查看以 `[QZone]` 开头的日志信息

### 2. 调试问题

#### Q: 如何调试特定功能？
**A**: 
```javascript
// 在相关函数中添加调试代码
function debugFunction() {
  console.log('函数开始执行');
  console.log('当前参数:', arguments);
  
  // 原有代码...
  
  console.log('函数执行完成');
}
```

#### Q: 如何测试不同配置？
**A**: 
```javascript
// 临时修改配置进行测试
const originalConfig = {...config};
config.autoLike = false; // 临时修改
// 测试代码...
config = originalConfig; // 恢复原配置
```

### 3. 性能问题

#### Q: 脚本运行缓慢？
**A**: 检查以下几点：
- 减少 DOM 查询频率
- 使用事件委托而不是大量事件监听器
- 避免在循环中进行复杂计算
- 使用 `requestAnimationFrame` 优化动画

#### Q: 内存占用过高？
**A**: 
- 及时清理不需要的变量和事件监听器
- 避免创建过多的闭包
- 使用 WeakMap 和 WeakSet 存储临时数据

### 4. 兼容性问题

#### Q: 在某个浏览器中不工作？
**A**: 
- 检查浏览器版本是否支持使用的 JavaScript 特性
- 查看控制台错误信息
- 测试基础功能是否正常
- 考虑添加 polyfill 或降级方案

#### Q: 与其他脚本冲突？
**A**: 
- 使用命名空间避免全局变量冲突
- 检查 CSS 选择器是否过于宽泛
- 使用 `@noframes` 避免在 iframe 中运行

---

<div align="center">

**祝您开发愉快！** 🎉

如有问题，请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 或创建 [Issue](https://github.com/llulun/qzone-praise-automator/issues)

</div>
