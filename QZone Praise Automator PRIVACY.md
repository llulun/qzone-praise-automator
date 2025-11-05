# QZone Praise Automator 隐私政策（Privacy Policy）

最近更新日期：2025-11-05

本隐私政策适用于脚本文件：`QZone Praise Automator 2.11.0.js`（以下简称“本脚本”）。

## 引言

本脚本用于在 QQ 空间网页端进行自动点赞与相关辅助操作。我们非常重视你的隐私与数据安全。本政策说明本脚本在使用过程中如何处理你的数据。

## 数据收集与传输

- 本脚本不收集、不上传、也不向任何服务器传输你的个人信息（如账号、密码、浏览记录等）。
- 本脚本不包含任何遥测、埋点或第三方统计 SDK。
- 本脚本仅在你的浏览器本地运行，使用原生浏览器 API 与页面 DOM 接口。

## 本地存储（Cookies 与 localStorage）

本脚本为实现配置与功能持久化，会在浏览器的 Cookies 与 `localStorage` 中保存以下数据项：

### Cookies（以 `al-` 前缀为主）
- 运行与界面参数：
  - `al-duration`、`al-refreshDelay`、`al-likeDelay`、`al-scrollCount`
  - `al-statusOpacity`、`al-statusBgColor`、`al-statusTextColor`、`al-statusTextBrightness`
  - `al-menuOpacity`、`al-menuBgColor`、`al-theme`、`al-themeHue`
- 过滤与规则：
  - `al-blocked`、`al-whiteList`、`al-blockGroups`、`al-filterKeywords`、`al-filterMode`
- 运行限制与登录相关：
  - `al-dailyLimit`、`al-select`（过滤游戏转发）
  - `al-enableLoginCheck`、`al-enableAutoRelogin`、`al-lastReloginAttempt`
  - `al-maxRetries`、`al-scrollStepPercent`、`al-initialDelay`
  - `al-randomDelayMin`、`al-randomDelayMax`、`al-logLevel`、`al-enableNotifications`
- 多账号：
  - `al-accounts`（序列化的多账号配置）

### localStorage
- `al-logs`：系统日志（按账号隔离），仅本地保存。
- `al-stats`：性能统计（点赞/跳过/错误计数，按账号隔离），仅本地保存。
- `al-config-backup` / `al-backup`：本地配置备份数据（可选）。

> 说明：上述数据仅用于本脚本功能实现与用户体验；不加密存储。请在私人设备上使用，并妥善管理浏览器数据。

## 通知权限（Web Notifications）

- 若启用浏览器通知（`al-enableNotifications`），脚本会使用 Web Notification API 在本地显示通知（如登录过期提示）。
- 仅在本地显示，不会向任何服务器发送数据。启用前需获得用户授权。

## 网络与页面交互

- 本脚本仅与 QQ 空间相关页面进行交互（DOM 检测、滚动模拟、点赞按钮点击等）。
- 不会向第三方服务器发送请求，也不会注入外部资源。

## 数据清理

你可以通过以下方式清理本地数据：
1. 在脚本的控制面板中恢复默认设置，或清除相关配置项。
2. 在浏览器设置中清理站点 Cookies 与 `localStorage`。
3. 通过开发者工具执行：
   - `localStorage.removeItem('al-logs');`
   - `localStorage.removeItem('al-stats');`
   - `localStorage.removeItem('al-config-backup');`
   - `localStorage.removeItem('al-backup');`
   - 并删除以 `al-` 前缀命名的 Cookies。

## 安全建议

- 为账号设置强密码并定期更换。
- 建议开启官方的多因素认证（如手机扫码确认）。
- 保持浏览器与脚本管理器（Tampermonkey/Violentmonkey）更新，提升安全性与兼容性。

## 政策变更

如隐私政策发生变更，将更新“最近更新日期”。建议定期查看本文件。

## 联系与反馈

- 欢迎通过 Issue 或邮件反馈隐私与安全相关问题与建议。