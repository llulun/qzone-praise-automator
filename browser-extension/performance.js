// QZone Praise Automator Pro - Advanced Performance Module

class PerformanceOptimizer {
    constructor() {
        this.memoryManager = new MemoryManager();
        this.cacheManager = new CacheManager();
        this.performanceMonitor = new PerformanceMonitor();
        this.resourceOptimizer = new ResourceOptimizer();
        this.networkOptimizer = new NetworkOptimizer();
        
        this.settings = {
            memory: {
                maxHeapSize: 100 * 1024 * 1024, // 100MB
                gcThreshold: 0.8, // 80%
                autoCleanup: true,
                cleanupInterval: 300000 // 5分钟
            },
            cache: {
                maxSize: 50 * 1024 * 1024, // 50MB
                ttl: 3600000, // 1小时
                strategy: 'lru', // lru, lfu, fifo
                compression: true
            },
            network: {
                maxConcurrentRequests: 6,
                requestTimeout: 30000,
                retryAttempts: 3,
                batchSize: 10,
                throttleDelay: 100
            },
            monitoring: {
                enabled: true,
                sampleRate: 0.1, // 10%
                metricsInterval: 60000, // 1分钟
                alertThresholds: {
                    memoryUsage: 0.9, // 90%
                    responseTime: 5000, // 5秒
                    errorRate: 0.05 // 5%
                }
            }
        };
        
        this.metrics = {
            memory: {
                used: 0,
                peak: 0,
                gcCount: 0,
                leaks: []
            },
            performance: {
                responseTime: [],
                throughput: 0,
                errorRate: 0,
                uptime: Date.now()
            },
            cache: {
                hitRate: 0,
                missRate: 0,
                size: 0,
                operations: 0
            },
            network: {
                requestCount: 0,
                failureCount: 0,
                averageLatency: 0,
                bandwidth: 0
            }
        };
        
        // 异步初始化，避免在构造函数中调用
        this.initAsync();
    }
    
    async initAsync() {
        try {
            await this.init();
        } catch (error) {
            console.error('Performance optimizer initialization failed:', error);
        }
    }

    async init() {
        await this.loadSettings();
        this.memoryManager.init(this.settings.memory);
        this.cacheManager.init(this.settings.cache);
        this.performanceMonitor.init(this.settings.monitoring);
        this.resourceOptimizer.init();
        this.networkOptimizer.init(this.settings.network);
        
        this.startOptimization();
        this.startMonitoring();
    }

    // 加载设置
    async loadSettings() {
        try {
            const stored = await chrome.storage.local.get('performanceSettings');
            if (stored.performanceSettings) {
                this.settings = { ...this.settings, ...stored.performanceSettings };
            }
        } catch (error) {
            console.error('Failed to load performance settings:', error);
        }
    }

    // 保存设置
    async saveSettings() {
        try {
            await chrome.storage.local.set({
                performanceSettings: this.settings
            });
        } catch (error) {
            console.error('Failed to save performance settings:', error);
        }
    }

    // 开始优化
    startOptimization() {
        // 防止重复启动
        if (this.optimizationStarted) {
            return;
        }
        this.optimizationStarted = true;
        
        // 内存优化 - 降低频率
        if (this.settings.memory.autoCleanup) {
            this.memoryCleanupInterval = setInterval(() => {
                this.memoryManager.cleanup();
            }, Math.max(this.settings.memory.cleanupInterval, 300000)); // 最少5分钟
        }
        
        // 缓存优化 - 降低频率
        this.cacheOptimizationInterval = setInterval(() => {
            this.cacheManager.optimize();
        }, 300000); // 每5分钟优化一次，而不是每分钟
        
        // 资源优化
        this.resourceOptimizer.start();
        
        // 网络优化
        this.networkOptimizer.start();
    }

