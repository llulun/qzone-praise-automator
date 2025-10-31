// 浏览器扩展集成测试脚本
class IntegrationTester {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            errors: [],
            details: {}
        };
        this.startTime = Date.now();
    }

    // 运行所有集成测试
    async runIntegrationTests() {
        console.log('🔗 开始集成测试...\n');
        
        try {
            await this.testExtensionInitialization();
            await this.testDataFlow();
            await this.testUserWorkflow();
            await this.testAdvancedFeatureIntegration();
            await this.testErrorHandling();
            await this.testPerformanceUnderLoad();
            await this.testSecurityFeatures();
            
            this.generateIntegrationReport();
        } catch (error) {
            console.error('❌ 集成测试失败:', error);
            this.recordError('Integration Test', error.message);
        }
    }

    // 测试扩展初始化流程
    async testExtensionInitialization() {
        console.log('🚀 测试扩展初始化...');
        
        try {
            // 测试background script初始化
            const bgResponse = await chrome.runtime.sendMessage({ action: 'ping' });
            this.assert(bgResponse && bgResponse.status === 'ok', 'Background script响应');
            
            // 测试存储初始化
            const settings = await chrome.storage.sync.get(['likeDelay', 'dailyLimit']);
            this.assert(typeof settings === 'object', '设置存储初始化');
            
            // 测试高级功能模块初始化
            const advancedStatus = await chrome.runtime.sendMessage({ action: 'getAdvancedStatus' });
            this.assert(advancedStatus && typeof advancedStatus === 'object', '高级功能状态');
            
            this.recordSuccess('Extension Initialization');
        } catch (error) {
            this.recordError('Extension Initialization', error.message);
        }
    }

    // 测试数据流
    async testDataFlow() {
        console.log('📊 测试数据流...');
        
        try {
            // 测试数据写入
            const testData = {
                timestamp: Date.now(),
                action: 'test_like',
                target: 'test_user',
                success: true
            };
            
            await chrome.runtime.sendMessage({ 
                action: 'recordAction', 
                data: testData 
            });
            
            // 等待数据处理
            await this.wait(100);
            
            // 测试数据读取
            const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
            this.assert(stats && typeof stats.totalLikes === 'number', '统计数据读取');
            
            // 测试分析数据
            const analytics = await chrome.runtime.sendMessage({ action: 'getAnalytics' });
            this.assert(analytics && Array.isArray(analytics.trends), '分析数据生成');
            
            this.recordSuccess('Data Flow');
        } catch (error) {
            this.recordError('Data Flow', error.message);
        }
    }

    // 测试用户工作流程
    async testUserWorkflow() {
        console.log('👤 测试用户工作流程...');
        
        try {
            // 1. 用户打开popup
            const popupData = await chrome.runtime.sendMessage({ action: 'getPopupData' });
            this.assert(popupData && popupData.settings, 'Popup数据加载');
            
            // 2. 用户修改设置
            const newSettings = { likeDelay: 3000, dailyLimit: 200 };
            await chrome.runtime.sendMessage({ 
                action: 'updateSettings', 
                settings: newSettings 
            });
            
            // 3. 验证设置保存
            const savedSettings = await chrome.storage.sync.get(['likeDelay', 'dailyLimit']);
            this.assert(
                savedSettings.likeDelay === 3000 && savedSettings.dailyLimit === 200,
                '设置保存验证'
            );
            
            // 4. 用户启动自动点赞
            const startResponse = await chrome.runtime.sendMessage({ action: 'startAutoLike' });
            this.assert(startResponse && startResponse.status === 'started', '自动点赞启动');
            
            // 5. 用户停止自动点赞
            await this.wait(500);
            const stopResponse = await chrome.runtime.sendMessage({ action: 'stopAutoLike' });
            this.assert(stopResponse && stopResponse.status === 'stopped', '自动点赞停止');
            
            this.recordSuccess('User Workflow');
        } catch (error) {
            this.recordError('User Workflow', error.message);
        }
    }

    // 测试高级功能集成
    async testAdvancedFeatureIntegration() {
        console.log('🧠 测试高级功能集成...');
        
        try {
            // 测试推荐系统
            const recommendations = await chrome.runtime.sendMessage({ action: 'getRecommendations' });
            this.assert(Array.isArray(recommendations), '推荐系统响应');
            
            // 测试机器学习引擎
            const mlStatus = await chrome.runtime.sendMessage({ action: 'getMLStatus' });
            this.assert(mlStatus && typeof mlStatus.modelAccuracy === 'number', 'ML引擎状态');
            
            // 测试性能监控
            const performance = await chrome.runtime.sendMessage({ action: 'getPerformanceMetrics' });
            this.assert(performance && typeof performance.memoryUsage === 'number', '性能监控数据');
            
            // 测试通知系统
            const notificationTest = await chrome.runtime.sendMessage({ 
                action: 'testNotification',
                message: '集成测试通知'
            });
            this.assert(notificationTest && notificationTest.sent, '通知系统测试');
            
            // 测试安全管理器
            const securityCheck = await chrome.runtime.sendMessage({ action: 'securityCheck' });
            this.assert(securityCheck && securityCheck.status === 'secure', '安全检查');
            
            this.recordSuccess('Advanced Feature Integration');
        } catch (error) {
            this.recordError('Advanced Feature Integration', error.message);
        }
    }

    // 测试错误处理
    async testErrorHandling() {
        console.log('⚠️ 测试错误处理...');
        
        try {
            // 测试无效消息处理
            try {
                await chrome.runtime.sendMessage({ action: 'invalidAction' });
                this.recordError('Error Handling', '应该抛出错误但没有');
            } catch (error) {
                this.assert(true, '无效消息错误处理');
            }
            
            // 测试存储错误处理
            try {
                await chrome.storage.local.set({ 'x'.repeat(10000): 'large_data'.repeat(100000) });
                this.recordError('Error Handling', '应该处理存储限制错误');
            } catch (error) {
                this.assert(true, '存储错误处理');
            }
            
            // 测试网络错误恢复
            const networkTest = await chrome.runtime.sendMessage({ 
                action: 'testNetworkError' 
            });
            this.assert(networkTest && networkTest.handled, '网络错误处理');
            
            this.recordSuccess('Error Handling');
        } catch (error) {
            this.recordError('Error Handling', error.message);
        }
    }

    // 测试负载下的性能
    async testPerformanceUnderLoad() {
        console.log('🔥 测试负载性能...');
        
        try {
            const startTime = performance.now();
            const concurrentRequests = 20;
            
            // 并发发送多个请求
            const promises = [];
            for (let i = 0; i < concurrentRequests; i++) {
                promises.push(
                    chrome.runtime.sendMessage({ 
                        action: 'getStats',
                        requestId: i 
                    })
                );
            }
            
            const results = await Promise.allSettled(promises);
            const endTime = performance.now();
            
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const responseTime = endTime - startTime;
            
            this.assert(successful >= concurrentRequests * 0.8, '并发请求成功率 >= 80%');
            this.assert(responseTime < 5000, '响应时间 < 5秒');
            
            console.log(`  并发请求: ${successful}/${concurrentRequests} 成功`);
            console.log(`  总响应时间: ${responseTime.toFixed(2)}ms`);
            
            this.recordSuccess('Performance Under Load');
        } catch (error) {
            this.recordError('Performance Under Load', error.message);
        }
    }

    // 测试安全功能
    async testSecurityFeatures() {
        console.log('🔒 测试安全功能...');
        
        try {
            // 测试输入验证
            const maliciousInput = '<script>alert("xss")</script>';
            const sanitized = await chrome.runtime.sendMessage({ 
                action: 'sanitizeInput',
                input: maliciousInput 
            });
            this.assert(!sanitized.includes('<script>'), '输入清理');
            
            // 测试权限检查
            const permissionCheck = await chrome.runtime.sendMessage({ 
                action: 'checkPermissions' 
            });
            this.assert(permissionCheck && permissionCheck.valid, '权限验证');
            
            // 测试数据加密
            const testData = 'sensitive data';
            const encrypted = await chrome.runtime.sendMessage({ 
                action: 'encryptData',
                data: testData 
            });
            this.assert(encrypted && encrypted !== testData, '数据加密');
            
            this.recordSuccess('Security Features');
        } catch (error) {
            this.recordError('Security Features', error.message);
        }
    }

    // 断言函数
    assert(condition, testName) {
        if (condition) {
            console.log(`  ✅ ${testName}`);
            this.testResults.passed++;
        } else {
            console.log(`  ❌ ${testName}`);
            this.testResults.failed++;
            this.testResults.errors.push(`断言失败: ${testName}`);
        }
    }

    // 记录成功
    recordSuccess(testSuite) {
        this.testResults.details[testSuite] = 'PASSED';
        console.log(`✅ ${testSuite} - 通过\n`);
    }

    // 记录错误
    recordError(testSuite, error) {
        this.testResults.details[testSuite] = `FAILED: ${error}`;
        this.testResults.errors.push(`${testSuite}: ${error}`);
        console.log(`❌ ${testSuite} - 失败: ${error}\n`);
    }

    // 等待函数
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 生成集成测试报告
    generateIntegrationReport() {
        const endTime = Date.now();
        const totalTime = endTime - this.startTime;
        
        console.log('\n🔗 集成测试报告');
        console.log('='.repeat(50));
        
        console.log(`\n📊 测试统计:`);
        console.log(`  通过: ${this.testResults.passed}`);
        console.log(`  失败: ${this.testResults.failed}`);
        console.log(`  总计: ${this.testResults.passed + this.testResults.failed}`);
        console.log(`  成功率: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
        
        console.log(`\n📋 测试套件结果:`);
        Object.entries(this.testResults.details).forEach(([suite, result]) => {
            const status = result === 'PASSED' ? '✅' : '❌';
            console.log(`  ${status} ${suite}: ${result}`);
        });
        
        if (this.testResults.errors.length > 0) {
            console.log(`\n❌ 错误详情:`);
            this.testResults.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        console.log(`\n⏱️ 总测试时间: ${totalTime}ms`);
        
        // 保存测试结果
        chrome.storage.local.set({
            integrationTestResults: {
                timestamp: new Date().toISOString(),
                results: this.testResults,
                totalTime,
                success: this.testResults.failed === 0
            }
        });
        
        if (this.testResults.failed === 0) {
            console.log('\n🎉 所有集成测试通过！扩展已准备就绪。');
        } else {
            console.log('\n⚠️ 部分测试失败，请检查错误并修复。');
        }
    }
}

// 如果在测试环境中运行
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // 添加集成测试按钮
        const integrationButton = document.createElement('button');
        integrationButton.textContent = '集成测试';
        integrationButton.className = 'btn btn-primary';
        integrationButton.style.margin = '10px';
        integrationButton.onclick = async () => {
            const tester = new IntegrationTester();
            await tester.runIntegrationTests();
        };
        
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.appendChild(integrationButton);
        }
    });
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationTester;
}