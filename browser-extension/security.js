// QZone Praise Automator Pro - Advanced Security Module

class SecurityManager {
    constructor() {
        this.encryptionKey = null;
        this.sessionToken = null;
        this.securityLevel = 'medium';
        this.accessLog = [];
        this.threatDetector = new ThreatDetector();
        this.dataProtector = new DataProtector();
        this.accessController = new AccessController();
        this.auditLogger = new AuditLogger();
        
        this.settings = {
            encryption: {
                enabled: true,
                algorithm: 'AES-GCM',
                keyLength: 256
            },
            authentication: {
                enabled: false,
                method: 'password', // password, biometric, token
                timeout: 3600000, // 1小时
                maxAttempts: 3
            },
            monitoring: {
                enabled: true,
                logLevel: 'info',
                alertThreshold: 5,
                realTimeMonitoring: true
            },
            dataProtection: {
                sensitiveDataMask: true,
                autoBackup: true,
                backupEncryption: true,
                dataRetention: 30 // 天
            },
            accessControl: {
                ipWhitelist: [],
                timeRestrictions: {
                    enabled: false,
                    allowedHours: { start: 9, end: 18 }
                },
                featurePermissions: {
                    automation: true,
                    dataExport: true,
                    settingsModify: true,
                    statisticsView: true
                }
            }
        };
        
        // 异步初始化，避免在构造函数中调用
        this.initAsync();
    }
    
    async initAsync() {
        try {
            await this.init();
        } catch (error) {
            console.error('Security manager initialization failed:', error);
        }
    }

    async init() {
        await this.loadSettings();
        await this.initializeEncryption();
        this.startSecurityMonitoring();
        this.setupEventListeners();
        await this.performSecurityCheck();
    }

    // 加载安全设置
    async loadSettings() {
        try {
            const stored = await chrome.storage.local.get('securitySettings');
            if (stored.securitySettings) {
                this.settings = { ...this.settings, ...stored.securitySettings };
            }
        } catch (error) {
            console.error('Failed to load security settings:', error);
        }
    }

    // 保存安全设置
    async saveSettings() {
        try {
            await chrome.storage.local.set({
                securitySettings: this.settings
            });
        } catch (error) {
            console.error('Failed to save security settings:', error);
        }
    }

    // 初始化加密
    async initializeEncryption() {
        if (!this.settings.encryption.enabled) {
            return;
        }
        
        try {
            // 生成或获取加密密钥
            const storedKey = await this.getStoredEncryptionKey();
            if (storedKey) {
                this.encryptionKey = storedKey;
            } else {
                this.encryptionKey = await this.generateEncryptionKey();
                await this.storeEncryptionKey(this.encryptionKey);
            }
            
            console.log('Encryption initialized successfully');
        } catch (error) {
            console.error('Failed to initialize encryption:', error);
            this.settings.encryption.enabled = false;
        }
    }

    // 生成加密密钥
    async generateEncryptionKey() {
        const key = await crypto.subtle.generateKey(
            {
                name: this.settings.encryption.algorithm,
                length: this.settings.encryption.keyLength
            },
            true,
            ['encrypt', 'decrypt']
        );
        
        return key;
    }

    // 存储加密密钥
    async storeEncryptionKey(key) {
        const exported = await crypto.subtle.exportKey('jwk', key);
        const keyData = JSON.stringify(exported);
        
        // 使用浏览器的安全存储
        await chrome.storage.local.set({
            encryptionKey: keyData
        });
    }

    // 获取存储的加密密钥
    async getStoredEncryptionKey() {
        try {
            const result = await chrome.storage.local.get('encryptionKey');
            if (result.encryptionKey) {
                const keyData = JSON.parse(result.encryptionKey);
                return await crypto.subtle.importKey(
                    'jwk',
                    keyData,
                    {
                        name: this.settings.encryption.algorithm,
                        length: this.settings.encryption.keyLength
                    },
                    true,
                    ['encrypt', 'decrypt']
                );
            }
        } catch (error) {
            console.error('Failed to get stored encryption key:', error);
        }
        
        return null;
    }

