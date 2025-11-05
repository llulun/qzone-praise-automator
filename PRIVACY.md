# 仓库级隐私政策（Repository Privacy Policy）

最近更新日期：2025-11-05

本隐私政策适用于本仓库内所有应用/脚本，包括但不限于：
- QZone Praise Automator（自动点赞脚本）
- QZone Auto Login Helper（自动登录辅助脚本）

## 总原则

- 本仓库的脚本不收集、不上传、也不向任何服务器传输你的个人信息（如账号、密码、浏览记录等）。
- 脚本仅在你的浏览器本地运行，使用浏览器原生 API 与页面 DOM 接口。

## 本地存储（localStorage）

### 自动点赞脚本

- 不保存账号与密码，不收集个人数据。
- 可能保存运行参数或开关（若有），仅用于功能性配置（具体以脚本实现为准）。

### 自动登录辅助脚本

- 保存项包括：
  - 登录方式（`lh-loginMethod`）、禁用回退（`lh-disableFallback`）、临时标准化字段名（`lh-standardizeNames`）
  - 检测间隔（`lh-checkInterval`）、自动触发阈值（`lh-autoTriggerThreshold`）
  - 状态栏与面板颜色（`lh-statusBgColor/lh-statusTextColor/lh-menuBgColor/lh-menuTextColor`）
  - 本地保存的账号与密码（`lh-savedUsername/lh-savedPassword`，以明文存储在浏览器 localStorage）
  - 优先登录页 URL（`lh-preferredLoginUrl`）

> 重要说明：凭据仅保存在你的本地浏览器，默认不加密。请在私人设备上使用，并妥善管理浏览器数据。

## 数据清理

- 在登录辅助脚本的控制面板点击“清除本地保存的账号与密码”一键清除。
- 通过浏览器设置清理站点存储或在开发者工具执行：
  - `localStorage.removeItem('lh-savedUsername');`
  - `localStorage.removeItem('lh-savedPassword');`

## 第三方服务与脚本

- 本仓库不使用第三方云服务或统计 SDK。
- 脚本仅依赖浏览器原生能力。

## 安全建议

- 为账号设置强密码并定期更换。
- 在可能的情况下启用官方多因素认证（如手机扫码确认）。
- 保持浏览器与脚本管理器（Tampermonkey/Violentmonkey）更新。

## 政策更新

如隐私政策发生变更，将更新“最近更新日期”。建议定期查看本文件。

## 联系与反馈

- 欢迎通过 Issue 或邮件反馈隐私与安全相关问题。