    // 开始监控
    startMonitoring() {
        if (!this.settings.monitoring.enabled || this.monitoringStarted) {
            return;
        }
        this.monitoringStarted = true;
        
        // 降低监控频率，避免过度消耗CPU
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
            this.checkAlerts();
        }, Math.max(this.settings.monitoring.metricsInterval, 60000)); // 最少1分钟
        
        this.performanceMonitor.start();
    }

    // 收集指标
    collectMetrics() {
        // 内存指标
        this.metrics.memory = this.memoryManager.getMetrics();
        
        // 缓存指标
        this.metrics.cache = this.cacheManager.getMetrics();
        
        // 性能指标
        this.metrics.performance = this.performanceMonitor.getMetrics();
        
        // 网络指标
        this.metrics.network = this.networkOptimizer.getMetrics();
    }

    // 检查警报
    checkAlerts() {
        const alerts = [];
        
        // 内存使用率警报
        if (this.metrics.memory.used / this.settings.memory.maxHeapSize > this.settings.monitoring.alertThresholds.memoryUsage) {
            alerts.push({
                type: 'memory',
                level: 'warning',
                message: '内存使用率过高',
                value: this.metrics.memory.used,
                threshold: this.settings.memory.maxHeapSize * this.settings.monitoring.alertThresholds.memoryUsage
            });
        }
        
        // 响应时间警报
        const avgResponseTime = this.metrics.performance.responseTime.reduce((a, b) => a + b, 0) / this.metrics.performance.responseTime.length;
        if (avgResponseTime > this.settings.monitoring.alertThresholds.responseTime) {
            alerts.push({
                type: 'performance',
                level: 'warning',
                message: '响应时间过长',
                value: avgResponseTime,
                threshold: this.settings.monitoring.alertThresholds.responseTime
            });
        }
        
        // 错误率警报
        if (this.metrics.performance.errorRate > this.settings.monitoring.alertThresholds.errorRate) {
            alerts.push({
                type: 'error',
                level: 'error',
                message: '错误率过高',
                value: this.metrics.performance.errorRate,
                threshold: this.settings.monitoring.alertThresholds.errorRate
            });
        }
        
        if (alerts.length > 0) {
            this.handleAlerts(alerts);
        }
    }

    // 处理警报
    handleAlerts(alerts) {
        alerts.forEach(alert => {
            console.warn('Performance Alert:', alert);
            
            // 自动优化
            switch (alert.type) {
                case 'memory':
                    this.memoryManager.forceCleanup();
                    break;
                case 'performance':
                    this.resourceOptimizer.optimize();
                    break;
                case 'error':
                    this.networkOptimizer.adjustSettings();
                    break;
            }
        });
    }

    // 优化操作
    async optimizeOperation(operation, data) {
        const startTime = performance.now();
        
        try {
            // 检查缓存
            const cacheKey = this.generateCacheKey(operation, data);
            const cached = await this.cacheManager.get(cacheKey);
            
            if (cached) {
                this.metrics.cache.operations++;
                return cached;
            }
            
            // 执行操作
            const result = await this.executeOptimizedOperation(operation, data);
            
            // 缓存结果
            await this.cacheManager.set(cacheKey, result);
            
            // 记录性能
            const duration = performance.now() - startTime;
            this.metrics.performance.responseTime.push(duration);
            
            // 保持响应时间数组大小
            if (this.metrics.performance.responseTime.length > 100) {
                this.metrics.performance.responseTime.shift();
            }
            
            return result;
        } catch (error) {
            this.metrics.performance.errorRate = 
                (this.metrics.performance.errorRate * 0.9) + (1 * 0.1);
            throw error;
        }
    }

    // 执行优化操作
    async executeOptimizedOperation(operation, data) {
        // 根据操作类型选择优化策略
        switch (operation) {
            case 'batchLike':
                return await this.networkOptimizer.batchRequest(data);
            case 'dataProcess':
                return await this.resourceOptimizer.processData(data);
            case 'imageLoad':
                return await this.resourceOptimizer.loadImage(data);
            default:
                return data;
        }
    }

    // 生成缓存键
    generateCacheKey(operation, data) {
        const key = operation + '_' + JSON.stringify(data);
        return this.hashString(key);
    }

    // 字符串哈希
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash.toString(36);
    }

    // 获取性能报告
    getPerformanceReport() {
        return {
            timestamp: Date.now(),
            metrics: this.metrics,
            settings: this.settings,
            recommendations: this.generateRecommendations()
        };
    }

    // 生成优化建议
    generateRecommendations() {
        const recommendations = [];
        
        // 内存建议
        if (this.metrics.memory.used / this.settings.memory.maxHeapSize > 0.8) {
            recommendations.push({
                type: 'memory',
                priority: 'high',
                message: '建议增加内存限制或优化内存使用',
                action: 'increaseMemoryLimit'
            });
        }
        
        // 缓存建议
        if (this.metrics.cache.hitRate < 0.5) {
            recommendations.push({
                type: 'cache',
                priority: 'medium',
                message: '缓存命中率较低，建议调整缓存策略',
                action: 'optimizeCacheStrategy'
            });
        }
        
        // 网络建议
        if (this.metrics.network.failureCount / this.metrics.network.requestCount > 0.1) {
            recommendations.push({
                type: 'network',
                priority: 'high',
                message: '网络请求失败率较高，建议检查网络配置',
                action: 'checkNetworkConfig'
            });
        }
        
        return recommendations;
    }

    // 应用优化建议
    async applyRecommendation(recommendation) {
        switch (recommendation.action) {
            case 'increaseMemoryLimit':
                this.settings.memory.maxHeapSize *= 1.5;
                break;
            case 'optimizeCacheStrategy':
                this.cacheManager.optimizeStrategy();
                break;
            case 'checkNetworkConfig':
                this.networkOptimizer.resetConfiguration();
                break;
        }
        
        await this.saveSettings();
    }

    // 重置性能数据
    resetMetrics() {
        this.metrics = {
            memory: { used: 0, peak: 0, gcCount: 0, leaks: [] },
            performance: { responseTime: [], throughput: 0, errorRate: 0, uptime: Date.now() },
            cache: { hitRate: 0, missRate: 0, size: 0, operations: 0 },
            network: { requestCount: 0, failureCount: 0, averageLatency: 0, bandwidth: 0 }
        };
    }

    // 停止所有优化和监控
    stopOptimization() {
        if (this.memoryCleanupInterval) {
            clearInterval(this.memoryCleanupInterval);
            this.memoryCleanupInterval = null;
        }
        
        if (this.cacheOptimizationInterval) {
            clearInterval(this.cacheOptimizationInterval);
            this.cacheOptimizationInterval = null;
        }
        
        this.optimizationStarted = false;
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        if (this.performanceMonitor) {
            this.performanceMonitor.stop();
        }
        
        this.monitoringStarted = false;
    }

    // 销毁性能优化器
    destroy() {
        this.stopOptimization();
        this.stopMonitoring();
        
        if (this.resourceOptimizer) {
            this.resourceOptimizer.stop && this.resourceOptimizer.stop();
        }
        
        if (this.networkOptimizer) {
            this.networkOptimizer.stop && this.networkOptimizer.stop();
        }
        
        this.memoryManager = null;
        this.cacheManager = null;
        this.performanceMonitor = null;
        this.resourceOptimizer = null;
        this.networkOptimizer = null;
    }
}

