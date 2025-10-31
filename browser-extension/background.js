// QZone Praise Automator Pro - Background Service Worker

// 导入高级功能模块
importScripts(
    'storage.js',
    'analytics.js',
    'recommendation.js',
    'ml-engine.js',
    'visualization.js',
    'notification-system.js',
    'security.js',
    'performance.js'
);

class BackgroundService {
    constructor() {
        this.isRunning = false;
        this.alarmName = 'qzone-automator-alarm';
        this.notificationId = 'qzone-automator-notification';
        
        // 初始化高级功能模块
        this.storageManager = new StorageManager();
        this.analyticsEngine = new AnalyticsEngine();
        this.recommendationSystem = new RecommendationSystem();
        this.mlEngine = new MLEngine();
        this.notificationSystem = new NotificationSystem();
        this.securityManager = new SecurityManager();
        this.performanceOptimizer = new PerformanceOptimizer();
        
        // 不在构造函数中调用异步init方法
    }

    async init() {
        try {
            // 初始化安全管理器（必须首先初始化）
            await this.securityManager.init();
            
            // 验证安全性
            const securityCheck = await this.securityManager.performSecurityCheck();
            if (!securityCheck) {
                console.error('Security check failed, some features may be disabled');
            }
            
            // 初始化存储管理器
            await this.storageManager.init();
            
            // 初始化性能优化器
            await this.performanceOptimizer.init();
            
            // 初始化其他模块
            await this.analyticsEngine.init();
            await this.recommendationSystem.init();
            await this.mlEngine.init();
            await this.notificationSystem.init();
            
            // 初始化默认设置
            await this.initializeDefaultSettings();
            
            // 设置事件监听器
            this.setupEventListeners();
            
            // 启动定期任务
            this.startPeriodicTasks();
            
            // 启动高级功能
            this.startAdvancedFeatures();
            
            console.log('QZone Praise Automator Pro background service initialized with advanced features');
        } catch (error) {
            console.error('Failed to initialize background service:', error);
            // 降级到基本功能
            await this.initializeBasicMode();
        }
    }

