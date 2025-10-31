// QZone Praise Automator Pro - Storage Management Module

class StorageManager {
    constructor() {
        this.syncKeys = ['settings', 'userProfiles', 'themes'];
        this.localKeys = ['statistics', 'automationStatus', 'cache', 'logs'];
        this.sessionKeys = ['tempData', 'currentSession'];
        
        // 数据版本控制
        this.dataVersion = '1.0.0';
        this.migrationHandlers = new Map();
        
        // 异步初始化，避免在构造函数中调用
        this.initAsync();
    }
    
    async initAsync() {
        try {
            await this.init();
        } catch (error) {
            console.error('Storage manager initialization failed:', error);
        }
    }

    async init() {
        // 检查数据版本并执行迁移
        await this.checkAndMigrateData();
        
        // 设置存储变化监听器
        this.setupStorageListeners();
        
        // 初始化默认数据
        await this.initializeDefaultData();
    }

    // ==================== 基础存储操作 ====================

    async get(key, storageType = 'auto') {
        try {
            const storage = this.getStorageArea(key, storageType);
            const result = await storage.get(key);
            return result[key];
        } catch (error) {
            console.error(`Failed to get ${key} from storage:`, error);
            return null;
        }
    }

    async set(key, value, storageType = 'auto') {
        try {
            const storage = this.getStorageArea(key, storageType);
            await storage.set({ [key]: value });
            
            // 触发存储变化事件
            this.emitStorageChange(key, value, storageType);
            
            return true;
        } catch (error) {
            console.error(`Failed to set ${key} in storage:`, error);
            return false;
        }
    }

    async remove(key, storageType = 'auto') {
        try {
            const storage = this.getStorageArea(key, storageType);
            await storage.remove(key);
            
            this.emitStorageChange(key, null, storageType);
            return true;
        } catch (error) {
            console.error(`Failed to remove ${key} from storage:`, error);
            return false;
        }
    }

    async clear(storageType = 'all') {
        try {
            if (storageType === 'all') {
                await chrome.storage.sync.clear();
                await chrome.storage.local.clear();
                await chrome.storage.session.clear();
            } else {
                const storage = this.getStorageByType(storageType);
                await storage.clear();
            }
            
            this.emitStorageChange('*', null, storageType);
            return true;
        } catch (error) {
            console.error(`Failed to clear ${storageType} storage:`, error);
            return false;
        }
    }

    // ==================== 高级存储操作 ====================

    async getMultiple(keys, storageType = 'auto') {
        try {
            const results = {};
            
            for (const key of keys) {
                const storage = this.getStorageArea(key, storageType);
                const result = await storage.get(key);
                results[key] = result[key];
            }
            
            return results;
        } catch (error) {
            console.error('Failed to get multiple keys:', error);
            return {};
        }
    }