    // 加密数据
    async encrypt(data) {
        if (!this.settings.encryption.enabled || !this.encryptionKey) {
            return data;
        }
        
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: this.settings.encryption.algorithm,
                    iv: iv
                },
                this.encryptionKey,
                dataBuffer
            );
            
            // 组合IV和加密数据
            const result = new Uint8Array(iv.length + encrypted.byteLength);
            result.set(iv);
            result.set(new Uint8Array(encrypted), iv.length);
            
            // 转换为Base64
            return btoa(String.fromCharCode(...result));
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('数据加密失败');
        }
    }

    // 解密数据
    async decrypt(encryptedData) {
        if (!this.settings.encryption.enabled || !this.encryptionKey) {
            return encryptedData;
        }
        
        try {
            // 从Base64解码
            const data = new Uint8Array(
                atob(encryptedData).split('').map(char => char.charCodeAt(0))
            );
            
            // 分离IV和加密数据
            const iv = data.slice(0, 12);
            const encrypted = data.slice(12);
            
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: this.settings.encryption.algorithm,
                    iv: iv
                },
                this.encryptionKey,
                encrypted
            );
            
            const decoder = new TextDecoder();
            const decryptedText = decoder.decode(decrypted);
            
            return JSON.parse(decryptedText);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('数据解密失败');
        }
    }

    // 安全存储数据
    async secureStore(key, data) {
        try {
            const encryptedData = await this.encrypt(data);
            await chrome.storage.local.set({ [key]: encryptedData });
            
            this.auditLogger.log('data_store', {
                key: this.maskSensitiveData(key),
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Secure store failed:', error);
            throw new Error('安全存储失败');
        }
    }

    // 安全获取数据
    async secureGet(key) {
        try {
            const result = await chrome.storage.local.get(key);
            if (result[key]) {
                const decryptedData = await this.decrypt(result[key]);
                
                this.auditLogger.log('data_access', {
                    key: this.maskSensitiveData(key),
                    timestamp: Date.now()
                });
                
                return decryptedData;
            }
            return null;
        } catch (error) {
            console.error('Secure get failed:', error);
            throw new Error('安全获取失败');
        }
    }

    // 身份验证
    async authenticate(credentials) {
        if (!this.settings.authentication.enabled) {
            return true;
        }
        
        try {
            const result = await this.accessController.authenticate(credentials);
            if (result.success) {
                this.sessionToken = this.generateSessionToken();
                this.auditLogger.log('authentication_success', {
                    method: this.settings.authentication.method,
                    timestamp: Date.now()
                });
                
                // 设置会话超时
                setTimeout(() => {
                    this.logout();
                }, this.settings.authentication.timeout);
                
                return true;
            } else {
                this.auditLogger.log('authentication_failure', {
                    method: this.settings.authentication.method,
                    reason: result.reason,
                    timestamp: Date.now()
                });
                
                return false;
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            return false;
        }
    }

    // 生成会话令牌
    generateSessionToken() {
        const timestamp = Date.now();
        const random = crypto.getRandomValues(new Uint8Array(16));
        const tokenData = timestamp + '_' + Array.from(random).map(b => b.toString(16).padStart(2, '0')).join('');
        return btoa(tokenData);
    }

    // 验证会话
    validateSession() {
        if (!this.settings.authentication.enabled) {
            return true;
        }
        
        return this.sessionToken !== null;
    }

    // 登出
    logout() {
        this.sessionToken = null;
        this.auditLogger.log('logout', {
            timestamp: Date.now()
        });
    }

    // 检查权限
    checkPermission(feature) {
        if (!this.validateSession()) {
            return false;
        }
        
        return this.settings.accessControl.featurePermissions[feature] || false;
    }

    // 执行安全检查
    async performSecurityCheck() {
        const checks = [
            this.checkExtensionIntegrity(),
            this.checkStorageIntegrity(),
            this.checkNetworkSecurity(),
            this.checkPermissions()
        ];
        
        const results = await Promise.allSettled(checks);
        const issues = results.filter(result => result.status === 'rejected' || !result.value);
        
        if (issues.length > 0) {
            this.auditLogger.log('security_check_failed', {
                issues: issues.length,
                timestamp: Date.now()
            });
            
            return false;
        }
        
        this.auditLogger.log('security_check_passed', {
            timestamp: Date.now()
        });
        
        return true;
    }

    // 检查扩展完整性
    async checkExtensionIntegrity() {
        try {
            // 检查关键文件是否存在
            const criticalFiles = [
                'manifest.json',
                'background.js',
                'content.js',
                'popup.js'
            ];
            
            // 这里应该检查文件的哈希值或签名
            // 简化实现，只检查文件是否可访问
            return true;
        } catch (error) {
            console.error('Extension integrity check failed:', error);
            return false;
        }
    }

    // 检查存储完整性
    async checkStorageIntegrity() {
        try {
            // 检查存储是否可访问
            await chrome.storage.local.get('test');
            
            // 检查关键数据是否存在
            const criticalData = await chrome.storage.local.get([
                'settings',
                'statistics',
                'automationStatus'
            ]);
            
            return true;
        } catch (error) {
            console.error('Storage integrity check failed:', error);
            return false;
        }
    }

    // 检查网络安全
    async checkNetworkSecurity() {
        try {
            // 检查是否在安全环境中运行（仅在浏览器环境中）
            if (typeof location !== 'undefined') {
                if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
                    console.warn('Running in insecure environment');
                }
            }
            
            // 检查CSP设置（仅在浏览器环境中）
            if (typeof document !== 'undefined') {
                const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                if (!csp) {
                    console.warn('No CSP header found');
                }
            }
            
            return true;
        } catch (error) {
            console.error('Network security check failed:', error);
            return false;
        }
    }

    // 检查权限
    async checkPermissions() {
        try {
            // 检查扩展权限
            const permissions = await chrome.permissions.getAll();
            
            // 验证必要权限
            const requiredPermissions = ['storage', 'activeTab', 'notifications'];
            const hasAllPermissions = requiredPermissions.every(permission => 
                permissions.permissions.includes(permission)
            );
            
            if (!hasAllPermissions) {
                console.warn('Missing required permissions');
            }
            
            return hasAllPermissions;
        } catch (error) {
            console.error('Permission check failed:', error);
            return false;
        }
    }

    // 启动安全监控
    startSecurityMonitoring() {
        if (!this.settings.monitoring.enabled) {
            return;
        }
        
        // 监控异常活动
        this.threatDetector.start();
        
        // 定期安全检查
        setInterval(() => {
            this.performSecurityCheck();
        }, 300000); // 5分钟
        
        // 监控存储变化
        chrome.storage.onChanged.addListener((changes, namespace) => {
            this.auditLogger.log('storage_change', {
                namespace,
                keys: Object.keys(changes),
                timestamp: Date.now()
            });
        });
    }

    // 设置事件监听器
    setupEventListeners() {
        // 监听页面可见性变化（仅在浏览器环境中）
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.auditLogger.log('page_hidden', {
                        timestamp: Date.now()
                    });
                } else {
                    this.auditLogger.log('page_visible', {
                        timestamp: Date.now()
                    });
                }
            });
        }
        
        // 监听错误事件（仅在浏览器环境中）
        if (typeof window !== 'undefined') {
            window.addEventListener('error', (event) => {
                this.auditLogger.log('javascript_error', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    timestamp: Date.now()
                });
            });
            
            // 监听未处理的Promise拒绝
             window.addEventListener('unhandledrejection', (event) => {
                 this.auditLogger.log('unhandled_rejection', {
                     reason: event.reason,
                     timestamp: Date.now()
                 });
             });
        }
    }

    // 掩码敏感数据
    maskSensitiveData(data) {
        if (!this.settings.dataProtection.sensitiveDataMask) {
            return data;
        }
        
        if (typeof data === 'string') {
            // 掩码邮箱
            data = data.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, 
                (match, user, domain) => {
                    const maskedUser = user.length > 2 ? 
                        user.substring(0, 2) + '*'.repeat(user.length - 2) : 
                        user;
                    return maskedUser + '@' + domain;
                });
            
            // 掩码手机号
            data = data.replace(/(\d{3})\d{4}(\d{4})/g, '$1****$2');
            
            // 掩码身份证号
            data = data.replace(/(\d{6})\d{8}(\d{4})/g, '$1********$2');
        }
        
        return data;
    }

    // 生成安全报告
    generateSecurityReport() {
        const report = {
            timestamp: Date.now(),
            securityLevel: this.securityLevel,
            encryptionStatus: this.settings.encryption.enabled,
            authenticationStatus: this.settings.authentication.enabled,
            sessionStatus: this.validateSession(),
            threatLevel: this.threatDetector.getThreatLevel(),
            auditLog: this.auditLogger.getRecentLogs(100),
            recommendations: this.generateSecurityRecommendations()
        };
        
        return report;
    }

    // 生成安全建议
    generateSecurityRecommendations() {
        const recommendations = [];
        
        if (!this.settings.encryption.enabled) {
            recommendations.push({
                type: 'warning',
                message: '建议启用数据加密以保护敏感信息',
                action: 'enableEncryption'
            });
        }
        
        if (!this.settings.authentication.enabled) {
            recommendations.push({
                type: 'info',
                message: '考虑启用身份验证以增强安全性',
                action: 'enableAuthentication'
            });
        }
        
        if (this.threatDetector.getThreatLevel() > 3) {
            recommendations.push({
                type: 'error',
                message: '检测到高风险活动，建议立即检查',
                action: 'reviewActivity'
            });
        }
        
        return recommendations;
    }

    // 导出安全数据
    async exportSecurityData() {
        if (!this.checkPermission('dataExport')) {
            throw new Error('没有数据导出权限');
        }
        
        const data = {
            auditLog: this.auditLogger.getAllLogs(),
            securityReport: this.generateSecurityReport(),
            settings: this.settings
        };
        
        const encryptedData = await this.encrypt(data);
        
        this.auditLogger.log('data_export', {
            timestamp: Date.now()
        });
        
        return encryptedData;
    }

    // 清除安全数据
    async clearSecurityData() {
        if (!this.checkPermission('settingsModify')) {
            throw new Error('没有设置修改权限');
        }
        
        this.auditLogger.clear();
        this.threatDetector.reset();
        
        await chrome.storage.local.remove([
            'securitySettings',
            'encryptionKey',
            'auditLog'
        ]);
        
        this.auditLogger.log('data_clear', {
            timestamp: Date.now()
        });
    }

    // 更新安全设置
    updateSettings(newSettings) {
        if (!this.checkPermission('settingsModify')) {
            throw new Error('没有设置修改权限');
        }
        
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        this.auditLogger.log('settings_update', {
            changes: Object.keys(newSettings),
            timestamp: Date.now()
        });
    }
}