// 内存管理器
class MemoryManager {
    constructor() {
        this.allocatedMemory = new Map();
        this.memoryPool = new Map();
        this.gcScheduled = false;
        this.settings = null;
    }

    init(settings) {
        this.settings = settings;
        this.startMemoryMonitoring();
    }

    // 开始内存监控
    startMemoryMonitoring() {
        setInterval(() => {
            this.checkMemoryUsage();
        }, 30000); // 每30秒检查一次
    }

    // 检查内存使用
    checkMemoryUsage() {
        const usage = this.getMemoryUsage();
        
        if (usage.used / this.settings.maxHeapSize > this.settings.gcThreshold) {
            this.scheduleGC();
        }
    }

    // 获取内存使用情况
    getMemoryUsage() {
        const used = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const total = performance.memory ? performance.memory.totalJSHeapSize : 0;
        const limit = performance.memory ? performance.memory.jsHeapSizeLimit : this.settings.maxHeapSize;
        
        return { used, total, limit };
    }

    // 分配内存
    allocate(key, size) {
        if (this.allocatedMemory.has(key)) {
            this.deallocate(key);
        }
        
        const buffer = new ArrayBuffer(size);
        this.allocatedMemory.set(key, {
            buffer,
            size,
            timestamp: Date.now()
        });
        
        return buffer;
    }

    // 释放内存
    deallocate(key) {
        if (this.allocatedMemory.has(key)) {
            this.allocatedMemory.delete(key);
        }
    }

    // 内存池获取
    getFromPool(size) {
        const poolKey = this.getPoolKey(size);
        const pool = this.memoryPool.get(poolKey);
        
        if (pool && pool.length > 0) {
            return pool.pop();
        }
        
        return new ArrayBuffer(size);
    }