    async setMultiple(data, storageType = 'auto') {
        try {
            const syncData = {};
            const localData = {};
            const sessionData = {};
            
            for (const [key, value] of Object.entries(data)) {
                const storage = this.getStorageArea(key, storageType);
                
                if (storage === chrome.storage.sync) {
                    syncData[key] = value;
                } else if (storage === chrome.storage.local) {
                    localData[key] = value;
                } else if (storage === chrome.storage.session) {
                    sessionData[key] = value;
                }
            }
            
            // 批量设置
            if (Object.keys(syncData).length > 0) {
                await chrome.storage.sync.set(syncData);
            }
            if (Object.keys(localData).length > 0) {
                await chrome.storage.local.set(localData);
            }
            if (Object.keys(sessionData).length > 0) {
                await chrome.storage.session.set(sessionData);
            }
            
            // 触发变化事件
            for (const [key, value] of Object.entries(data)) {
                this.emitStorageChange(key, value, storageType);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to set multiple keys:', error);
            return false;
        }
    }

    // ==================== 专用数据操作 ====================

    async getSettings() {
        const settings = await this.get('settings', 'sync');
        return settings || this.getDefaultSettings();
    }

    async updateSettings(newSettings, merge = true) {
        let settings;
        
        if (merge) {
            const currentSettings = await this.getSettings();
            settings = this.deepMerge(currentSettings, newSettings);
        } else {
            settings = newSettings;
        }
        
        // 验证设置
        settings = this.validateSettings(settings);
        
        return await this.set('settings', settings, 'sync');
    }

    async getStatistics() {
        const stats = await this.get('statistics', 'local');
        return stats || this.getDefaultStatistics();
    }

    async updateStatistics(newStats, merge = true) {
        let statistics;
        
        if (merge) {
            const currentStats = await this.getStatistics();
            statistics = this.deepMerge(currentStats, newStats);
        } else {
            statistics = newStats;
        }
        
        // 更新时间戳
        statistics.lastUpdated = Date.now();
        
        return await this.set('statistics', statistics, 'local');
    }

    async getAutomationStatus() {
        const status = await this.get('automationStatus', 'local');
        return status || {
            isRunning: false,
            isPaused: false,
            startTime: null,
            pauseTime: null,
            config: {}
        };
    }

    async updateAutomationStatus(status) {
        return await this.set('automationStatus', status, 'local');
    }

    // ==================== 缓存管理 ====================

    async getCache(key, maxAge = 3600000) { // 默认1小时
        const cache = await this.get('cache', 'local') || {};
        const item = cache[key];
        
        if (!item) return null;
        
        const now = Date.now();
        if (now - item.timestamp > maxAge) {
            // 缓存过期，删除
            delete cache[key];
            await this.set('cache', cache, 'local');
            return null;
        }
        
        return item.data;
    }

    async setCache(key, data, ttl = 3600000) { // 默认1小时TTL
        const cache = await this.get('cache', 'local') || {};
        
        cache[key] = {
            data: data,
            timestamp: Date.now(),
            ttl: ttl
        };
        
        return await this.set('cache', cache, 'local');
    }

    async clearCache() {
        return await this.set('cache', {}, 'local');
    }

    async cleanExpiredCache() {
        const cache = await this.get('cache', 'local') || {};
        const now = Date.now();
        let hasExpired = false;
        
        for (const [key, item] of Object.entries(cache)) {
            if (now - item.timestamp > item.ttl) {
                delete cache[key];
                hasExpired = true;
            }
        }
        
        if (hasExpired) {
            await this.set('cache', cache, 'local');
        }
    }

    // ==================== 日志管理 ====================

    async addLog(level, message, data = {}) {
        const logs = await this.get('logs', 'local') || [];
        
        const logEntry = {
            id: this.generateId(),
            timestamp: Date.now(),
            level: level,
            message: message,
            data: data
        };
        
        logs.push(logEntry);
        
        // 保持最近1000条日志
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        return await this.set('logs', logs, 'local');
    }

    async getLogs(level = null, limit = 100) {
        const logs = await this.get('logs', 'local') || [];
        
        let filteredLogs = logs;
        if (level) {
            filteredLogs = logs.filter(log => log.level === level);
        }
        
        return filteredLogs.slice(-limit).reverse();
    }

    async clearLogs() {
        return await this.set('logs', [], 'local');
    }

    // ==================== 数据导入导出 ====================

    async exportData() {
        const syncData = await chrome.storage.sync.get(null);
        const localData = await chrome.storage.local.get(null);
        
        return {
            version: this.dataVersion,
            exportDate: new Date().toISOString(),
            sync: syncData,
            local: localData
        };
    }

    async importData(data) {
        try {
            // 验证数据格式
            if (!data.version || !data.sync || !data.local) {
                throw new Error('Invalid data format');
            }
            
            // 检查版本兼容性
            if (data.version !== this.dataVersion) {
                data = await this.migrateData(data);
            }
            
            // 导入数据
            await chrome.storage.sync.clear();
            await chrome.storage.local.clear();
            
            await chrome.storage.sync.set(data.sync);
            await chrome.storage.local.set(data.local);
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    // ==================== 数据迁移 ====================

    async checkAndMigrateData() {
        const currentVersion = await this.get('dataVersion', 'local');
        
        if (!currentVersion || currentVersion !== this.dataVersion) {
            await this.migrateFromVersion(currentVersion);
            await this.set('dataVersion', this.dataVersion, 'local');
        }
    }

    async migrateFromVersion(fromVersion) {
        // 实现版本迁移逻辑
        console.log(`Migrating data from version ${fromVersion} to ${this.dataVersion}`);
        
        // 这里可以添加具体的迁移逻辑
        // 例如：重命名字段、转换数据格式等
    }

    // ==================== 工具方法 ====================

    getStorageArea(key, storageType) {
        if (storageType !== 'auto') {
            return this.getStorageByType(storageType);
        }
        
        if (this.syncKeys.includes(key)) {
            return chrome.storage.sync;
        } else if (this.sessionKeys.includes(key)) {
            return chrome.storage.session;
        } else {
            return chrome.storage.local;
        }
    }

    getStorageByType(type) {
        switch (type) {
            case 'sync': return chrome.storage.sync;
            case 'session': return chrome.storage.session;
            case 'local':
            default: return chrome.storage.local;
        }
    }

    setupStorageListeners() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            for (const [key, change] of Object.entries(changes)) {
                this.emitStorageChange(key, change.newValue, areaName);
            }
        });
    }