    setupEventListeners() {
        // 监听插件安装/更新
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstall(details);
        });

        // 监听来自content script和popup的消息
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // 保持消息通道开放
        });

        // 监听定时器
        chrome.alarms.onAlarm.addListener((alarm) => {
            this.handleAlarm(alarm);
        });

        // 监听通知点击
        chrome.notifications.onClicked.addListener((notificationId) => {
            this.handleNotificationClick(notificationId);
        });

        // 监听标签页更新
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });
    }

    startPeriodicTasks() {
        // 启动定期数据清理
        chrome.alarms.create('data-cleanup', { periodInMinutes: 60 });
        
        // 启动性能监控
        chrome.alarms.create('performance-monitor', { periodInMinutes: 30 });
        
        // 启动安全检查
        chrome.alarms.create('security-check', { periodInMinutes: 120 });
    }

    startAdvancedFeatures() {
        // 启动机器学习引擎
        this.mlEngine.startTraining();
        
        // 启动推荐系统
        this.recommendationSystem.startAnalysis();
        
        // 启动性能优化
        this.performanceOptimizer.startOptimization();
    }

    async initializeBasicMode() {
        console.log('Initializing in basic mode...');
        await this.initializeDefaultSettings();
        this.setupEventListeners();
    }

    async handleInstall(details) {
        console.log('QZone Praise Automator Pro installed/updated:', details.reason);
        
        if (details.reason === 'install') {
            // 首次安装，显示欢迎通知
            await this.showNotification(
                'welcome',
                'QZone Praise Automator Pro',
                '欢迎使用！点击插件图标开始配置。',
                'notifications/welcome.png'
            );
            
            // 打开选项页面
            chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
        } else if (details.reason === 'update') {
            // 更新后显示更新通知
            const manifest = chrome.runtime.getManifest();
            await this.showNotification(
                'update',
                'QZone Praise Automator Pro',
                `已更新到版本 ${manifest.version}`,
                'notifications/update.png'
            );
        }
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            // 安全检查
            if (!await this.securityManager.validateMessage(message, sender)) {
                sendResponse({ error: 'Security validation failed' });
                return;
            }

            // 性能监控
            const startTime = performance.now();
            
            switch (message.action) {
                case 'startAutomation':
                    await this.startAutomation(message.config);
                    sendResponse({ success: true });
                    break;

                case 'stopAutomation':
                    await this.stopAutomation();
                    sendResponse({ success: true });
                    break;

                case 'pauseAutomation':
                    await this.pauseAutomation();
                    sendResponse({ success: true });
                    break;

                case 'resumeAutomation':
                    await this.resumeAutomation();
                    sendResponse({ success: true });
                    break;

                case 'getStatus':
                    const status = await this.getStatus();
                    sendResponse(status);
                    break;

                case 'updateSettings':
                    await this.updateSettings(message.settings);
                    sendResponse({ success: true });
                    break;

                case 'getSettings':
                    const settings = await this.getSettings();
                    sendResponse(settings);
                    break;

                case 'getStatistics':
                    const stats = await this.getStatistics();
                    sendResponse(stats);
                    break;

                case 'updateStatistics':
                    await this.updateStatistics(message.stats);
                    sendResponse({ success: true });
                    break;

                case 'exportData':
                    const data = await this.exportData();
                    sendResponse(data);
                    break;

                case 'importData':
                    await this.importData(message.data);
                    sendResponse({ success: true });
                    break;

                case 'clearData':
                    await this.clearData();
                    sendResponse({ success: true });
                    break;

                // 新增高级功能消息处理
                case 'getRecommendations':
                    const recommendations = await this.recommendationSystem.getRecommendations(message.params);
                    sendResponse({ recommendations });
                    break;

                case 'getAnalytics':
                    const analytics = await this.analyticsEngine.getAnalytics(message.timeRange);
                    sendResponse({ analytics });
                    break;

                case 'optimizePerformance':
                    const optimization = await this.performanceOptimizer.optimize(message.options);
                    sendResponse({ optimization });
                    break;

                case 'trainModel':
                    await this.mlEngine.trainModel(message.data);
                    sendResponse({ success: true });
                    break;

                case 'predictBehavior':
                    const prediction = await this.mlEngine.predict(message.input);
                    sendResponse({ prediction });
                    break;

                case 'generateVisualization':
                    const visualization = await this.generateVisualization(message.type, message.data);
                    sendResponse({ visualization });
                    break;

                default:
                    sendResponse({ error: 'Unknown action' });
            }

            // 记录性能数据
            const duration = performance.now() - startTime;
            this.performanceOptimizer.recordMessageHandling(message.action, duration);
            
        } catch (error) {
            console.error('Background message handling error:', error);
            this.analyticsEngine.recordError(error, 'message_handling');
            sendResponse({ error: error.message });
        }
    }

    async handleAlarm(alarm) {
        try {
            switch (alarm.name) {
                case this.alarmName:
                    // 定时检查和执行任务
                    await this.performScheduledTasks();
                    break;
                    
                case 'data-cleanup':
                    await this.performDataCleanup();
                    break;
                    
                case 'performance-monitor':
                    await this.performanceOptimizer.monitor();
                    break;
                    
                case 'security-check':
                    await this.securityManager.performSecurityCheck();
                    break;
                    
                case 'ml-training':
                    await this.mlEngine.performScheduledTraining();
                    break;
                    
                case 'analytics-update':
                    await this.analyticsEngine.updateAnalytics();
                    break;
            }
        } catch (error) {
            console.error('Alarm handling error:', error);
            this.analyticsEngine.recordError(error, 'alarm_handling');
        }
    }

    async performDataCleanup() {
        // 清理过期数据
        await this.storageManager.cleanupExpiredData();
        
        // 压缩存储数据
        await this.storageManager.compressData();
        
        // 清理临时文件
        await this.storageManager.cleanupTempFiles();
        
        console.log('Data cleanup completed');
    }

    async handleNotificationClick(notificationId) {
        if (notificationId.startsWith('qzone-automator')) {
            // 点击通知时打开QZone页面
            const tabs = await chrome.tabs.query({ url: '*://*.qzone.qq.com/*' });
            if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { active: true });
                chrome.windows.update(tabs[0].windowId, { focused: true });
            } else {
                chrome.tabs.create({ url: 'https://user.qzone.qq.com/' });
            }
        }
    }

    async handleTabUpdate(tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete' && tab.url && tab.url.includes('qzone.qq.com')) {
            // QZone页面加载完成，注入content script
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                });
                
                await chrome.scripting.insertCSS({
                    target: { tabId: tabId },
                    files: ['content.css']
                });
            } catch (error) {
                console.error('Failed to inject content script:', error);
            }
        }
    }

    async initializeDefaultSettings() {
        const settings = await this.getSettings();
        if (!settings || Object.keys(settings).length === 0) {
            const defaultSettings = {
                // 基本设置
                enabled: false,
                autoStart: false,
                likeDelay: { min: 2000, max: 5000 },
                dailyLimit: 100,
                
                // 智能过滤
                smartFilter: {
                    enabled: true,
                    skipLiked: true,
                    skipOwnPosts: true,
                    skipAds: true,
                    keywordFilter: [],
                    userFilter: []
                },
                
                // 通知设置
                notifications: {
                    enabled: true,
                    desktop: true,
                    sound: false,
                    onComplete: true,
                    onError: true,
                    onLimit: true
                },
                
                // 高级设置
                advanced: {
                    batchSize: 10,
                    retryAttempts: 3,
                    scrollDelay: 1000,
                    pageLoadTimeout: 10000,
                    debugMode: false
                },
                
                // 主题设置
                theme: {
                    mode: 'auto', // auto, light, dark
                    accentColor: '#667eea',
                    animations: true
                },
                
                // 数据分析
                analytics: {
                    enabled: true,
                    trackPerformance: true,
                    trackErrors: true
                }
            };
            
            await chrome.storage.sync.set({ settings: defaultSettings });
        }
    }

    async startAutomation(config = {}) {
        this.isRunning = true;
        
        // 保存运行状态
        await chrome.storage.local.set({
            automationStatus: {
                isRunning: true,
                isPaused: false,
                startTime: Date.now(),
                config: config
            }
        });

        // 设置定时器
        chrome.alarms.create(this.alarmName, { periodInMinutes: 1 });

        // 发送消息给所有QZone标签页
        await this.broadcastToQZoneTabs('automationStarted', config);

        // 显示开始通知
        if (config.notifications?.enabled) {
            await this.showNotification(
                'automation-started',
                'QZone Praise Automator Pro',
                '自动点赞已开始运行',
                'notifications/start.png'
            );
        }
    }

    async stopAutomation() {
        this.isRunning = false;
        
        // 清除定时器
        chrome.alarms.clear(this.alarmName);
        
        // 更新运行状态
        await chrome.storage.local.set({
            automationStatus: {
                isRunning: false,
                isPaused: false,
                stopTime: Date.now()
            }
        });

        // 发送消息给所有QZone标签页
        await this.broadcastToQZoneTabs('automationStopped');

        // 显示停止通知
        const settings = await this.getSettings();
        if (settings.notifications?.enabled) {
            await this.showNotification(
                'automation-stopped',
                'QZone Praise Automator Pro',
                '自动点赞已停止',
                'notifications/stop.png'
            );
        }
    }

    async pauseAutomation() {
        await chrome.storage.local.set({
            automationStatus: {
                ...(await this.getStatus()),
                isPaused: true,
                pauseTime: Date.now()
            }
        });

        await this.broadcastToQZoneTabs('automationPaused');
    }

    async resumeAutomation() {
        await chrome.storage.local.set({
            automationStatus: {
                ...(await this.getStatus()),
                isPaused: false,
                resumeTime: Date.now()
            }
        });

        await this.broadcastToQZoneTabs('automationResumed');
    }

    async getStatus() {
        const result = await chrome.storage.local.get('automationStatus');
        return result.automationStatus || {
            isRunning: false,
            isPaused: false
        };
    }

    async getSettings() {
        const result = await chrome.storage.sync.get('settings');
        return result.settings || {};
    }

    async updateSettings(newSettings) {
        const currentSettings = await this.getSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };
        await chrome.storage.sync.set({ settings: updatedSettings });
        
        // 通知所有标签页设置已更新
        await this.broadcastToQZoneTabs('settingsUpdated', updatedSettings);
    }

    async getStatistics() {
        const result = await chrome.storage.local.get('statistics');
        return result.statistics || {
            totalLikes: 0,
            todayLikes: 0,
            successRate: 0,
            totalRunTime: 0,
            lastRunDate: null,
            dailyStats: {},
            weeklyStats: {},
            monthlyStats: {}
        };
    }

    async updateStatistics(newStats) {
        const currentStats = await this.getStatistics();
        const updatedStats = { ...currentStats, ...newStats };
        
        // 更新日期相关统计
        const today = new Date().toDateString();
        if (currentStats.lastRunDate !== today) {
            updatedStats.todayLikes = newStats.todayLikes || 0;
            updatedStats.lastRunDate = today;
        }
        
        await chrome.storage.local.set({ statistics: updatedStats });
        
        // 通知popup更新统计信息
        await this.broadcastToPopup('statisticsUpdated', updatedStats);
    }

    async performScheduledTasks() {
        const status = await this.getStatus();
        if (!status.isRunning || status.isPaused) {
            return;
        }

        const settings = await this.getSettings();
        const stats = await this.getStatistics();

        // 检查每日限制
        if (stats.todayLikes >= settings.dailyLimit) {
            await this.stopAutomation();
            if (settings.notifications?.onLimit) {
                await this.showNotification(
                    'daily-limit-reached',
                    'QZone Praise Automator Pro',
                    `已达到每日点赞限制 (${settings.dailyLimit})`,
                    'notifications/limit.png'
                );
            }
            return;
        }

        // 执行其他定时任务
        await this.performDataBackup();
        await this.performPerformanceAnalysis();
    }

    async performDataBackup() {
        const settings = await this.getSettings();
        if (!settings.advanced?.autoBackup) return;

        const data = await this.exportData();
        const backupKey = `backup_${Date.now()}`;
        
        // 保留最近5个备份
        const backups = await chrome.storage.local.get(null);
        const backupKeys = Object.keys(backups).filter(key => key.startsWith('backup_'));
        
        if (backupKeys.length >= 5) {
            const oldestBackup = backupKeys.sort()[0];
            await chrome.storage.local.remove(oldestBackup);
        }
        
        await chrome.storage.local.set({ [backupKey]: data });
    }

    async performPerformanceAnalysis() {
        const stats = await this.getStatistics();
        const settings = await this.getSettings();
        
        if (!settings.analytics?.enabled) return;

        // 分析成功率
        if (stats.successRate < 0.8 && stats.totalLikes > 50) {
            await this.showNotification(
                'low-success-rate',
                'QZone Praise Automator Pro',
                '检测到成功率较低，建议检查网络连接或调整设置',
                'notifications/warning.png'
            );
        }

        // 分析使用模式
        const usage = await this.analyzeUsagePattern();
        if (usage.recommendation) {
            await this.broadcastToPopup('usageRecommendation', usage);
        }
    }

    async analyzeUsagePattern() {
        const stats = await this.getStatistics();
        const settings = await this.getSettings();
        
        // 简单的使用模式分析
        const avgDelay = (settings.likeDelay.min + settings.likeDelay.max) / 2;
        const recommendation = {};
        
        if (avgDelay < 3000 && stats.successRate < 0.9) {
            recommendation.type = 'delay';
            recommendation.message = '建议增加点赞间隔以提高成功率';
            recommendation.suggestedDelay = { min: 3000, max: 6000 };
        }
        
        if (stats.todayLikes > settings.dailyLimit * 0.8) {
            recommendation.type = 'limit';
            recommendation.message = '今日点赞量接近限制，建议适当休息';
        }
        
        return recommendation;
    }

    async broadcastToQZoneTabs(action, data = {}) {
        const tabs = await chrome.tabs.query({ url: '*://*.qzone.qq.com/*' });
        for (const tab of tabs) {
            try {
                await chrome.tabs.sendMessage(tab.id, { action, data });
            } catch (error) {
                // 忽略无法发送消息的标签页
            }
        }
    }

    async broadcastToPopup(action, data = {}) {
        try {
            await chrome.runtime.sendMessage({ action, data });
        } catch (error) {
            // Popup可能未打开，忽略错误
        }
    }

    async showNotification(id, title, message, iconUrl = 'icons/icon48.png') {
        const settings = await this.getSettings();
        if (!settings.notifications?.enabled || !settings.notifications?.desktop) {
            return;
        }

        await chrome.notifications.create(`qzone-automator-${id}`, {
            type: 'basic',
            iconUrl: iconUrl,
            title: title,
            message: message,
            priority: 1
        });
    }

    async exportData() {
        const settings = await this.getSettings();
        const statistics = await this.getStatistics();
        const status = await this.getStatus();
        
        return {
            version: chrome.runtime.getManifest().version,
            exportDate: new Date().toISOString(),
            settings,
            statistics,
            status
        };
    }

    async importData(data) {
        if (data.settings) {
            await chrome.storage.sync.set({ settings: data.settings });
        }
        
        if (data.statistics) {
            await chrome.storage.local.set({ statistics: data.statistics });
        }
        
        // 通知所有组件数据已导入
        await this.broadcastToQZoneTabs('dataImported', data);
        await this.broadcastToPopup('dataImported', data);
    }

    async clearData() {
        try {
            // 安全确认
            const confirmed = await this.securityManager.confirmDataClear();
            if (!confirmed) {
                throw new Error('Data clear operation not confirmed');
            }
            
            // 备份重要数据
            const backup = await this.exportData();
            await this.storageManager.createEmergencyBackup(backup);
            
            // 清除存储数据
            await chrome.storage.local.clear();
            await chrome.storage.sync.clear();
            
            // 重置所有模块
            await this.resetAllModules();
            
            // 重新初始化默认设置
            await this.initializeDefaultSettings();
            
            // 通知所有组件数据已清除
            await this.broadcastToQZoneTabs('dataCleared');
            await this.broadcastToPopup('dataCleared');
            
            console.log('Data cleared successfully');
        } catch (error) {
            console.error('Failed to clear data:', error);
            this.analyticsEngine.recordError(error, 'data_clear');
            throw error;
        }
    }

    async resetAllModules() {
        await this.analyticsEngine.reset();
        await this.recommendationSystem.reset();
        await this.mlEngine.reset();
        await this.performanceOptimizer.reset();
        await this.notificationSystem.reset();
    }

    async generateVisualization(type, data) {
        try {
            const visualizationEngine = new VisualizationEngine();
            return await visualizationEngine.generate(type, data);
        } catch (error) {
            console.error('Visualization generation error:', error);
            this.analyticsEngine.recordError(error, 'visualization');
            throw error;
        }
    }
}

// 初始化背景服务
let backgroundService;

(async () => {
    try {
        backgroundService = new BackgroundService();
        await backgroundService.init();
        
        // 导出服务实例供其他脚本使用
        self.backgroundService = backgroundService;
        
        console.log('QZone Praise Automator Pro background service ready');
    } catch (error) {
        console.error('Failed to initialize background service:', error);
        
        // 创建基础服务实例作为后备
        backgroundService = new BackgroundService();
        await backgroundService.initializeBasicMode();
        self.backgroundService = backgroundService;
    }
})();

// 全局错误处理
self.addEventListener('error', (event) => {
    console.error('Global error in background script:', event.error);
    if (backgroundService?.analyticsEngine) {
        backgroundService.analyticsEngine.recordError(event.error, 'global');
    }
});

// 未处理的Promise拒绝
self.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection in background script:', event.reason);
    if (backgroundService?.analyticsEngine) {
        backgroundService.analyticsEngine.recordError(event.reason, 'unhandled_promise');
    }
});