    // 内存池归还
    returnToPool(buffer) {
        const size = buffer.byteLength;
        const poolKey = this.getPoolKey(size);
        
        if (!this.memoryPool.has(poolKey)) {
            this.memoryPool.set(poolKey, []);
        }
        
        const pool = this.memoryPool.get(poolKey);
        if (pool.length < 10) { // 限制池大小
            pool.push(buffer);
        }
    }

    // 获取池键
    getPoolKey(size) {
        // 向上取整到最近的2的幂
        return Math.pow(2, Math.ceil(Math.log2(size)));
    }

    // 调度垃圾回收
    scheduleGC() {
        if (this.gcScheduled) {
            return;
        }
        
        this.gcScheduled = true;
        
        setTimeout(() => {
            this.performGC();
            this.gcScheduled = false;
        }, 1000);
    }

    // 执行垃圾回收
    performGC() {
        // 清理过期的分配内存
        const now = Date.now();
        const expiredKeys = [];
        
        for (const [key, allocation] of this.allocatedMemory) {
            if (now - allocation.timestamp > 300000) { // 5分钟
                expiredKeys.push(key);
            }
        }
        
        expiredKeys.forEach(key => this.deallocate(key));
        
        // 清理内存池
        this.cleanupMemoryPool();
        
        // 强制垃圾回收（如果支持）
        if (window.gc) {
            window.gc();
        }
    }

    // 清理内存池
    cleanupMemoryPool() {
        for (const [poolKey, pool] of this.memoryPool) {
            // 保留一半的缓冲区
            const keepCount = Math.floor(pool.length / 2);
            this.memoryPool.set(poolKey, pool.slice(0, keepCount));
        }
    }

    // 强制清理
    forceCleanup() {
        this.allocatedMemory.clear();
        this.memoryPool.clear();
        this.performGC();
    }

    // 清理
    cleanup() {
        this.performGC();
    }

    // 获取指标
    getMetrics() {
        const usage = this.getMemoryUsage();
        const allocatedSize = Array.from(this.allocatedMemory.values())
            .reduce((total, allocation) => total + allocation.size, 0);
        
        return {
            used: usage.used,
            total: usage.total,
            limit: usage.limit,
            allocated: allocatedSize,
            poolSize: this.memoryPool.size,
            allocations: this.allocatedMemory.size
        };
    }
}

