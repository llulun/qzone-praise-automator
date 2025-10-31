// 性能检查脚本
class PerformanceChecker {
    constructor() {
        this.startTime = Date.now();
        this.memoryUsage = [];
        this.cpuUsage = [];
        this.intervalCount = 0;
        this.timeoutCount = 0;
        this.eventListenerCount = 0;
        this.checkInterval = null;
    }

    // 开始性能监控
    startMonitoring() {
        console.log('🔍 开始性能监控...');
        
        this.checkInterval = setInterval(() => {
            this.collectMetrics();
        }, 2000); // 每2秒检查一次

        // 5分钟后停止监控
        setTimeout(() => {
            this.stopMonitoring();
        }, 300000);
    }

    // 收集性能指标
    collectMetrics() {
        // 检查内存使用
        if (performance.memory) {
            const memory = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
                timestamp: Date.now()
            };
            this.memoryUsage.push(memory);
        }

        // 检查定时器数量
        this.countTimers();

        // 检查事件监听器
        this.countEventListeners();

        // 输出当前状态
        this.logCurrentStatus();
    }

    // 计算定时器数量
    countTimers() {
        // 这是一个近似的方法来检测活跃的定时器
        const beforeCount = this.intervalCount + this.timeoutCount;
        
        // 检查setInterval
        let intervalId = setInterval(() => {}, 999999);
        this.intervalCount = intervalId;
        clearInterval(intervalId);

        // 检查setTimeout
        let timeoutId = setTimeout(() => {}, 999999);
        this.timeoutCount = timeoutId;
        clearTimeout(timeoutId);
    }

    // 计算事件监听器数量
    countEventListeners() {
        // 检查DOM元素上的事件监听器
        if (typeof document !== 'undefined') {
            const elements = document.querySelectorAll('*');
            let listenerCount = 0;
            
            elements.forEach(element => {
                // 检查常见的事件类型
                const events = ['click', 'mouseover', 'mouseout', 'keydown', 'keyup', 'change', 'input'];
                events.forEach(eventType => {
                    if (element[`on${eventType}`]) {
                        listenerCount++;
                    }
                });
            });
            
            this.eventListenerCount = listenerCount;
        } else {
            // Node.js环境中无法检查DOM事件监听器
            this.eventListenerCount = 0;
        }
    }

    // 输出当前状态
    logCurrentStatus() {
        const runtime = Math.round((Date.now() - this.startTime) / 1000);
        const latestMemory = this.memoryUsage[this.memoryUsage.length - 1];
        
        console.log(`📊 性能状态 (运行时间: ${runtime}s):`);
        
        if (latestMemory) {
            console.log(`   内存使用: ${latestMemory.used}MB / ${latestMemory.total}MB (限制: ${latestMemory.limit}MB)`);
            
            // 检查内存增长趋势
            if (this.memoryUsage.length > 5) {
                const oldMemory = this.memoryUsage[this.memoryUsage.length - 6];
                const memoryGrowth = latestMemory.used - oldMemory.used;
                if (memoryGrowth > 5) {
                    console.warn(`⚠️  内存增长过快: +${memoryGrowth}MB`);
                }
            }
        }
        
        console.log(`   活跃定时器: ~${Math.max(this.intervalCount, this.timeoutCount)}`);
        console.log(`   事件监听器: ${this.eventListenerCount}`);
        
        // 检查CPU使用情况
        this.checkCPUUsage();
    }

    // 检查CPU使用情况
    checkCPUUsage() {
        const start = performance.now();
        
        // 执行一个简单的计算任务来测试响应性
        let sum = 0;
        for (let i = 0; i < 100000; i++) {
            sum += Math.random();
        }
        
        const duration = performance.now() - start;
        
        if (duration > 10) {
            console.warn(`⚠️  CPU响应缓慢: ${duration.toFixed(2)}ms`);
        } else {
            console.log(`   CPU响应: ${duration.toFixed(2)}ms (正常)`);
        }
    }

    // 停止监控
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        
        console.log('✅ 性能监控完成');
        this.generateReport();
    }

    // 生成性能报告
    generateReport() {
        console.log('\n📋 性能报告:');
        console.log('================');
        
        if (this.memoryUsage.length > 0) {
            const maxMemory = Math.max(...this.memoryUsage.map(m => m.used));
            const minMemory = Math.min(...this.memoryUsage.map(m => m.used));
            const avgMemory = this.memoryUsage.reduce((sum, m) => sum + m.used, 0) / this.memoryUsage.length;
            
            console.log(`内存使用统计:`);
            console.log(`  最大: ${maxMemory}MB`);
            console.log(`  最小: ${minMemory}MB`);
            console.log(`  平均: ${avgMemory.toFixed(1)}MB`);
            console.log(`  变化: ${maxMemory - minMemory}MB`);
            
            if (maxMemory - minMemory > 20) {
                console.warn(`⚠️  内存泄漏可能存在 (变化超过20MB)`);
            } else {
                console.log(`✅ 内存使用稳定`);
            }
        }
        
        console.log(`\n定时器状态: ${this.intervalCount + this.timeoutCount > 50 ? '⚠️ 过多' : '✅ 正常'}`);
        console.log(`事件监听器: ${this.eventListenerCount > 100 ? '⚠️ 过多' : '✅ 正常'}`);
        
        // 性能建议
        this.generateRecommendations();
    }

    // 生成性能建议
    generateRecommendations() {
        console.log('\n💡 性能建议:');
        console.log('================');
        
        const recommendations = [];
        
        if (this.memoryUsage.length > 0) {
            const maxMemory = Math.max(...this.memoryUsage.map(m => m.used));
            if (maxMemory > 100) {
                recommendations.push('考虑减少内存使用，清理不必要的数据缓存');
            }
        }
        
        if (this.intervalCount + this.timeoutCount > 50) {
            recommendations.push('减少定时器使用，合并相似的定时任务');
        }
        
        if (this.eventListenerCount > 100) {
            recommendations.push('清理不必要的事件监听器，使用事件委托');
        }
        
        if (recommendations.length === 0) {
            console.log('✅ 性能表现良好，无需特别优化');
        } else {
            recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec}`);
            });
        }
    }
}

// 自动启动性能检查
console.log('🚀 QZone插件性能检查器已启动');
const checker = new PerformanceChecker();
checker.startMonitoring();

// 导出到全局作用域以便手动控制
if (typeof window !== 'undefined') {
    window.performanceChecker = checker;
} else if (typeof global !== 'undefined') {
    global.performanceChecker = checker;
}