    emitStorageChange(key, value, storageType) {
        // 发送存储变化事件
        const event = new CustomEvent('storageChange', {
            detail: { key, value, storageType }
        });
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(event);
        }
    }

    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    validateSettings(settings) {
        // 验证设置的有效性
        const defaults = this.getDefaultSettings();
        
        // 确保必要字段存在
        for (const key of Object.keys(defaults)) {
            if (!(key in settings)) {
                settings[key] = defaults[key];
            }
        }
        
        // 验证数值范围
        if (settings.likeDelay) {
            settings.likeDelay.min = Math.max(1000, settings.likeDelay.min);
            settings.likeDelay.max = Math.max(settings.likeDelay.min, settings.likeDelay.max);
        }
        
        if (settings.dailyLimit) {
            settings.dailyLimit = Math.max(1, Math.min(1000, settings.dailyLimit));
        }
        
        return settings;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async initializeDefaultData() {
        // 初始化默认设置
        const settings = await this.getSettings();
        if (!settings || Object.keys(settings).length === 0) {
            await this.updateSettings(this.getDefaultSettings(), false);
        }
        
        // 初始化默认统计
        const stats = await this.getStatistics();
        if (!stats || Object.keys(stats).length === 0) {
            await this.updateStatistics(this.getDefaultStatistics(), false);
        }
    }

    getDefaultSettings() {
        return {
            enabled: false,
            autoStart: false,
            likeDelay: { min: 2000, max: 5000 },
            dailyLimit: 100,
            smartFilter: {
                enabled: true,
                skipLiked: true,
                skipOwnPosts: true,
                skipAds: true,
                keywordFilter: [],
                userFilter: []
            },
            notifications: {
                enabled: true,
                desktop: true,
                sound: false,
                onComplete: true,
                onError: true,
                onLimit: true
            },
            advanced: {
                batchSize: 10,
                retryAttempts: 3,
                scrollDelay: 1000,
                pageLoadTimeout: 10000,
                debugMode: false,
                autoBackup: true
            },
            theme: {
                mode: 'auto',
                accentColor: '#667eea',
                animations: true
            },
            analytics: {
                enabled: true,
                trackPerformance: true,
                trackErrors: true
            }
        };
    }

    getDefaultStatistics() {
        return {
            totalLikes: 0,
            todayLikes: 0,
            successRate: 0,
            totalRunTime: 0,
            lastRunDate: null,
            dailyStats: {},
            weeklyStats: {},
            monthlyStats: {},
            lastUpdated: Date.now()
        };
    }
}

// 创建全局存储管理器实例
const storageManager = new StorageManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
} else if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
} else {
    self.StorageManager = StorageManager;
}