// 威胁检测器
class ThreatDetector {
    constructor() {
        this.threatLevel = 0;
        this.suspiciousActivities = [];
        this.patterns = new Map();
        this.isActive = false;
        
        this.setupPatterns();
    }

    setupPatterns() {
        // 异常访问模式
        this.patterns.set('rapidAccess', {
            name: '快速访问',
            threshold: 10,
            timeWindow: 60000, // 1分钟
            weight: 2
        });
        
        // 异常数据量
        this.patterns.set('largeDataAccess', {
            name: '大量数据访问',
            threshold: 1000000, // 1MB
            weight: 3
        });
        
        // 异常时间访问
        this.patterns.set('offHoursAccess', {
            name: '非工作时间访问',
            weight: 1
        });
        
        // 重复失败操作
        this.patterns.set('repeatedFailures', {
            name: '重复失败操作',
            threshold: 5,
            timeWindow: 300000, // 5分钟
            weight: 4
        });
    }

    start() {
        this.isActive = true;
        this.startMonitoring();
    }

    stop() {
        this.isActive = false;
        this.stopMonitoring();
    }

    startMonitoring() {
        if (this.monitoringStarted) {
            return;
        }
        this.monitoringStarted = true;
        
        // 监控访问频率
        this.patternCheckInterval = setInterval(() => {
            this.checkAccessPatterns();
        }, 60000); // 每分钟检查一次
        
        // 清理旧数据
        this.cleanupInterval = setInterval(() => {
            this.cleanupOldActivities();
        }, 300000); // 每5分钟清理一次
    }