// 缓存管理器
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.accessTimes = new Map();
        this.accessCounts = new Map();
        this.settings = null;
        this.currentSize = 0;
        this.hitCount = 0;
        this.missCount = 0;
    }

    init(settings) {
        this.settings = settings;
        this.startCacheCleanup();
    }

    // 开始缓存清理
    startCacheCleanup() {
        setInterval(() => {
            this.cleanup();
        }, 60000); // 每分钟清理一次
    }

    // 获取缓存
    async get(key) {
        if (this.cache.has(key)) {
            const item = this.cache.get(key);
            
            // 检查TTL
            if (Date.now() - item.timestamp > this.settings.ttl) {
                this.delete(key);
                this.missCount++;
                return null;
            }
            
            // 更新访问信息
            this.accessTimes.set(key, Date.now());
            this.accessCounts.set(key, (this.accessCounts.get(key) || 0) + 1);
            
            this.hitCount++;
            
            // 解压缩数据
            return this.settings.compression ? this.decompress(item.data) : item.data;
        }
        
        this.missCount++;
        return null;
    }

    // 设置缓存
    async set(key, value) {
        // 压缩数据
        const data = this.settings.compression ? this.compress(value) : value;
        const size = this.calculateSize(data);
        
        // 检查空间
        if (this.currentSize + size > this.settings.maxSize) {
            await this.evict(size);
        }
        
        const item = {
            data,
            size,
            timestamp: Date.now()
        };
        
        // 如果键已存在，先删除旧的
        if (this.cache.has(key)) {
            this.delete(key);
        }
        
        this.cache.set(key, item);
        this.accessTimes.set(key, Date.now());
        this.accessCounts.set(key, 1);
        this.currentSize += size;
    }

    // 删除缓存
    delete(key) {
        if (this.cache.has(key)) {
            const item = this.cache.get(key);
            this.currentSize -= item.size;
            this.cache.delete(key);
            this.accessTimes.delete(key);
            this.accessCounts.delete(key);
        }
    }

    // 清空缓存
    clear() {
        this.cache.clear();
        this.accessTimes.clear();
        this.accessCounts.clear();
        this.currentSize = 0;
        this.hitCount = 0;
        this.missCount = 0;
    }

    // 驱逐缓存项
    async evict(requiredSize) {
        const keysToEvict = this.selectEvictionKeys(requiredSize);
        
        for (const key of keysToEvict) {
            this.delete(key);
        }
    }

    // 选择驱逐键
    selectEvictionKeys(requiredSize) {
        const keys = Array.from(this.cache.keys());
        let freedSize = 0;
        const keysToEvict = [];
        
        // 根据策略排序
        keys.sort((a, b) => {
            switch (this.settings.strategy) {
                case 'lru':
                    return this.accessTimes.get(a) - this.accessTimes.get(b);
                case 'lfu':
                    return this.accessCounts.get(a) - this.accessCounts.get(b);
                case 'fifo':
                    return this.cache.get(a).timestamp - this.cache.get(b).timestamp;
                default:
                    return 0;
            }
        });
        
        for (const key of keys) {
            if (freedSize >= requiredSize) {
                break;
            }
            
            keysToEvict.push(key);
            freedSize += this.cache.get(key).size;
        }
        
        return keysToEvict;
    }

    // 清理过期项
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];
        
        for (const [key, item] of this.cache) {
            if (now - item.timestamp > this.settings.ttl) {
                expiredKeys.push(key);
            }
        }
        
        expiredKeys.forEach(key => this.delete(key));
    }

    // 优化缓存
    optimize() {
        // 清理过期项
        this.cleanup();
        
        // 如果使用率低，减少缓存大小
        const hitRate = this.getHitRate();
        if (hitRate < 0.3 && this.currentSize > this.settings.maxSize * 0.5) {
            const targetSize = this.settings.maxSize * 0.3;
            this.evict(this.currentSize - targetSize);
        }
    }

    // 优化策略
    optimizeStrategy() {
        const hitRate = this.getHitRate();
        
        if (hitRate < 0.5) {
            // 尝试不同的策略
            if (this.settings.strategy === 'lru') {
                this.settings.strategy = 'lfu';
            } else if (this.settings.strategy === 'lfu') {
                this.settings.strategy = 'fifo';
            } else {
                this.settings.strategy = 'lru';
            }
        }
    }

    // 计算大小
    calculateSize(data) {
        if (typeof data === 'string') {
            return data.length * 2; // UTF-16
        } else if (data instanceof ArrayBuffer) {
            return data.byteLength;
        } else {
            return JSON.stringify(data).length * 2;
        }
    }

    // 压缩数据
    compress(data) {
        // 简化的压缩实现
        const str = JSON.stringify(data);
        return btoa(str);
    }

    // 解压缩数据
    decompress(compressedData) {
        // 简化的解压缩实现
        const str = atob(compressedData);
        return JSON.parse(str);
    }

    // 获取命中率
    getHitRate() {
        const total = this.hitCount + this.missCount;
        return total > 0 ? this.hitCount / total : 0;
    }

    // 获取指标
    getMetrics() {
        return {
            hitRate: this.getHitRate(),
            missRate: 1 - this.getHitRate(),
            size: this.currentSize,
            maxSize: this.settings.maxSize,
            itemCount: this.cache.size,
            hitCount: this.hitCount,
            missCount: this.missCount
        };
    }
}

