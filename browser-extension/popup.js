// Popup界面控制逻辑
class PopupController {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.stats = {
            todayLikes: 0,
            totalLikes: 0,
            successRate: 100,
            timeRemaining: '--'
        };
        
        // 高级功能模块
        this.analytics = null;
        this.recommendations = null;
        this.notifications = null;
        this.security = null;
        this.performance = null;
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.loadStats();
        await this.initAdvancedFeatures();
        this.bindEvents();
        this.updateUI();
        this.startStatusCheck();
    }

    // 加载设置
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'likeDelay',
                'dailyLimit', 
                'smartFilter',
                'notifications',
                'isRunning',
                'isPaused'
            ]);

            // 更新UI控件
            document.getElementById('likeDelay').value = result.likeDelay || 5;
            document.getElementById('dailyLimit').value = result.dailyLimit || 100;
            document.getElementById('smartFilter').checked = result.smartFilter || false;
            document.getElementById('notifications').checked = result.notifications || false;
            
            this.isRunning = result.isRunning || false;
            this.isPaused = result.isPaused || false;
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }

    // 加载统计数据
    async loadStats() {
        try {
            const result = await chrome.storage.local.get([
                'todayLikes',
                'totalLikes',
                'successRate',
                'lastRunTime'
            ]);

            this.stats.todayLikes = result.todayLikes || 0;
            this.stats.totalLikes = result.totalLikes || 0;
            this.stats.successRate = result.successRate || 100;
            
            // 检查是否是新的一天
            const today = new Date().toDateString();
            const lastRun = result.lastRunTime ? new Date(result.lastRunTime).toDateString() : '';
            
            if (today !== lastRun) {
                this.stats.todayLikes = 0;
                await chrome.storage.local.set({ 
                    todayLikes: 0,
                    lastRunTime: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('加载统计数据失败:', error);
        }
    }

    // 初始化高级功能模块
    async initAdvancedFeatures() {
        try {
            // 通过消息传递与background script通信获取高级功能状态
            const response = await chrome.runtime.sendMessage({
                action: 'getAdvancedFeatures'
            });

            if (response && response.success) {
                this.analytics = response.analytics;
                this.recommendations = response.recommendations;
                this.notifications = response.notifications;
                this.security = response.security;
                this.performance = response.performance;
                
                // 加载推荐设置
                await this.loadRecommendations();
                
                // 更新性能指标
                await this.updatePerformanceMetrics();
            }
        } catch (error) {
            console.error('初始化高级功能失败:', error);
        }
    }

    // 加载智能推荐
    async loadRecommendations() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getRecommendations'
            });

            if (response && response.success && response.recommendations) {
                this.displayRecommendations(response.recommendations);
            }
        } catch (error) {
            console.error('加载推荐失败:', error);
        }
    }

    // 显示推荐设置
    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendations-container');
        if (!container) return;

        container.innerHTML = '';
        
        recommendations.slice(0, 3).forEach(rec => {
            const recElement = document.createElement('div');
            recElement.className = 'recommendation-item';
            recElement.innerHTML = `
                <div class="rec-title">${rec.title}</div>
                <div class="rec-description">${rec.description}</div>
                <div class="rec-actions">
                    <button class="btn-apply" data-rec-id="${rec.id}">应用</button>
                    <button class="btn-dismiss" data-rec-id="${rec.id}">忽略</button>
                </div>
            `;
            container.appendChild(recElement);
        });

        // 绑定推荐操作事件
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-apply')) {
                this.applyRecommendation(e.target.dataset.recId);
            } else if (e.target.classList.contains('btn-dismiss')) {
                this.dismissRecommendation(e.target.dataset.recId);
            }
        });
    }

    // 应用推荐
    async applyRecommendation(recId) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'applyRecommendation',
                recommendationId: recId
            });

            if (response && response.success) {
                await this.loadSettings(); // 重新加载设置
                await this.loadRecommendations(); // 刷新推荐
                this.showNotification('推荐应用成功', '设置已更新');
            }
        } catch (error) {
            console.error('应用推荐失败:', error);
        }
    }

    // 忽略推荐
    async dismissRecommendation(recId) {
        try {
            await chrome.runtime.sendMessage({
                action: 'dismissRecommendation',
                recommendationId: recId
            });
            
            await this.loadRecommendations(); // 刷新推荐
        } catch (error) {
            console.error('忽略推荐失败:', error);
        }
    }

    // 更新性能指标
    async updatePerformanceMetrics() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getPerformanceMetrics'
            });

            if (response && response.success) {
                this.displayPerformanceMetrics(response.metrics);
            }
        } catch (error) {
            console.error('更新性能指标失败:', error);
        }
    }

    // 显示性能指标
    displayPerformanceMetrics(metrics) {
        const container = document.getElementById('performance-metrics');
        if (!container) return;

        container.innerHTML = `
            <div class="metric-item">
                <span class="metric-label">内存使用:</span>
                <span class="metric-value">${metrics.memoryUsage || 'N/A'}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">CPU使用:</span>
                <span class="metric-value">${metrics.cpuUsage || 'N/A'}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">网络延迟:</span>
                <span class="metric-value">${metrics.networkLatency || 'N/A'}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">成功率:</span>
                <span class="metric-value">${metrics.successRate || 'N/A'}%</span>
            </div>
        `;
    }

    // 绑定事件
    bindEvents() {
        // 主要控制按钮
        document.getElementById('toggleBtn').addEventListener('click', () => {
            this.toggleAutomation();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });

        // 设置变更
        document.getElementById('likeDelay').addEventListener('change', (e) => {
            this.saveSetting('likeDelay', parseInt(e.target.value));
        });

        document.getElementById('dailyLimit').addEventListener('change', (e) => {
            this.saveSetting('dailyLimit', parseInt(e.target.value));
        });

        document.getElementById('smartFilter').addEventListener('change', (e) => {
            this.saveSetting('smartFilter', e.target.checked);
        });

        document.getElementById('notifications').addEventListener('change', (e) => {
            this.saveSetting('notifications', e.target.checked);
        });

        // 底部按钮
        document.getElementById('settingsBtn').addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });

        document.getElementById('helpBtn').addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://github.com/llulun/qzone-autopraise-pro' });
        });
    }

    // 切换自动化状态
    async toggleAutomation() {
        try {
            this.isRunning = !this.isRunning;
            
            // 发送消息到content script
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url.includes('qzone.qq.com')) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: this.isRunning ? 'start' : 'stop'
                });
            }

            await this.saveSetting('isRunning', this.isRunning);
            this.updateUI();
            
            // 显示通知
            this.showNotification(
                this.isRunning ? '自动点赞已启动' : '自动点赞已停止',
                this.isRunning ? '开始为好友点赞...' : '已停止自动点赞'
            );
        } catch (error) {
            console.error('切换自动化状态失败:', error);
        }
    }

    // 切换暂停状态
    async togglePause() {
        try {
            this.isPaused = !this.isPaused;
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url.includes('qzone.qq.com')) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: this.isPaused ? 'pause' : 'resume'
                });
            }

            await this.saveSetting('isPaused', this.isPaused);
            this.updateUI();
        } catch (error) {
            console.error('切换暂停状态失败:', error);
        }
    }

    // 保存设置
    async saveSetting(key, value) {
        try {
            await chrome.storage.sync.set({ [key]: value });
            
            // 通知content script设置变更
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url.includes('qzone.qq.com')) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'updateSetting',
                    key,
                    value
                });
            }
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    // 更新UI状态
    updateUI() {
        const toggleBtn = document.getElementById('toggleBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const statusIndicator = document.getElementById('statusIndicator');
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-text');

        // 更新主按钮
        if (this.isRunning) {
            toggleBtn.innerHTML = `
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                    <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                </svg>
                <span>停止点赞</span>
            `;
            toggleBtn.className = 'btn btn-secondary';
        } else {
            toggleBtn.innerHTML = `
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
                <span>开始点赞</span>
            `;
            toggleBtn.className = 'btn btn-primary';
        }

        // 更新暂停按钮
        pauseBtn.style.display = this.isRunning ? 'flex' : 'none';
        if (this.isPaused) {
            pauseBtn.innerHTML = `
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
                <span>恢复</span>
            `;
        } else {
            pauseBtn.innerHTML = `
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>
                </svg>
                <span>暂停</span>
            `;
        }

        // 更新状态指示器
        if (this.isRunning && !this.isPaused) {
            statusDot.style.background = '#4ade80';
            statusText.textContent = '运行中';
        } else if (this.isRunning && this.isPaused) {
            statusDot.style.background = '#f59e0b';
            statusText.textContent = '已暂停';
        } else {
            statusDot.style.background = '#6b7280';
            statusText.textContent = '就绪';
        }
    }

    // 更新统计显示
    updateStatsDisplay() {
        document.getElementById('todayLikes').textContent = this.stats.todayLikes;
        document.getElementById('totalLikes').textContent = this.stats.totalLikes;
        document.getElementById('successRate').textContent = this.stats.successRate + '%';
        document.getElementById('timeRemaining').textContent = this.stats.timeRemaining;
    }

    // 更新进度条
    updateProgress(progress, text = '') {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressFill.style.width = progress + '%';
        if (text) {
            progressText.textContent = text;
        }
    }

    // 显示通知
    async showNotification(title, message) {
        try {
            const result = await chrome.storage.sync.get(['notifications']);
            if (result.notifications) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: title,
                    message: message
                });
            }
        } catch (error) {
            console.error('显示通知失败:', error);
        }
    }

    // 开始状态检查
    startStatusCheck() {
        // 监听来自content script的消息
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'updateStats') {
                this.stats = { ...this.stats, ...message.stats };
                this.updateStatsDisplay();
            } else if (message.action === 'updateProgress') {
                this.updateProgress(message.progress, message.text);
            } else if (message.action === 'statusChanged') {
                this.isRunning = message.isRunning;
                this.isPaused = message.isPaused;
                this.updateUI();
            }
        });

        // 定期检查状态
        setInterval(async () => {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab && tab.url.includes('qzone.qq.com')) {
                    await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
                }
            } catch (error) {
                // 忽略错误，可能是页面还没加载完成
            }
        }, 2000);
    }

    // 格式化时间
    formatTime(seconds) {
        if (seconds < 60) {
            return seconds + '秒';
        } else if (seconds < 3600) {
            return Math.floor(seconds / 60) + '分钟';
        } else {
            return Math.floor(seconds / 3600) + '小时';
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});

// 添加一些视觉效果
document.addEventListener('DOMContentLoaded', () => {
    // 添加鼠标悬停效果
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
        });
    });

    // 添加点击波纹效果
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            btn.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});