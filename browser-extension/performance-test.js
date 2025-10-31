// 浏览器扩展性能测试脚本
class PerformanceTester {
    constructor() {
        this.results = {
            memoryUsage: {},
            loadTimes: {},
            responseTime: {},
            throughput: {},
            errors: []
        };
        this.startTime = performance.now();
    }

    // 运行所有性能测试
    async runPerformanceTests() {
        console.log('🚀 开始性能测试...\n');
        
        try {
            await this.testMemoryUsage();
            await this.testLoadTimes();
            await this.testResponseTimes();
            await this.testThroughput();
            await this.testConcurrency();
            await this.testStoragePerformance();
            
            this.generatePerformanceReport();
        } catch (error) {
            console.error('❌ 性能测试失败:', error);
            this.results.errors.push(error.message);
        }
    }

    // 测试内存使用
    async testMemoryUsage() {
        console.log('🧠 测试内存使用...');
        
        const initialMemory = this.getMemoryUsage();
        
        // 模拟大量数据操作
        const testData = [];
        for (let i = 0; i < 10000; i++) {
            testData.push({
                id: i,
                timestamp: Date.now(),
                data: 'test data '.repeat(10)
            });
        }
        
        const afterDataMemory = this.getMemoryUsage();
        
        // 清理数据
        testData.length = 0;
        
        // 强制垃圾回收（如果可用）
        if (window.gc) {
            window.gc();
        }
        
        const finalMemory = this.getMemoryUsage();
        
        this.results.memoryUsage = {
            initial: initialMemory,
            afterData: afterDataMemory,
            final: finalMemory,
            increase: afterDataMemory - initialMemory,
            recovered: afterDataMemory - finalMemory
        };
        
        console.log(`✅ 内存测试完成 - 增长: ${this.formatBytes(this.results.memoryUsage.increase)}`);
    }

    // 测试加载时间
    async testLoadTimes() {
        console.log('⏱️ 测试加载时间...');
        
        const tests = [
            { name: 'Storage Load', test: () => this.testStorageLoad() },
            { name: 'Settings Load', test: () => this.testSettingsLoad() },
            { name: 'Analytics Load', test: () => this.testAnalyticsLoad() },
            { name: 'UI Render', test: () => this.testUIRender() }
        ];
        
        for (const test of tests) {
            const startTime = performance.now();
            try {
                await test.test();
                const endTime = performance.now();
                this.results.loadTimes[test.name] = endTime - startTime;
                console.log(`  ${test.name}: ${(endTime - startTime).toFixed(2)}ms`);
            } catch (error) {
                this.results.loadTimes[test.name] = -1;
                this.results.errors.push(`${test.name}: ${error.message}`);
            }
        }
    }

    // 测试响应时间
    async testResponseTimes() {
        console.log('📡 测试响应时间...');
        
        const messageTests = [
            'getSettings',
            'getStats',
            'getRecommendations',
            'getPerformanceMetrics'
        ];
        
        for (const action of messageTests) {
            const times = [];
            
            // 运行5次测试取平均值
            for (let i = 0; i < 5; i++) {
                const startTime = performance.now();
                try {
                    await chrome.runtime.sendMessage({ action });
                    const endTime = performance.now();
                    times.push(endTime - startTime);
                } catch (error) {
                    times.push(-1);
                    this.results.errors.push(`${action}: ${error.message}`);
                }
            }
            
            const validTimes = times.filter(t => t > 0);
            const avgTime = validTimes.length > 0 ? 
                validTimes.reduce((a, b) => a + b, 0) / validTimes.length : -1;
            
            this.results.responseTime[action] = {
                average: avgTime,
                min: Math.min(...validTimes),
                max: Math.max(...validTimes),
                samples: validTimes.length
            };
            
            console.log(`  ${action}: ${avgTime.toFixed(2)}ms (avg)`);
        }
    }

    // 测试吞吐量
    async testThroughput() {
        console.log('🚄 测试吞吐量...');
        
        const startTime = performance.now();
        const operations = 1000;
        let completed = 0;
        
        // 并发执行多个存储操作
        const promises = [];
        for (let i = 0; i < operations; i++) {
            promises.push(
                chrome.storage.local.set({ [`test_${i}`]: `value_${i}` })
                    .then(() => completed++)
                    .catch(error => this.results.errors.push(error.message))
            );
        }
        
        await Promise.all(promises);
        const endTime = performance.now();
        
        const totalTime = endTime - startTime;
        const throughput = (completed / totalTime) * 1000; // 操作/秒
        
        this.results.throughput = {
            operations: completed,
            totalTime,
            operationsPerSecond: throughput
        };
        
        console.log(`✅ 吞吐量: ${throughput.toFixed(2)} 操作/秒`);
        
        // 清理测试数据
        const keysToRemove = [];
        for (let i = 0; i < operations; i++) {
            keysToRemove.push(`test_${i}`);
        }
        await chrome.storage.local.remove(keysToRemove);
    }

    // 测试并发性能
    async testConcurrency() {
        console.log('🔄 测试并发性能...');
        
        const concurrentTasks = 50;
        const startTime = performance.now();
        
        const tasks = [];
        for (let i = 0; i < concurrentTasks; i++) {
            tasks.push(this.simulateUserAction(i));
        }
        
        const results = await Promise.allSettled(tasks);
        const endTime = performance.now();
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        this.results.concurrency = {
            totalTasks: concurrentTasks,
            successful,
            failed,
            totalTime: endTime - startTime,
            averageTime: (endTime - startTime) / concurrentTasks
        };
        
        console.log(`✅ 并发测试: ${successful}/${concurrentTasks} 成功`);
    }