// 性能监控器
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            responseTime: [],
            throughput: 0,
            errorRate: 0,
            uptime: Date.now()
        };
        this.observers = [];
        this.settings = null;
    }

    init(settings) {
        this.settings = settings;
        this.setupObservers();
    }

    // 设置观察器
    setupObservers() {
        // Performance Observer
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.processPerformanceEntry(entry);
                }
            });
            
            observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
            this.observers.push(observer);
        }
        
        // Intersection Observer for visibility tracking
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.recordVisibility(entry.target);
                    }
                });
            });
            
            this.observers.push(observer);
        }
    }

    // 处理性能条目
    processPerformanceEntry(entry) {
        switch (entry.entryType) {
            case 'measure':
                this.metrics.responseTime.push(entry.duration);
                break;
            case 'navigation':
                this.recordNavigationTiming(entry);
                break;
            case 'resource':
                this.recordResourceTiming(entry);
                break;
        }
        
        // 保持数组大小
        if (this.metrics.responseTime.length > 1000) {
            this.metrics.responseTime = this.metrics.responseTime.slice(-500);
        }
    }

    // 记录导航时间
    recordNavigationTiming(entry) {
        const timing = {
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            tcp: entry.connectEnd - entry.connectStart,
            request: entry.responseStart - entry.requestStart,
            response: entry.responseEnd - entry.responseStart,
            dom: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            load: entry.loadEventEnd - entry.loadEventStart
        };
        
        console.log('Navigation timing:', timing);
    }

    // 记录资源时间
    recordResourceTiming(entry) {
        if (entry.duration > 1000) { // 超过1秒的资源
            console.warn('Slow resource:', entry.name, entry.duration);
        }
    }

    // 记录可见性
    recordVisibility(element) {
        const timing = performance.now();
        element.setAttribute('data-visible-time', timing);
    }

    // 开始监控
    start() {
        // 定期收集指标
        setInterval(() => {
            this.collectMetrics();
        }, this.settings.metricsInterval);
    }

    // 收集指标
    collectMetrics() {
        // 计算吞吐量
        this.metrics.throughput = this.calculateThroughput();
        
        // 计算错误率
        this.metrics.errorRate = this.calculateErrorRate();
        
        // 更新运行时间
        this.metrics.uptime = Date.now() - this.metrics.uptime;
    }

    // 计算吞吐量
    calculateThroughput() {
        const recentResponses = this.metrics.responseTime.slice(-60); // 最近60个响应
        return recentResponses.length;
    }

    // 计算错误率
    calculateErrorRate() {
        // 简化实现，实际应该跟踪错误数量
        return Math.random() * 0.1; // 模拟错误率
    }

    // 测量操作
    measure(name, fn) {
        return new Promise((resolve, reject) => {
            const startMark = `${name}-start`;
            const endMark = `${name}-end`;
            
            performance.mark(startMark);
            
            Promise.resolve(fn()).then(result => {
                performance.mark(endMark);
                performance.measure(name, startMark, endMark);
                resolve(result);
            }).catch(error => {
                performance.mark(endMark);
                performance.measure(name, startMark, endMark);
                reject(error);
            });
        });
    }

    // 获取指标
    getMetrics() {
        return { ...this.metrics };
    }

    // 停止监控
    stop() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers = [];
    }
}

// 资源优化器
class ResourceOptimizer {
    constructor() {
        this.imageCache = new Map();
        this.scriptCache = new Map();
        this.preloadQueue = [];
        this.lazyLoadObserver = null;
    }

    init() {
        this.setupLazyLoading();
        this.setupPreloading();
    }