    stopMonitoring() {
        if (this.patternCheckInterval) {
            clearInterval(this.patternCheckInterval);
            this.patternCheckInterval = null;
        }
        
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        this.monitoringStarted = false;
    }

    recordActivity(type, data) {
        if (!this.isActive) return;
        
        const activity = {
            type,
            data,
            timestamp: Date.now()
        };
        
        this.suspiciousActivities.push(activity);
        this.analyzeThreat(activity);
    }

    analyzeThreat(activity) {
        let threatIncrease = 0;
        
        // 检查各种威胁模式
        for (const [patternName, pattern] of this.patterns) {
            if (this.matchesPattern(activity, pattern)) {
                threatIncrease += pattern.weight;
            }
        }
        
        this.threatLevel = Math.min(10, this.threatLevel + threatIncrease);
        
        // 威胁级别衰减
        setTimeout(() => {
            this.threatLevel = Math.max(0, this.threatLevel - threatIncrease * 0.5);
        }, 300000); // 5分钟后衰减
    }

    matchesPattern(activity, pattern) {
        switch (pattern.name) {
            case '快速访问':
                return this.checkRapidAccess(pattern);
            case '大量数据访问':
                return this.checkLargeDataAccess(activity, pattern);
            case '非工作时间访问':
                return this.checkOffHoursAccess(activity);
            case '重复失败操作':
                return this.checkRepeatedFailures(pattern);
            default:
                return false;
        }
    }

