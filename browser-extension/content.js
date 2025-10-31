// QZone Praise Automator Pro - Content Script
class QZonePraiseAutomator {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentTask = '';
        this.taskStartTime = 0;
        this.nextTime = Date.now();
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // 配置参数
        this.config = {
            duration: 180,
            refreshDelay: 10,
            likeDelay: 5,
            scrollCount: 3,
            dailyLimit: 100,
            smartFilter: true,
            notifications: true,
            blocked: [],
            whiteList: [],
            filterKeywords: [],
            filterMode: 'block',
            randomDelayMin: 1,
            randomDelayMax: 3
        };

        // 统计数据
        this.stats = {
            todayLikes: 0,
            totalLikes: 0,
            successCount: 0,
            errorCount: 0,
            skipCount: 0
        };

        // UI元素
        this.statusBar = null;
        this.floatingButton = null;
        
        // 异步初始化，避免在构造函数中调用
        this.initAsync();
    }
    
    async initAsync() {
        try {
            await this.init();
        } catch (error) {
            console.error('QZone Praise Automator initialization failed:', error);
        }
    }

    async init() {
        console.log('QZone Praise Automator Pro 初始化...');
        
        // 检查是否在QZone页面
        if (!this.isQZonePage()) {
            return;
        }

        await this.loadConfig();
        await this.loadStats();
        this.createUI();
        this.bindEvents();
        this.startStatusCheck();
        
        console.log('QZone Praise Automator Pro 初始化完成');
    }

    // 检查是否在QZone页面
    isQZonePage() {
        return window.location.hostname.includes('qzone.qq.com');
    }

    // 加载配置
    async loadConfig() {
        try {
            const result = await chrome.storage.sync.get(Object.keys(this.config));
            this.config = { ...this.config, ...result };
        } catch (error) {
            console.error('加载配置失败:', error);
        }
    }

    // 加载统计数据
    async loadStats() {
        try {
            const result = await chrome.storage.local.get([
                'todayLikes',
                'totalLikes',
                'successCount',
                'errorCount',
                'skipCount',
                'lastDailyReset'
            ]);

            // 检查是否需要重置每日统计
            const today = new Date().setHours(0, 0, 0, 0);
            const lastReset = result.lastDailyReset || 0;
            
            if (lastReset < today) {
                this.stats.todayLikes = 0;
                await chrome.storage.local.set({
                    todayLikes: 0,
                    lastDailyReset: today
                });
            } else {
                this.stats = { ...this.stats, ...result };
            }
        } catch (error) {
            console.error('加载统计失败:', error);
        }
    }

    // 创建UI界面
    createUI() {
        this.createStatusBar();
        this.createFloatingButton();
    }

    // 创建状态栏
    createStatusBar() {
        if (this.statusBar) return;

        this.statusBar = document.createElement('div');
        this.statusBar.id = 'qzone-automator-status';
        this.statusBar.innerHTML = `
            <div class="status-content">
                <div class="status-header">
                    <div class="status-title">
                        <svg class="status-icon" viewBox="0 0 24 24" fill="none">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                        </svg>
                        <span>QZone Pro</span>
                    </div>
                    <div class="status-controls">
                        <button class="status-btn" id="toggleStatus">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M8 5v14l11-7z" fill="currentColor"/>
                            </svg>
                        </button>
                        <button class="status-btn" id="pauseStatus">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>
                            </svg>
                        </button>
                        <button class="status-btn" id="closeStatus">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="status-info">
                    <div class="status-stats">
                        <span class="stat-item">今日: <span id="todayCount">${this.stats.todayLikes}</span></span>
                        <span class="stat-item">总计: <span id="totalCount">${this.stats.totalLikes}</span></span>
                        <span class="stat-item">成功率: <span id="successRate">${this.getSuccessRate()}%</span></span>
                    </div>
                    <div class="status-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-text" id="progressText">等待开始...</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.statusBar);
        this.bindStatusEvents();
    }

    // 创建浮动按钮
    createFloatingButton() {
        if (this.floatingButton) return;

        this.floatingButton = document.createElement('div');
        this.floatingButton.id = 'qzone-automator-float';
        this.floatingButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
            </svg>
        `;

        document.body.appendChild(this.floatingButton);
        
        this.floatingButton.addEventListener('click', () => {
            this.toggleStatusBar();
        });
    }

    // 绑定状态栏事件
    bindStatusEvents() {
        document.getElementById('toggleStatus').addEventListener('click', () => {
            this.toggleAutomation();
        });

        document.getElementById('pauseStatus').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('closeStatus').addEventListener('click', () => {
            this.hideStatusBar();
        });
    }

    // 绑定消息事件
    bindEvents() {
        // 监听来自popup的消息
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'start':
                    this.startAutomation();
                    break;
                case 'stop':
                    this.stopAutomation();
                    break;
                case 'pause':
                    this.pauseAutomation();
                    break;
                case 'resume':
                    this.resumeAutomation();
                    break;
                case 'updateSetting':
                    this.updateSetting(message.key, message.value);
                    break;
                case 'getStatus':
                    this.sendStatus();
                    break;
            }
            sendResponse({ success: true });
        });
    }

    // 开始自动化
    async startAutomation() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.updateUI();
        
        console.log('开始自动点赞...');
        this.updateProgress(0, '正在检测页面...');
        
        // 检查是否在好友动态页面
        if (!this.isFriendFeedPage()) {
            await this.navigateToFriendFeed();
        }
        
        this.scheduleNextTask();
        this.sendStatusToPopup();
    }

    // 停止自动化
    stopAutomation() {
        this.isRunning = false;
        this.isPaused = false;
        this.clearScheduledTasks();
        this.updateUI();
        this.updateProgress(0, '已停止');
        
        console.log('停止自动点赞');
        this.sendStatusToPopup();
    }

    // 暂停自动化
    pauseAutomation() {
        this.isPaused = true;
        this.clearScheduledTasks();
        this.updateUI();
        this.updateProgress(0, '已暂停');
        
        console.log('暂停自动点赞');
        this.sendStatusToPopup();
    }

    // 恢复自动化
    resumeAutomation() {
        if (!this.isRunning) return;
        
        this.isPaused = false;
        this.updateUI();
        this.scheduleNextTask();
        
        console.log('恢复自动点赞');
        this.sendStatusToPopup();
    }

    // 检查是否在好友动态页面
    isFriendFeedPage() {
        return document.querySelector('.feed-item, .f-single-item, .qz_feed_item') !== null;
    }

    // 导航到好友动态页面
    async navigateToFriendFeed() {
        const friendFeedUrl = 'https://user.qzone.qq.com/proxy/domain/taotao.qq.com/cgi-bin/emotion_cgi_msglist_v6';
        if (!window.location.href.includes('msglist')) {
            window.location.href = friendFeedUrl;
            return new Promise(resolve => {
                setTimeout(resolve, 3000);
            });
        }
    }

    // 安排下一个任务
    scheduleNextTask() {
        if (!this.isRunning || this.isPaused) return;

        const delay = this.getRandomDelay();
        this.nextTime = Date.now() + delay * 1000;
        
        setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.executeLikeTask();
            }
        }, delay * 1000);

        this.startCountdown();
    }

    // 执行点赞任务
    async executeLikeTask() {
        if (!this.isRunning || this.isPaused) return;

        this.currentTask = '正在点赞...';
        this.taskStartTime = Date.now();
        
        try {
            // 检查每日限制
            if (this.config.dailyLimit > 0 && this.stats.todayLikes >= this.config.dailyLimit) {
                this.updateProgress(100, '已达每日上限');
                this.stopAutomation();
                return;
            }

            const feedItems = this.getFeedItems();
            let likedCount = 0;

            for (let i = 0; i < feedItems.length && this.isRunning && !this.isPaused; i++) {
                const item = feedItems[i];
                
                if (await this.shouldLikeItem(item)) {
                    if (await this.likeItem(item)) {
                        likedCount++;
                        await this.updateStats('like');
                        
                        // 更新进度
                        const progress = ((i + 1) / feedItems.length) * 100;
                        this.updateProgress(progress, `已点赞 ${likedCount} 个动态`);
                        
                        // 随机延迟
                        await this.sleep(this.getRandomDelay() * 1000);
                    }
                } else {
                    await this.updateStats('skip');
                }
            }

            // 滚动加载更多
            await this.scrollForMore();
            
            // 安排下一轮
            this.scheduleNextTask();
            
        } catch (error) {
            console.error('执行点赞任务失败:', error);
            await this.updateStats('error');
            this.retryCount++;
            
            if (this.retryCount < this.maxRetries) {
                setTimeout(() => this.executeLikeTask(), 5000);
            } else {
                this.stopAutomation();
            }
        }
    }

    // 获取动态列表
    getFeedItems() {
        const selectors = [
            '.feed-item',
            '.f-single-item', 
            '.qz_feed_item',
            '[data-feedstype]'
        ];

        for (const selector of selectors) {
            const items = document.querySelectorAll(selector);
            if (items.length > 0) {
                return Array.from(items);
            }
        }
        
        return [];
    }

    // 判断是否应该点赞
    async shouldLikeItem(item) {
        try {
            // 检查是否已经点赞
            if (this.isAlreadyLiked(item)) {
                return false;
            }

            // 检查用户黑名单
            const userName = this.getUserName(item);
            if (this.config.blocked.includes(userName)) {
                return false;
            }

            // 检查白名单模式
            if (this.config.whiteList.length > 0 && !this.config.whiteList.includes(userName)) {
                return false;
            }

            // 智能过滤
            if (this.config.smartFilter) {
                return await this.smartFilter(item);
            }

            // 关键词过滤
            if (this.config.filterKeywords.length > 0) {
                const content = this.getItemContent(item);
                const hasKeyword = this.config.filterKeywords.some(keyword => 
                    content.includes(keyword)
                );
                
                if (this.config.filterMode === 'block' && hasKeyword) {
                    return false;
                } else if (this.config.filterMode === 'allow' && !hasKeyword) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('判断是否点赞失败:', error);
            return false;
        }
    }

    // 智能过滤
    async smartFilter(item) {
        const content = this.getItemContent(item);
        const userName = this.getUserName(item);
        
        // 过滤广告内容
        const adKeywords = ['广告', '推广', '营销', '代购', '微商', '加微信'];
        if (adKeywords.some(keyword => content.includes(keyword))) {
            return false;
        }

        // 过滤负面情绪内容
        const negativeKeywords = ['生气', '愤怒', '讨厌', '烦躁', '郁闷'];
        if (negativeKeywords.some(keyword => content.includes(keyword))) {
            return false;
        }

        // 过滤过长的内容（可能是复制粘贴）
        if (content.length > 500) {
            return false;
        }

        // 优先点赞互动较多的内容
        const likeCount = this.getLikeCount(item);
        const commentCount = this.getCommentCount(item);
        
        if (likeCount > 10 || commentCount > 5) {
            return true;
        }

        return true;
    }

    // 检查是否已经点赞
    isAlreadyLiked(item) {
        const likeButtons = item.querySelectorAll([
            '.item-like.item-like-on',
            '.qz_like_btn_v3[data-clicklog*="like"][class*="on"]',
            '.ui-oper-praise.on',
            '.praise-zan.praised'
        ].join(','));
        
        return likeButtons.length > 0;
    }

    // 获取用户名
    getUserName(item) {
        const nameSelectors = [
            '.f-nick',
            '.nickname',
            '.user-name',
            '.qz_feed_name'
        ];

        for (const selector of nameSelectors) {
            const nameEl = item.querySelector(selector);
            if (nameEl) {
                return nameEl.textContent.trim();
            }
        }
        
        return '';
    }

    // 获取动态内容
    getItemContent(item) {
        const contentSelectors = [
            '.f-info',
            '.feed-content',
            '.content',
            '.qz_feed_content'
        ];

        for (const selector of contentSelectors) {
            const contentEl = item.querySelector(selector);
            if (contentEl) {
                return contentEl.textContent.trim();
            }
        }
        
        return '';
    }

    // 获取点赞数
    getLikeCount(item) {
        const likeCountEl = item.querySelector('.like-count, .praise-count, .zan-count');
        if (likeCountEl) {
            return parseInt(likeCountEl.textContent) || 0;
        }
        return 0;
    }

    // 获取评论数
    getCommentCount(item) {
        const commentCountEl = item.querySelector('.comment-count, .reply-count');
        if (commentCountEl) {
            return parseInt(commentCountEl.textContent) || 0;
        }
        return 0;
    }

    // 点赞动态
    async likeItem(item) {
        try {
            const likeButton = item.querySelector([
                '.item-like:not(.item-like-on)',
                '.qz_like_btn_v3[data-clicklog*="like"]:not([class*="on"])',
                '.ui-oper-praise:not(.on)',
                '.praise-zan:not(.praised)'
            ].join(','));

            if (likeButton) {
                // 模拟人工点击
                const rect = likeButton.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;

                // 触发点击事件
                likeButton.click();
                
                // 等待点赞生效
                await this.sleep(1000);
                
                // 验证点赞是否成功
                const isLiked = this.isAlreadyLiked(item);
                if (isLiked) {
                    console.log('点赞成功:', this.getUserName(item));
                    return true;
                } else {
                    console.log('点赞失败:', this.getUserName(item));
                    return false;
                }
            }
            
            return false;
        } catch (error) {
            console.error('点赞失败:', error);
            return false;
        }
    }

    // 滚动加载更多
    async scrollForMore() {
        const scrollCount = this.config.scrollCount;
        for (let i = 0; i < scrollCount; i++) {
            window.scrollTo(0, document.body.scrollHeight);
            await this.sleep(2000);
        }
    }

    // 更新统计数据
    async updateStats(type) {
        switch (type) {
            case 'like':
                this.stats.todayLikes++;
                this.stats.totalLikes++;
                this.stats.successCount++;
                break;
            case 'skip':
                this.stats.skipCount++;
                break;
            case 'error':
                this.stats.errorCount++;
                break;
        }

        // 保存到存储
        await chrome.storage.local.set({
            todayLikes: this.stats.todayLikes,
            totalLikes: this.stats.totalLikes,
            successCount: this.stats.successCount,
            errorCount: this.stats.errorCount,
            skipCount: this.stats.skipCount
        });

        this.updateStatsDisplay();
        this.sendStatsToPopup();
    }

    // 更新统计显示
    updateStatsDisplay() {
        if (this.statusBar) {
            document.getElementById('todayCount').textContent = this.stats.todayLikes;
            document.getElementById('totalCount').textContent = this.stats.totalLikes;
            document.getElementById('successRate').textContent = this.getSuccessRate() + '%';
        }
    }

    // 计算成功率
    getSuccessRate() {
        const total = this.stats.successCount + this.stats.errorCount;
        if (total === 0) return 100;
        return Math.round((this.stats.successCount / total) * 100);
    }

    // 更新进度
    updateProgress(progress, text) {
        if (this.statusBar) {
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            
            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
            
            if (progressText) {
                progressText.textContent = text;
            }
        }

        // 发送到popup
        chrome.runtime.sendMessage({
            action: 'updateProgress',
            progress: progress,
            text: text
        });
    }

    // 更新UI状态
    updateUI() {
        if (!this.statusBar) return;

        const toggleBtn = document.getElementById('toggleStatus');
        const pauseBtn = document.getElementById('pauseStatus');

        if (this.isRunning) {
            toggleBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                    <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                </svg>
            `;
            pauseBtn.style.display = 'block';
        } else {
            toggleBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
            `;
            pauseBtn.style.display = 'none';
        }

        // 更新状态栏样式
        this.statusBar.className = this.isRunning ? 
            (this.isPaused ? 'paused' : 'running') : 'stopped';
    }

    // 发送状态到popup
    sendStatusToPopup() {
        chrome.runtime.sendMessage({
            action: 'statusChanged',
            isRunning: this.isRunning,
            isPaused: this.isPaused
        });
    }

    // 发送统计到popup
    sendStatsToPopup() {
        chrome.runtime.sendMessage({
            action: 'updateStats',
            stats: {
                todayLikes: this.stats.todayLikes,
                totalLikes: this.stats.totalLikes,
                successRate: this.getSuccessRate()
            }
        });
    }

    // 工具方法
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getRandomDelay() {
        const min = this.config.randomDelayMin;
        const max = this.config.randomDelayMax;
        return Math.random() * (max - min) + min;
    }

    toggleAutomation() {
        if (this.isRunning) {
            this.stopAutomation();
        } else {
            this.startAutomation();
        }
    }

    togglePause() {
        if (this.isPaused) {
            this.resumeAutomation();
        } else {
            this.pauseAutomation();
        }
    }

    toggleStatusBar() {
        if (this.statusBar.style.display === 'none') {
            this.showStatusBar();
        } else {
            this.hideStatusBar();
        }
    }

    showStatusBar() {
        if (this.statusBar) {
            this.statusBar.style.display = 'block';
        }
    }

    hideStatusBar() {
        if (this.statusBar) {
            this.statusBar.style.display = 'none';
        }
    }

    clearScheduledTasks() {
        // 清除所有定时器
        if (this.countdownTimer) {
            clearTimeout(this.countdownTimer);
            this.countdownTimer = null;
        }
        
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }
        
        if (this.automationTimer) {
            clearTimeout(this.automationTimer);
            this.automationTimer = null;
        }
    }

    startCountdown() {
        // 清除之前的倒计时
        if (this.countdownTimer) {
            clearTimeout(this.countdownTimer);
        }
        
        const updateCountdown = () => {
            if (!this.isRunning || this.isPaused) return;
            
            const remaining = Math.max(0, this.nextTime - Date.now());
            const seconds = Math.ceil(remaining / 1000);
            
            if (seconds > 0) {
                this.updateProgress(0, `下次执行: ${seconds}秒`);
                this.countdownTimer = setTimeout(updateCountdown, 1000);
            }
        };
        
        updateCountdown();
    }

    startStatusCheck() {
        // 防止重复启动
        if (this.statusCheckInterval) {
            return;
        }
        
        this.statusCheckInterval = setInterval(() => {
            this.sendStatus();
        }, 5000);
    }

    stopStatusCheck() {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }
    }

    // 清理资源
    cleanup() {
        this.clearScheduledTasks();
        this.stopStatusCheck();
        
        // 移除事件监听器
        if (this.floatingButton) {
            this.floatingButton.removeEventListener('click', this.toggleStatusBar);
        }
        
        // 移除状态栏事件监听器
        const toggleBtn = document.getElementById('toggleStatus');
        const pauseBtn = document.getElementById('pauseStatus');
        const closeBtn = document.getElementById('closeStatus');
        
        if (toggleBtn) {
            toggleBtn.removeEventListener('click', this.toggleAutomation);
        }
        if (pauseBtn) {
            pauseBtn.removeEventListener('click', this.togglePause);
        }
        if (closeBtn) {
            closeBtn.removeEventListener('click', this.hideStatusBar);
        }
        
        // 清理DOM元素
        if (this.statusBar && this.statusBar.parentNode) {
            this.statusBar.parentNode.removeChild(this.statusBar);
        }
        
        if (this.floatingButton && this.floatingButton.parentNode) {
            this.floatingButton.parentNode.removeChild(this.floatingButton);
        }
    }

    sendStatus() {
        chrome.runtime.sendMessage({
            action: 'statusUpdate',
            data: {
                isRunning: this.isRunning,
                isPaused: this.isPaused,
                stats: this.stats,
                currentTask: this.currentTask
            }
        });
    }

    updateSetting(key, value) {
        this.config[key] = value;
        console.log(`设置更新: ${key} = ${value}`);
    }
}

// 初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new QZonePraiseAutomator();
    });
} else {
    new QZonePraiseAutomator();
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QZonePraiseAutomator;
} else if (typeof window !== 'undefined') {
    window.QZonePraiseAutomator = QZonePraiseAutomator;
}