    // 设置懒加载
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadResource(entry.target);
                        this.lazyLoadObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });
        }
    }

    // 设置预加载
    setupPreloading() {
        // 预加载关键资源
        this.preloadCriticalResources();
        
        // 空闲时预加载
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.preloadNextResources();
            });
        }
    }

    // 预加载关键资源
    preloadCriticalResources() {
        const criticalImages = document.querySelectorAll('img[data-critical]');
        criticalImages.forEach(img => {
            this.preloadImage(img.src);
        });
    }

    // 预加载下一批资源
    preloadNextResources() {
        while (this.preloadQueue.length > 0) {
            const resource = this.preloadQueue.shift();
            this.preloadResource(resource);
        }
    }

    // 预加载资源
    preloadResource(resource) {
        switch (resource.type) {
            case 'image':
                this.preloadImage(resource.url);
                break;
            case 'script':
                this.preloadScript(resource.url);
                break;
            case 'style':
                this.preloadStyle(resource.url);
                break;
        }
    }

    // 预加载图片
    preloadImage(url) {
        if (this.imageCache.has(url)) {
            return Promise.resolve(this.imageCache.get(url));
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.imageCache.set(url, img);
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    // 预加载脚本
    preloadScript(url) {
        if (this.scriptCache.has(url)) {
            return Promise.resolve(this.scriptCache.get(url));
        }
        
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = url;
            link.onload = () => {
                this.scriptCache.set(url, true);
                resolve();
            };
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    // 预加载样式
    preloadStyle(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = url;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    // 加载资源
    loadResource(element) {
        if (element.tagName === 'IMG') {
            this.loadImage(element);
        } else if (element.tagName === 'SCRIPT') {
            this.loadScript(element);
        }
    }

    // 加载图片
    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            if (this.imageCache.has(src)) {
                img.src = src;
            } else {
                this.preloadImage(src).then(() => {
                    img.src = src;
                });
            }
        }
    }

    // 加载脚本
    loadScript(script) {
        const src = script.dataset.src;
        if (src) {
            script.src = src;
        }
    }

    // 优化图片
    optimizeImage(img) {
        // 根据设备像素比调整图片大小
        const dpr = window.devicePixelRatio || 1;
        const rect = img.getBoundingClientRect();
        const optimalWidth = Math.ceil(rect.width * dpr);
        const optimalHeight = Math.ceil(rect.height * dpr);
        
        // 如果有多个尺寸的图片，选择最合适的
        const srcset = img.getAttribute('data-srcset');
        if (srcset) {
            const sources = this.parseSrcset(srcset);
            const bestSource = this.selectBestSource(sources, optimalWidth);
            img.src = bestSource.url;
        }
    }

    // 解析srcset
    parseSrcset(srcset) {
        return srcset.split(',').map(source => {
            const [url, descriptor] = source.trim().split(' ');
            const width = parseInt(descriptor.replace('w', ''));
            return { url, width };
        });
    }

    // 选择最佳源
    selectBestSource(sources, targetWidth) {
        return sources.reduce((best, current) => {
            if (current.width >= targetWidth && current.width < best.width) {
                return current;
            }
            return best;
        }, sources[sources.length - 1]);
    }

    // 处理数据
    async processData(data) {
        // 使用Web Workers处理大量数据
        if (data.length > 10000) {
            return await this.processDataInWorker(data);
        }
        
        return this.processDataSync(data);
    }

    // 在Worker中处理数据
    processDataInWorker(data) {
        return new Promise((resolve, reject) => {
            const worker = new Worker('data:application/javascript,' + encodeURIComponent(`
                self.onmessage = function(e) {
                    const data = e.data;
                    // 处理数据
                    const result = data.map(item => ({
                        ...item,
                        processed: true,
                        timestamp: Date.now()
                    }));
                    self.postMessage(result);
                };
            `));
            
            worker.onmessage = (e) => {
                resolve(e.data);
                worker.terminate();
            };
            
            worker.onerror = (error) => {
                reject(error);
                worker.terminate();
            };
            
            worker.postMessage(data);
        });
    }

    // 同步处理数据
    processDataSync(data) {
        return data.map(item => ({
            ...item,
            processed: true,
            timestamp: Date.now()
        }));
    }

    // 开始优化
    start() {
        // 观察懒加载元素
        if (this.lazyLoadObserver) {
            const lazyElements = document.querySelectorAll('[data-src]');
            lazyElements.forEach(element => {
                this.lazyLoadObserver.observe(element);
            });
        }
        
        // 优化现有图片
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            this.optimizeImage(img);
        });
    }

    // 优化
    optimize() {
        // 清理缓存
        if (this.imageCache.size > 100) {
            const entries = Array.from(this.imageCache.entries());
            const toDelete = entries.slice(0, entries.length - 50);
            toDelete.forEach(([key]) => {
                this.imageCache.delete(key);
            });
        }
        
        // 预加载下一批资源
        this.preloadNextResources();
    }
}

// 网络优化器
class NetworkOptimizer {
    constructor() {
        this.requestQueue = [];
        this.activeRequests = 0;
        this.settings = null;
        this.metrics = {
            requestCount: 0,
            failureCount: 0,
            totalLatency: 0,
            bandwidth: 0
        };
    }

    init(settings) {
        this.settings = settings;
        this.startRequestProcessor();
    }

    // 开始请求处理器
    startRequestProcessor() {
        setInterval(() => {
            this.processRequestQueue();
        }, this.settings.throttleDelay);
    }

    // 处理请求队列
    processRequestQueue() {
        while (this.requestQueue.length > 0 && 
               this.activeRequests < this.settings.maxConcurrentRequests) {
            const request = this.requestQueue.shift();
            this.executeRequest(request);
        }
    }

