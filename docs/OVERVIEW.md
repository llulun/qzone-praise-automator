# 项目总览（Overview）

本仓库包含多个应用（脚本/代码），用于围绕 QQ 空间的自动化与登录辅助：

- QZone Praise Automator（自动点赞脚本）
- QZone Auto Login Helper（自动登录辅助脚本）

它们可独立使用，也可组合一起使用以获得更稳定的自动化体验。

## 仓库结构

```
qzone-praise-automator/
├── QZone Praise Automator 2.11.0.js            # 自动点赞脚本（主脚本）
├── qzone-auto-login-helper/
│   ├── qzone-auto-login-helper.user.js         # 自动登录辅助脚本
│   ├── README.md                               # 子模块说明
│   ├── PRIVACY.md                              # 子模块隐私政策
│   └── LICENSE                                 # 子模块开源协议（MIT）
├── docs/
│   └── control-panel.png                       # 控制面板示意图
├── preview/                                    # 本地预览页面
└── README.md                                   # 仓库级说明（入口文档）
```

## 组合使用（推荐）

- 将“自动登录辅助脚本”和“自动点赞脚本”同时安装到浏览器的 Tampermonkey/Violentmonkey。
- 当登录过期或页面嵌入跨域登录框时，登录辅助脚本会自动跳转到同源登录页并填入你保存的账号密码进行登录；
- 登录成功后，自动点赞脚本继续执行，无需人工干预。

## 适配与扩展

- 若你常用的登录页结构有差异，可在登录辅助脚本的控制面板“高级设置”里填写“优先登录页URL”，或者在 Issue 中提供页面 URL 与关键元素（账号/密码/提交按钮选择器），我们将做针对性适配。
- 自动点赞脚本也欢迎你提供内容类型与规则优化建议，共同提升点赞体验与性能。

## 安全与隐私

- 脚本不收集、不上传你的个人信息；凭据仅保存在浏览器 localStorage（默认不加密）。
- 请在私人设备中使用并妥善管理浏览器数据；详细说明见仓库级《隐私政策》（PRIVACY.md）。

## 开源许可

- 本仓库以 MIT 许可证开源；子模块也分别以 MIT 许可发布。