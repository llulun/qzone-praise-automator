# 隐私政策（Privacy Policy）

最近更新日期：2025-11-05

## 引言

QZone Auto Login Helper（下称“本脚本”）非常重视你的隐私与数据安全。本隐私政策说明本脚本在使用过程中如何处理你的数据。

## 数据收集与传输

- 本脚本不收集、不上传、也不向任何服务器传输你的个人信息（如账号、密码等）。
- 本脚本不包含任何遥测、埋点或第三方统计代码。

## 本地存储（localStorage）

本脚本在浏览器 `localStorage` 中保存以下配置项与数据：

- `lh-loginMethod`、`lh-disableFallback`、`lh-standardizeNames`、`lh-checkInterval`、`lh-autoTriggerThreshold`
- `lh-statusBgColor`、`lh-statusTextColor`、`lh-menuBgColor`、`lh-menuTextColor`
- `lh-savedUsername`、`lh-savedPassword`（你的账号与密码，明文保存在本地浏览器）
- `lh-preferredLoginUrl`（可选，用于优先跳转的登录页 URL）

### 重要提示

- 你保存的账号与密码仅保存在你本地浏览器（`localStorage`）中，默认不加密。
- 请在私人设备上使用本脚本；避免在公用或不受信任的环境保存凭据。

## 数据清理

你可以通过以下方式清理本地数据：

1. 在控制面板点击“清除本地保存的账号与密码”。
2. 在浏览器设置中清理站点数据或 localStorage。
3. 通过开发者工具执行：
   - `localStorage.removeItem('lh-savedUsername');`
   - `localStorage.removeItem('lh-savedPassword');`

## 第三方服务与脚本

- 本脚本不依赖第三方云服务，不使用第三方 SDK。
- 仅使用浏览器原生 API 与页面 DOM。

## 安全建议

- 使用强密码，并定期更换。
- 保持浏览器与扩展更新至最新版本。
- 若可能，启用官方的多因素认证（如手机扫码确认）。

## 政策变更

如隐私政策发生变更，将更新此文件的“最近更新日期”。

## 联系与反馈

- 欢迎通过 Issue 或邮件反馈问题与建议。