    checkRapidAccess(pattern) {
        const recentActivities = this.suspiciousActivities.filter(
            a => Date.now() - a.timestamp < pattern.timeWindow
        );
        return recentActivities.length > pattern.threshold;
    }

    checkLargeDataAccess(activity, pattern) {
        return activity.data && activity.data.size > pattern.threshold;
    }

    checkOffHoursAccess(activity) {
        const hour = new Date(activity.timestamp).getHours();
        return hour < 8 || hour > 18;
    }

    checkRepeatedFailures(pattern) {
        const recentFailures = this.suspiciousActivities.filter(
            a => a.type === 'failure' && Date.now() - a.timestamp < pattern.timeWindow
        );
        return recentFailures.length > pattern.threshold;
    }

    checkAccessPatterns() {
        // 分析访问模式
        const patterns = this.analyzePatterns();
        
        if (patterns.anomalies.length > 0) {
            this.threatLevel += patterns.anomalies.length;
        }
    }

    analyzePatterns() {
        const activities = this.suspiciousActivities.filter(
            a => Date.now() - a.timestamp < 3600000 // 最近1小时
        );
        
        const anomalies = [];
        
        // 检查访问频率异常
        const accessCounts = {};
        activities.forEach(activity => {
            const minute = Math.floor(activity.timestamp / 60000);
            accessCounts[minute] = (accessCounts[minute] || 0) + 1;
        });
        
        const avgAccess = Object.values(accessCounts).reduce((a, b) => a + b, 0) / Object.keys(accessCounts).length;
        
        Object.entries(accessCounts).forEach(([minute, count]) => {
            if (count > avgAccess * 3) {
                anomalies.push({
                    type: 'highFrequency',
                    minute: parseInt(minute),
                    count
                });
            }
        });
        
        return { anomalies };
    }

    cleanupOldActivities() {
        const cutoff = Date.now() - 3600000; // 1小时前
        this.suspiciousActivities = this.suspiciousActivities.filter(
            a => a.timestamp > cutoff
        );
    }

    getThreatLevel() {
        return this.threatLevel;
    }

    getActivities() {
        return this.suspiciousActivities;
    }

    reset() {
        this.threatLevel = 0;
        this.suspiciousActivities = [];
    }
}

// 数据保护器
class DataProtector {
    constructor() {
        this.backupInterval = 3600000; // 1小时
        this.maxBackups = 10;
        this.isActive = false;
    }

    start() {
        this.isActive = true;
        this.startAutoBackup();
    }