    // 测试存储性能
    async testStoragePerformance() {
        console.log('💾 测试存储性能...');
        
        const testSizes = [1, 10, 100, 1000]; // KB
        const storageResults = {};
        
        for (const size of testSizes) {
            const data = 'x'.repeat(size * 1024); // 生成指定大小的数据
            const key = `perf_test_${size}kb`;
            
            // 写入测试
            const writeStart = performance.now();
            await chrome.storage.local.set({ [key]: data });
            const writeEnd = performance.now();
            
            // 读取测试
            const readStart = performance.now();
            await chrome.storage.local.get(key);
            const readEnd = performance.now();
            
            // 删除测试
            const deleteStart = performance.now();
            await chrome.storage.local.remove(key);
            const deleteEnd = performance.now();
            
            storageResults[`${size}KB`] = {
                write: writeEnd - writeStart,
                read: readEnd - readStart,
                delete: deleteEnd - deleteStart
            };
            
            console.log(`  ${size}KB - 写:${(writeEnd - writeStart).toFixed(2)}ms, 读:${(readEnd - readStart).toFixed(2)}ms`);
        }
        
        this.results.storage = storageResults;
    }

    // 模拟用户操作
    async simulateUserAction(id) {
        const actions = [
            () => chrome.storage.local.set({ [`action_${id}`]: Date.now() }),
            () => chrome.storage.local.get(`action_${id}`),
            () => chrome.runtime.sendMessage({ action: 'ping', id }),
            () => new Promise(resolve => setTimeout(resolve, Math.random() * 10))
        ];
        
        const action = actions[Math.floor(Math.random() * actions.length)];
        return action();
    }

    // 测试存储加载
    async testStorageLoad() {
        return chrome.storage.local.get(['settings', 'stats', 'cache']);
    }

    // 测试设置加载
    async testSettingsLoad() {
        return chrome.storage.sync.get([
            'likeDelay', 'dailyLimit', 'smartFilter', 'notifications'
        ]);
    }

    // 测试分析加载
    async testAnalyticsLoad() {
        return chrome.runtime.sendMessage({ action: 'getAnalytics' });
    }

    // 测试UI渲染
    async testUIRender() {
        const testElement = document.createElement('div');
        testElement.innerHTML = '<div>'.repeat(1000) + '</div>'.repeat(1000);
        document.body.appendChild(testElement);
        
        // 强制重排
        testElement.offsetHeight;
        
        document.body.removeChild(testElement);
    }

    // 获取内存使用情况
    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }

    // 格式化字节数
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 生成性能报告
    generatePerformanceReport() {
        console.log('\n📊 性能测试报告');
        console.log('='.repeat(50));
        
        // 内存使用报告
        if (this.results.memoryUsage.initial) {
            console.log('\n🧠 内存使用:');
            console.log(`  初始: ${this.formatBytes(this.results.memoryUsage.initial)}`);
            console.log(`  峰值: ${this.formatBytes(this.results.memoryUsage.afterData)}`);
            console.log(`  最终: ${this.formatBytes(this.results.memoryUsage.final)}`);
            console.log(`  增长: ${this.formatBytes(this.results.memoryUsage.increase)}`);
        }
        
        // 加载时间报告
        console.log('\n⏱️ 加载时间:');
        Object.entries(this.results.loadTimes).forEach(([name, time]) => {
            console.log(`  ${name}: ${time > 0 ? time.toFixed(2) + 'ms' : 'Failed'}`);
        });
        
        // 响应时间报告
        console.log('\n📡 响应时间:');
        Object.entries(this.results.responseTime).forEach(([action, data]) => {
            if (data.average > 0) {
                console.log(`  ${action}: ${data.average.toFixed(2)}ms (${data.min.toFixed(2)}-${data.max.toFixed(2)}ms)`);
            }
        });
        
        // 吞吐量报告
        if (this.results.throughput.operationsPerSecond) {
            console.log('\n🚄 吞吐量:');
            console.log(`  ${this.results.throughput.operationsPerSecond.toFixed(2)} 操作/秒`);
        }
        
        // 并发性能报告
        if (this.results.concurrency) {
            console.log('\n🔄 并发性能:');
            console.log(`  成功率: ${((this.results.concurrency.successful / this.results.concurrency.totalTasks) * 100).toFixed(1)}%`);
            console.log(`  平均时间: ${this.results.concurrency.averageTime.toFixed(2)}ms`);
        }
        
        // 错误报告
        if (this.results.errors.length > 0) {
            console.log('\n❌ 错误:');
            this.results.errors.forEach(error => {
                console.log(`  - ${error}`);
            });
        }
        
        const totalTime = performance.now() - this.startTime;
        console.log(`\n⏱️ 总测试时间: ${totalTime.toFixed(2)}ms`);
        console.log('🎉 性能测试完成!');
        
        // 保存结果
        chrome.storage.local.set({
            performanceTestResults: {
                timestamp: new Date().toISOString(),
                results: this.results,
                totalTime
            }
        });
    }
}

// 如果在测试环境中运行
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // 添加性能测试按钮
        const perfButton = document.createElement('button');
        perfButton.textContent = '性能测试';
        perfButton.className = 'btn btn-outline';
        perfButton.style.margin = '10px';
        perfButton.onclick = async () => {
            const tester = new PerformanceTester();
            await tester.runPerformanceTests();
        };
        
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.appendChild(perfButton);
        }
    });
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceTester;
}