// QZone Praise Automator Pro - Smart Notification System

class NotificationSystem {
    constructor() {
        this.notifications = new Map();
        this.templates = new Map();
        this.channels = new Map();
        this.rules = new Map();
        this.queue = [];
        this.isProcessing = false;
        this.settings = {
            enabled: true,
            sound: true,
            vibration: true,
            desktop: true,
            inApp: true,
            email: false,
            webhook: false,
            priority: 'normal',
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
            },
            frequency: {
                maxPerHour: 10,
                maxPerDay: 100,
                cooldown: 60000 // 1分钟冷却时间
            },
            filters: {
                duplicates: true,
                spam: true,
                lowPriority: false
            }
        };
        
        // 异步初始化，避免在构造函数中调用
        this.initAsync();
    }
    
    async initAsync() {
        try {
            await this.init();
        } catch (error) {
            console.error('Notification system initialization failed:', error);
        }
    }

    async init() {
        await this.loadSettings();
        this.setupChannels();
        this.setupTemplates();
        this.setupRules();
        this.startProcessor();
        this.bindEvents();
    }

    // 加载设置
    async loadSettings() {
        try {
            const stored = await chrome.storage.local.get('notificationSettings');
            if (stored.notificationSettings) {
                this.settings = { ...this.settings, ...stored.notificationSettings };
            }
        } catch (error) {
            console.error('Failed to load notification settings:', error);
        }
    }

    // 保存设置
    async saveSettings() {
        try {
            await chrome.storage.local.set({
                notificationSettings: this.settings
            });
        } catch (error) {
            console.error('Failed to save notification settings:', error);
        }
    }

    // 设置通知渠道
    setupChannels() {
        // 桌面通知渠道
        this.channels.set('desktop', {
            name: '桌面通知',
            enabled: this.settings.desktop,
            send: async (notification) => {
                if (!('Notification' in window)) {
                    throw new Error('浏览器不支持桌面通知');
                }
                
                if (Notification.permission !== 'granted') {
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') {
                        throw new Error('用户拒绝了桌面通知权限');
                    }
                }
                
                const options = {
                    icon: notification.icon || '/icons/icon-48.svg',
                    body: notification.body,
                    tag: notification.id,
                    requireInteraction: notification.priority === 'high',
                    silent: !this.settings.sound,
                    vibrate: this.settings.vibration ? [200, 100, 200] : undefined,
                    data: notification.data
                };
                
                const desktopNotification = new Notification(notification.title, options);
                
                desktopNotification.onclick = () => {
                    if (notification.action) {
                        notification.action();
                    }
                    desktopNotification.close();
                };
                
                // 自动关闭
                setTimeout(() => {
                    desktopNotification.close();
                }, notification.duration || 5000);
                
                return desktopNotification;
            }
        });
        
        // 应用内通知渠道
        this.channels.set('inApp', {
            name: '应用内通知',
            enabled: this.settings.inApp,
            send: async (notification) => {
                return this.showInAppNotification(notification);
            }
        });
        
        // 浏览器通知渠道
        this.channels.set('browser', {
            name: '浏览器通知',
            enabled: true,
            send: async (notification) => {
                if (chrome.notifications) {
                    const options = {
                        type: 'basic',
                        iconUrl: notification.icon || '/icons/icon-48.svg',
                        title: notification.title,
                        message: notification.body,
                        priority: notification.priority === 'high' ? 2 : 1,
                        requireInteraction: notification.priority === 'high'
                    };
                    
                    return new Promise((resolve, reject) => {
                        chrome.notifications.create(notification.id, options, (notificationId) => {
                            if (chrome.runtime.lastError) {
                                reject(chrome.runtime.lastError);
                            } else {
                                resolve(notificationId);
                            }
                        });
                    });
                }
                throw new Error('浏览器不支持通知API');
            }
        });
        
        // 声音通知渠道
        this.channels.set('sound', {
            name: '声音通知',
            enabled: this.settings.sound,
            send: async (notification) => {
                return this.playNotificationSound(notification.soundType || 'default');
            }
        });
        
        // Webhook通知渠道
        this.channels.set('webhook', {
            name: 'Webhook通知',
            enabled: this.settings.webhook,
            send: async (notification) => {
                if (!this.settings.webhookUrl) {
                    throw new Error('Webhook URL未配置');
                }
                
                const payload = {
                    title: notification.title,
                    body: notification.body,
                    priority: notification.priority,
                    timestamp: new Date().toISOString(),
                    data: notification.data
                };
                
                const response = await fetch(this.settings.webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`Webhook请求失败: ${response.status}`);
                }
                
                return response;
            }
        });
    }

    // 设置通知模板
    setupTemplates() {
        this.templates.set('success', {
            title: '操作成功',
            icon: '✅',
            priority: 'normal',
            duration: 3000,
            soundType: 'success'
        });
        
        this.templates.set('error', {
            title: '操作失败',
            icon: '❌',
            priority: 'high',
            duration: 5000,
            soundType: 'error'
        });
        
        this.templates.set('warning', {
            title: '警告',
            icon: '⚠️',
            priority: 'normal',
            duration: 4000,
            soundType: 'warning'
        });
        
        this.templates.set('info', {
            title: '信息',
            icon: 'ℹ️',
            priority: 'low',
            duration: 3000,
            soundType: 'info'
        });
        
        this.templates.set('achievement', {
            title: '成就解锁',
            icon: '🏆',
            priority: 'normal',
            duration: 5000,
            soundType: 'achievement'
        });
        
        this.templates.set('milestone', {
            title: '里程碑',
            icon: '🎯',
            priority: 'normal',
            duration: 4000,
            soundType: 'milestone'
        });
        
        this.templates.set('reminder', {
            title: '提醒',
            icon: '🔔',
            priority: 'normal',
            duration: 4000,
            soundType: 'reminder'
        });
        
        this.templates.set('update', {
            title: '更新',
            icon: '🔄',
            priority: 'low',
            duration: 3000,
            soundType: 'update'
        });
    }

    // 设置通知规则
    setupRules() {
        // 重复通知过滤规则
        this.rules.set('duplicateFilter', {
            name: '重复通知过滤',
            enabled: this.settings.filters.duplicates,
            check: (notification) => {
                const recent = Array.from(this.notifications.values())
                    .filter(n => n.timestamp > Date.now() - 60000) // 1分钟内
                    .find(n => n.title === notification.title && n.body === notification.body);
                
                return !recent;
            }
        });
        
        // 垃圾通知过滤规则
        this.rules.set('spamFilter', {
            name: '垃圾通知过滤',
            enabled: this.settings.filters.spam,
            check: (notification) => {
                const recentCount = Array.from(this.notifications.values())
                    .filter(n => n.timestamp > Date.now() - 3600000) // 1小时内
                    .length;
                
                return recentCount < this.settings.frequency.maxPerHour;
            }
        });
        
        // 安静时间规则
        this.rules.set('quietHours', {
            name: '安静时间',
            enabled: this.settings.quietHours.enabled,
            check: (notification) => {
                if (notification.priority === 'high') {
                    return true; // 高优先级通知忽略安静时间
                }
                
                const now = new Date();
                const currentTime = now.getHours() * 60 + now.getMinutes();
                const startTime = this.parseTime(this.settings.quietHours.start);
                const endTime = this.parseTime(this.settings.quietHours.end);
                
                if (startTime > endTime) {
                    // 跨天的情况
                    return currentTime < startTime && currentTime > endTime;
                } else {
                    return currentTime < startTime || currentTime > endTime;
                }
            }
        });
        
        // 低优先级过滤规则
        this.rules.set('lowPriorityFilter', {
            name: '低优先级过滤',
            enabled: this.settings.filters.lowPriority,
            check: (notification) => {
                return notification.priority !== 'low';
            }
        });
    }

    // 解析时间字符串
    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // 发送通知
    async notify(type, message, options = {}) {
        const template = this.templates.get(type) || this.templates.get('info');
        
        const notification = {
            id: this.generateId(),
            type,
            title: options.title || template.title,
            body: message,
            icon: options.icon || template.icon,
            priority: options.priority || template.priority,
            duration: options.duration || template.duration,
            soundType: options.soundType || template.soundType,
            channels: options.channels || ['desktop', 'inApp', 'sound'],
            action: options.action,
            data: options.data,
            timestamp: Date.now()
        };
        
        // 添加到队列
        this.queue.push(notification);
        
        // 如果没有在处理，立即开始处理
        if (!this.isProcessing) {
            this.processQueue();
        }
        
        return notification.id;
    }

    // 处理通知队列
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        while (this.queue.length > 0) {
            const notification = this.queue.shift();
            
            try {
                // 检查通知规则
                if (!this.checkRules(notification)) {
                    continue;
                }
                
                // 发送通知
                await this.sendNotification(notification);
                
                // 记录通知
                this.notifications.set(notification.id, notification);
                
                // 清理旧通知
                this.cleanupOldNotifications();
                
            } catch (error) {
                console.error('Failed to send notification:', error);
            }
            
            // 添加延迟避免过于频繁
            await this.delay(100);
        }
        
        this.isProcessing = false;
    }

    // 检查通知规则
    checkRules(notification) {
        for (const [name, rule] of this.rules) {
            if (rule.enabled && !rule.check(notification)) {
                console.log(`Notification blocked by rule: ${name}`);
                return false;
            }
        }
        return true;
    }

    // 发送通知到各个渠道
    async sendNotification(notification) {
        const promises = [];
        
        for (const channelName of notification.channels) {
            const channel = this.channels.get(channelName);
            if (channel && channel.enabled) {
                promises.push(
                    channel.send(notification).catch(error => {
                        console.error(`Failed to send notification via ${channelName}:`, error);
                    })
                );
            }
        }
        
        await Promise.allSettled(promises);
    }

    // 显示应用内通知
    showInAppNotification(notification) {
        return new Promise((resolve) => {
            // 检查是否在浏览器环境中
            if (typeof document === 'undefined') {
                console.warn('In-app notifications not available in non-browser environment');
                resolve(null);
                return;
            }
            
            const container = this.getOrCreateNotificationContainer();
            
            const notificationEl = document.createElement('div');
            notificationEl.className = `in-app-notification priority-${notification.priority}`;
            notificationEl.innerHTML = `
                <div class="notification-icon">${notification.icon}</div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-body">${notification.body}</div>
                </div>
                <button class="notification-close">×</button>
            `;
            
            // 添加样式
            this.addInAppNotificationStyles();
            
            // 绑定事件
            const closeBtn = notificationEl.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => {
                this.removeInAppNotification(notificationEl);
            });
            
            if (notification.action) {
                notificationEl.addEventListener('click', (e) => {
                    if (e.target !== closeBtn) {
                        notification.action();
                        this.removeInAppNotification(notificationEl);
                    }
                });
                notificationEl.style.cursor = 'pointer';
            }
            
            // 添加到容器
            container.appendChild(notificationEl);
            
            // 动画显示
            requestAnimationFrame(() => {
                notificationEl.classList.add('show');
            });
            
            // 自动关闭
            setTimeout(() => {
                this.removeInAppNotification(notificationEl);
            }, notification.duration);
            
            resolve(notificationEl);
        });
    }

    // 获取或创建通知容器
    getOrCreateNotificationContainer() {
        if (typeof document === 'undefined') {
            return null;
        }
        
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // 添加应用内通知样式
    addInAppNotificationStyles() {
        if (typeof document === 'undefined') {
            return;
        }
        
        if (document.getElementById('notification-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            }
            
            .in-app-notification {
                display: flex;
                align-items: center;
                gap: 12px;
                background: white;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                border-left: 4px solid #2196F3;
                min-width: 300px;
                max-width: 400px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                pointer-events: auto;
            }
            
            .in-app-notification.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .in-app-notification.priority-high {
                border-left-color: #f44336;
                background: #fff5f5;
            }
            
            .in-app-notification.priority-low {
                border-left-color: #9E9E9E;
                background: #fafafa;
            }
            
            .notification-icon {
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .notification-content {
                flex: 1;
                min-width: 0;
            }
            
            .notification-title {
                font-weight: 600;
                font-size: 14px;
                color: #333;
                margin-bottom: 4px;
            }
            
            .notification-body {
                font-size: 13px;
                color: #666;
                line-height: 1.4;
                word-wrap: break-word;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }
            
            .notification-close:hover {
                background: #f0f0f0;
                color: #666;
            }
            
            /* 深色主题 */
            .dark-theme .in-app-notification {
                background: #2d2d2d;
                color: white;
            }
            
            .dark-theme .notification-title {
                color: white;
            }
            
            .dark-theme .notification-body {
                color: #b0b0b0;
            }
            
            .dark-theme .notification-close:hover {
                background: #404040;
                color: #ccc;
            }
            
            /* 动画效果 */
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
        `;
        
        if (document.head) {
            document.head.appendChild(style);
        }
    }

    // 移除应用内通知
    removeInAppNotification(notificationEl) {
        notificationEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.parentNode.removeChild(notificationEl);
            }
        }, 300);
    }

    // 播放通知声音
    async playNotificationSound(soundType) {
        if (!this.settings.sound) {
            return;
        }
        
        // 检查是否在浏览器环境中
        if (typeof window === 'undefined' || !window.AudioContext && !window.webkitAudioContext) {
            console.warn('Audio API not available in current environment');
            return;
        }
        
        try {
            // 使用Web Audio API播放声音
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 生成不同类型的提示音
            const frequency = this.getSoundFrequency(soundType);
            const duration = 0.2;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
            
        } catch (error) {
            console.error('Failed to play notification sound:', error);
        }
    }

    // 获取声音频率
    getSoundFrequency(soundType) {
        const frequencies = {
            success: 800,
            error: 400,
            warning: 600,
            info: 500,
            achievement: 1000,
            milestone: 900,
            reminder: 700,
            update: 550,
            default: 500
        };
        
        return frequencies[soundType] || frequencies.default;
    }

    // 清理旧通知
    cleanupOldNotifications() {
        const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24小时前
        
        for (const [id, notification] of this.notifications) {
            if (notification.timestamp < cutoff) {
                this.notifications.delete(id);
            }
        }
    }

    // 生成唯一ID
    generateId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 启动处理器
    startProcessor() {
        if (this.processorStarted) {
            return;
        }
        this.processorStarted = true;
        
        // 定期处理队列
        this.queueProcessorInterval = setInterval(() => {
            if (!this.isProcessing && this.queue.length > 0) {
                this.processQueue();
            }
        }, 1000);
        
        // 定期清理旧通知
        this.cleanupInterval = setInterval(() => {
            this.cleanupOldNotifications();
        }, 60000); // 每分钟清理一次
    }

    // 停止处理器
    stopProcessor() {
        if (this.queueProcessorInterval) {
            clearInterval(this.queueProcessorInterval);
            this.queueProcessorInterval = null;
        }
        
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        this.processorStarted = false;
    }

    // 绑定事件
    bindEvents() {
        // 监听浏览器通知点击
        if (chrome.notifications) {
            chrome.notifications.onClicked.addListener((notificationId) => {
                const notification = this.notifications.get(notificationId);
                if (notification && notification.action) {
                    notification.action();
                }
            });
        }
        
        // 监听页面可见性变化（仅在浏览器环境中）
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // 页面隐藏时，优先使用桌面通知
                    this.settings.desktop = true;
                    this.settings.inApp = false;
                } else {
                    // 页面可见时，优先使用应用内通知
                    this.settings.desktop = false;
                    this.settings.inApp = true;
                }
            });
        }
    }

    // 快捷方法
    success(message, options = {}) {
        return this.notify('success', message, options);
    }

    error(message, options = {}) {
        return this.notify('error', message, options);
    }

    warning(message, options = {}) {
        return this.notify('warning', message, options);
    }

    info(message, options = {}) {
        return this.notify('info', message, options);
    }

    achievement(message, options = {}) {
        return this.notify('achievement', message, options);
    }

    milestone(message, options = {}) {
        return this.notify('milestone', message, options);
    }

    reminder(message, options = {}) {
        return this.notify('reminder', message, options);
    }

    update(message, options = {}) {
        return this.notify('update', message, options);
    }

    // 批量通知
    async batch(notifications) {
        const promises = notifications.map(notification => {
            return this.notify(notification.type, notification.message, notification.options);
        });
        
        return Promise.all(promises);
    }

    // 取消通知
    cancel(notificationId) {
        // 从队列中移除
        const queueIndex = this.queue.findIndex(n => n.id === notificationId);
        if (queueIndex !== -1) {
            this.queue.splice(queueIndex, 1);
        }
        
        // 从记录中移除
        this.notifications.delete(notificationId);
        
        // 取消浏览器通知
        if (chrome.notifications) {
            chrome.notifications.clear(notificationId);
        }
    }

    // 清除所有通知
    clearAll() {
        this.queue = [];
        this.notifications.clear();
        
        // 清除浏览器通知
        if (chrome.notifications) {
            chrome.notifications.getAll((notifications) => {
                Object.keys(notifications).forEach(id => {
                    chrome.notifications.clear(id);
                });
            });
        }
        
        // 清除应用内通知
        if (typeof document !== 'undefined') {
            const container = document.getElementById('notification-container');
            if (container) {
                container.innerHTML = '';
            }
        }
    }

    // 获取通知历史
    getHistory(limit = 50) {
        return Array.from(this.notifications.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    // 获取统计信息
    getStats() {
        const notifications = Array.from(this.notifications.values());
        const now = Date.now();
        
        return {
            total: notifications.length,
            today: notifications.filter(n => now - n.timestamp < 24 * 60 * 60 * 1000).length,
            thisWeek: notifications.filter(n => now - n.timestamp < 7 * 24 * 60 * 60 * 1000).length,
            byType: this.groupBy(notifications, 'type'),
            byPriority: this.groupBy(notifications, 'priority'),
            queueLength: this.queue.length
        };
    }

    // 分组统计
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = (groups[group] || 0) + 1;
            return groups;
        }, {});
    }

    // 更新设置
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // 重新设置渠道状态
        this.channels.forEach((channel, name) => {
            switch (name) {
                case 'desktop':
                    channel.enabled = this.settings.desktop;
                    break;
                case 'inApp':
                    channel.enabled = this.settings.inApp;
                    break;
                case 'sound':
                    channel.enabled = this.settings.sound;
                    break;
                case 'webhook':
                    channel.enabled = this.settings.webhook;
                    break;
            }
        });
        
        // 重新设置规则状态
        this.rules.forEach((rule, name) => {
            switch (name) {
                case 'duplicateFilter':
                    rule.enabled = this.settings.filters.duplicates;
                    break;
                case 'spamFilter':
                    rule.enabled = this.settings.filters.spam;
                    break;
                case 'quietHours':
                    rule.enabled = this.settings.quietHours.enabled;
                    break;
                case 'lowPriorityFilter':
                    rule.enabled = this.settings.filters.lowPriority;
                    break;
            }
        });
    }

    // 测试通知
    test() {
        this.info('这是一条测试通知', {
            title: '通知系统测试',
            action: () => {
                console.log('测试通知被点击');
            }
        });
    }

    // 销毁通知系统
    destroy() {
        this.stopProcessor();
        this.clearAll();
        this.channels.clear();
        this.templates.clear();
        this.rules.clear();
        
        if (typeof document !== 'undefined') {
            const container = document.getElementById('notification-container');
            if (container) {
                container.remove();
            }
            
            const styles = document.getElementById('notification-styles');
            if (styles) {
                styles.remove();
            }
        }
    }
}

// 导出通知系统类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
} else if (typeof window !== 'undefined') {
    window.NotificationSystem = NotificationSystem;
}