    stop() {
        this.isActive = false;
    }

    startAutoBackup() {
        setInterval(() => {
            if (this.isActive) {
                this.createBackup();
            }
        }, this.backupInterval);
    }

    async createBackup() {
        try {
            const data = await chrome.storage.local.get();
            const backup = {
                timestamp: Date.now(),
                data: data
            };
            
            const backups = await this.getBackups();
            backups.push(backup);
            
            // 保持最大备份数量
            if (backups.length > this.maxBackups) {
                backups.splice(0, backups.length - this.maxBackups);
            }
            
            await chrome.storage.local.set({ backups });
            
            console.log('Backup created successfully');
        } catch (error) {
            console.error('Failed to create backup:', error);
        }
    }

    async getBackups() {
        try {
            const result = await chrome.storage.local.get('backups');
            return result.backups || [];
        } catch (error) {
            console.error('Failed to get backups:', error);
            return [];
        }
    }

    async restoreBackup(timestamp) {
        try {
            const backups = await this.getBackups();
            const backup = backups.find(b => b.timestamp === timestamp);
            
            if (!backup) {
                throw new Error('备份不存在');
            }
            
            await chrome.storage.local.clear();
            await chrome.storage.local.set(backup.data);
            
            console.log('Backup restored successfully');
            return true;
        } catch (error) {
            console.error('Failed to restore backup:', error);
            return false;
        }
    }
}

// 访问控制器
class AccessController {
    constructor() {
        this.failedAttempts = new Map();
        this.blockedIPs = new Set();
    }

    async authenticate(credentials) {
        const clientIP = await this.getClientIP();
        
        // 检查IP是否被阻止
        if (this.blockedIPs.has(clientIP)) {
            return {
                success: false,
                reason: 'IP被阻止'
            };
        }
        
        // 检查失败次数
        const attempts = this.failedAttempts.get(clientIP) || 0;
        if (attempts >= 3) {
            this.blockedIPs.add(clientIP);
            return {
                success: false,
                reason: '尝试次数过多'
            };
        }
        
        // 验证凭据
        const isValid = await this.validateCredentials(credentials);
        
        if (isValid) {
            this.failedAttempts.delete(clientIP);
            return { success: true };
        } else {
            this.failedAttempts.set(clientIP, attempts + 1);
            return {
                success: false,
                reason: '凭据无效'
            };
        }
    }

    async getClientIP() {
        // 简化实现，实际应该获取真实IP
        return 'localhost';
    }

    async validateCredentials(credentials) {
        // 简化实现，实际应该验证密码或生物识别
        return credentials && credentials.password === 'admin123';
    }
}

// 审计日志记录器
class AuditLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
    }

    log(action, details = {}) {
        const logEntry = {
            id: this.generateId(),
            action,
            details,
            timestamp: Date.now(),
            userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) || 'unknown',
            url: (typeof location !== 'undefined' && location.href) || 'unknown'
        };
        
        this.logs.push(logEntry);
        
        // 保持最大日志数量
        if (this.logs.length > this.maxLogs) {
            this.logs.splice(0, this.logs.length - this.maxLogs);
        }
        
        // 持久化日志
        this.persistLogs();
    }

    async persistLogs() {
        try {
            await chrome.storage.local.set({
                auditLog: this.logs
            });
        } catch (error) {
            console.error('Failed to persist audit logs:', error);
        }
    }

    async loadLogs() {
        try {
            const result = await chrome.storage.local.get('auditLog');
            if (result.auditLog) {
                this.logs = result.auditLog;
            }
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        }
    }

    getRecentLogs(count = 50) {
        return this.logs.slice(-count);
    }

    getAllLogs() {
        return this.logs;
    }

    clear() {
        this.logs = [];
        this.persistLogs();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// 导出安全管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecurityManager, ThreatDetector, DataProtector, AccessController, AuditLogger };
} else if (typeof window !== 'undefined') {
    window.SecurityManager = SecurityManager;
    window.ThreatDetector = ThreatDetector;
    window.DataProtector = DataProtector;
    window.AccessController = AccessController;
    window.AuditLogger = AuditLogger;
}