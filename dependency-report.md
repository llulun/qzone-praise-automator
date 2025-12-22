## GitHub Actions 版本检查

- actions/checkout: 建议检查最新版本
- actions/setup-node: 建议检查最新版本
- actions/upload-artifact: 建议检查最新版本
- peter-evans/create-pull-request: 建议检查最新版本
- softprops/action-gh-release: 建议检查最新版本

## 浏览器扩展兼容性检查

### 推荐的浏览器版本
- Chrome: 最新版本
- Firefox: 最新版本
- Edge: 最新版本
- Safari: 最新版本 (如果支持 Tampermonkey)

### 用户脚本管理器
- Tampermonkey: 推荐最新版本
- Violentmonkey: 推荐最新版本
- Greasemonkey: 检查兼容性

## 用户脚本 API 兼容性


## 安全建议

### 定期检查项目
- 🔍 检查脚本是否使用了过时的 API
- 🛡️ 验证脚本权限是否最小化
- 📱 测试在不同浏览器中的兼容性
- 🔄 关注 Tampermonkey 更新日志

### 推荐的安全实践
- 避免使用 `eval()` 和 `Function()`
- 最小化 `@grant` 权限
- 使用 HTTPS 进行网络请求
- 定期审查代码中的外部依赖

## 文档更新建议

- 🌐 检查浏览器版本要求是否需要更新
- 📖 检查安装说明是否需要更新
- 🔗 验证所有外部链接是否有效

## 推荐的更新操作

### 立即执行
- [ ] 更新 GitHub Actions 到最新版本
- [ ] 测试脚本在最新浏览器版本中的兼容性
- [ ] 检查并更新文档中的过时信息

### 定期执行
- [ ] 每月检查 Tampermonkey 更新
- [ ] 每季度进行全面兼容性测试
- [ ] 每半年审查安全实践

---
*报告生成时间: Mon Dec 22 04:03:13 UTC 2025*