    // 执行请求
    async executeRequest(request) {
        this.activeRequests++;
        const startTime = performance.now();
        
        try {
            const response = await this.makeRequest(request);
            const latency = performance.now() - startTime;
            
            this.metrics.requestCount++;
            this.metrics.totalLatency += latency;
            
            request.resolve(response);
        } catch (error) {
            this.metrics.failureCount++;
            
            // 重试逻辑
            if (request.retryCount < this.settings.retryAttempts) {
                request.retryCount++;
                setTimeout(() => {
                    this.requestQueue.unshift(request);
                }, 1000 * request.retryCount);
            } else {
                request.reject(error);
            }
        } finally {
            this.activeRequests--;
        }
    }

    // 发起请求
    makeRequest(request) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, this.settings.requestTimeout);
        
        return fetch(request.url, {
            ...request.options,
            signal: controller.signal
        }).then(response => {
            clearTimeout(timeoutId);
            return response;
        });
    }

    // 批量请求
    async batchRequest(requests) {
        const batches = this.createBatches(requests, this.settings.batchSize);
        const results = [];
        
        for (const batch of batches) {
            const batchPromises = batch.map(request => this.request(request.url, request.options));
            const batchResults = await Promise.allSettled(batchPromises);
            results.push(...batchResults);
            
            // 批次间延迟
            if (batches.indexOf(batch) < batches.length - 1) {
                await this.delay(this.settings.throttleDelay);
            }
        }
        
        return results;
    }

    // 创建批次
    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }

    // 请求方法
    request(url, options = {}) {
        return new Promise((resolve, reject) => {
            const request = {
                url,
                options,
                resolve,
                reject,
                retryCount: 0,
                timestamp: Date.now()
            };
            
            this.requestQueue.push(request);
        });
    }

    // 延迟
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 调整设置
    adjustSettings() {
        // 根据错误率调整设置
        const errorRate = this.metrics.failureCount / this.metrics.requestCount;
        
        if (errorRate > 0.1) {
            // 降低并发数
            this.settings.maxConcurrentRequests = Math.max(1, this.settings.maxConcurrentRequests - 1);
            // 增加延迟
            this.settings.throttleDelay = Math.min(1000, this.settings.throttleDelay * 1.5);
        } else if (errorRate < 0.01) {
            // 增加并发数
            this.settings.maxConcurrentRequests = Math.min(10, this.settings.maxConcurrentRequests + 1);
            // 减少延迟
            this.settings.throttleDelay = Math.max(50, this.settings.throttleDelay * 0.8);
        }
    }

    // 重置配置
    resetConfiguration() {
        this.settings.maxConcurrentRequests = 6;
        this.settings.throttleDelay = 100;
        this.settings.requestTimeout = 30000;
    }

    // 开始
    start() {
        // 网络状态监控
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.adaptToNetworkConditions();
            });
        }
    }

    // 适应网络条件
    adaptToNetworkConditions() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.settings.maxConcurrentRequests = 2;
                this.settings.throttleDelay = 500;
            } else if (connection.effectiveType === '3g') {
                this.settings.maxConcurrentRequests = 4;
                this.settings.throttleDelay = 200;
            } else {
                this.settings.maxConcurrentRequests = 6;
                this.settings.throttleDelay = 100;
            }
        }
    }

    // 获取指标
    getMetrics() {
        const averageLatency = this.metrics.requestCount > 0 ? 
            this.metrics.totalLatency / this.metrics.requestCount : 0;
        
        return {
            requestCount: this.metrics.requestCount,
            failureCount: this.metrics.failureCount,
            averageLatency,
            errorRate: this.metrics.requestCount > 0 ? 
                this.metrics.failureCount / this.metrics.requestCount : 0,
            activeRequests: this.activeRequests,
            queueLength: this.requestQueue.length
        };
    }
}

// 导出性能优化器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        PerformanceOptimizer, 
        MemoryManager, 
        CacheManager, 
        PerformanceMonitor, 
        ResourceOptimizer, 
        NetworkOptimizer 
    };
} else if (typeof window !== 'undefined') {
    window.PerformanceOptimizer = PerformanceOptimizer;
    window.MemoryManager = MemoryManager;
    window.CacheManager = CacheManager;
    window.PerformanceMonitor = PerformanceMonitor;
    window.ResourceOptimizer = ResourceOptimizer;
    window.NetworkOptimizer = NetworkOptimizer;
}