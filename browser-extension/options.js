// QZone Praise Automator Pro - Options Page Script

class OptionsManager {
    constructor() {
        this.settings = {};
        this.statistics = {};
        this.isDirty = false;
        this.currentTab = 'basic';
        
        this.init();
    }

    async init() {
        // 初始化存储管理器
        await this.initStorageManager();
        
        // 加载设置和统计数据
        await this.loadData();
        
        // 初始化UI
        this.initUI();
        
        // 绑定事件
        this.bindEvents();
        
        // 应用主题
        this.applyTheme();
        
        // 更新统计显示
        this.updateStatistics();
    }

    async initStorageManager() {
        // 等待存储管理器初始化
        if (typeof storageManager !== 'undefined') {
            this.storage = storageManager;
        } else {
            // 如果存储管理器未加载，创建一个简单的替代
            this.storage = {
                getSettings: () => chrome.storage.sync.get('settings').then(r => r.settings || {}),
                updateSettings: (settings) => chrome.storage.sync.set({ settings }),
                getStatistics: () => chrome.storage.local.get('statistics').then(r => r.statistics || {}),
                updateStatistics: (stats) => chrome.storage.local.set({ statistics: stats })
            };
        }
    }

    async loadData() {
        try {
            this.settings = await this.storage.getSettings();
            this.statistics = await this.storage.getStatistics();
        } catch (error) {
            console.error('Failed to load data:', error);
            this.showNotification('加载设置失败', 'error');
        }
    }

    initUI() {
        // 初始化标签页
        this.initTabs();
        
        // 填充表单数据
        this.populateForm();
        
        // 初始化特殊组件
        this.initColorPicker();
        this.initTagInputs();
        this.initRangeInputs();
    }

    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // 更新按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
        
        this.currentTab = tabId;
        
        // 特殊处理
        if (tabId === 'analytics') {
            this.updateStatistics();
        }
    }

    populateForm() {
        // 基本设置
        this.setCheckbox('enabled', this.settings.enabled);
        this.setCheckbox('autoStart', this.settings.autoStart);
        this.setValue('dailyLimit', this.settings.dailyLimit);
        
        // 点赞延迟
        if (this.settings.likeDelay) {
            this.setValue('likeDelayMin', this.settings.likeDelay.min / 1000);
            this.setValue('likeDelayMax', this.settings.likeDelay.max / 1000);
            this.updateRangeDisplay();
        }
        
        // 智能过滤
        if (this.settings.smartFilter) {
            this.setCheckbox('smartFilterEnabled', this.settings.smartFilter.enabled);
            this.setCheckbox('skipLiked', this.settings.smartFilter.skipLiked);
            this.setCheckbox('skipOwnPosts', this.settings.smartFilter.skipOwnPosts);
            this.setCheckbox('skipAds', this.settings.smartFilter.skipAds);
            
            this.populateTags('keywordTags', this.settings.smartFilter.keywordFilter || []);
            this.populateTags('userTags', this.settings.smartFilter.userFilter || []);
        }
        
        // 通知设置
        if (this.settings.notifications) {
            this.setCheckbox('notificationsEnabled', this.settings.notifications.enabled);
            this.setCheckbox('desktopNotifications', this.settings.notifications.desktop);
            this.setCheckbox('soundNotifications', this.settings.notifications.sound);
            this.setCheckbox('notifyOnComplete', this.settings.notifications.onComplete);
            this.setCheckbox('notifyOnError', this.settings.notifications.onError);
            this.setCheckbox('notifyOnLimit', this.settings.notifications.onLimit);
        }
        
        // 高级设置
        if (this.settings.advanced) {
            this.setValue('batchSize', this.settings.advanced.batchSize);
            this.setValue('retryAttempts', this.settings.advanced.retryAttempts);
            this.setValue('scrollDelay', this.settings.advanced.scrollDelay);
            this.setValue('pageLoadTimeout', this.settings.advanced.pageLoadTimeout);
            this.setCheckbox('debugMode', this.settings.advanced.debugMode);
            this.setCheckbox('autoBackup', this.settings.advanced.autoBackup);
        }
        
        // 主题设置
        if (this.settings.theme) {
            this.setRadio('themeMode', this.settings.theme.mode);
            this.setValue('accentColor', this.settings.theme.accentColor);
            this.setCheckbox('animations', this.settings.theme.animations);
        }
        
        // 分析设置
        if (this.settings.analytics) {
            this.setCheckbox('analyticsEnabled', this.settings.analytics.enabled);
            this.setCheckbox('trackPerformance', this.settings.analytics.trackPerformance);
            this.setCheckbox('trackErrors', this.settings.analytics.trackErrors);
        }
    }

    initColorPicker() {
        const colorInput = document.getElementById('accentColor');
        const colorPresets = document.querySelectorAll('.color-preset');
        
        colorInput.addEventListener('change', (e) => {
            this.updateAccentColor(e.target.value);
            this.markDirty();
        });
        
        colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                colorInput.value = color;
                this.updateAccentColor(color);
                this.updateColorPresetSelection(color);
                this.markDirty();
            });
        });
        
        // 初始化预设选择状态
        this.updateColorPresetSelection(colorInput.value);
    }

    updateAccentColor(color) {
        document.documentElement.style.setProperty('--primary-color', color);
    }

    updateColorPresetSelection(color) {
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.classList.toggle('active', preset.dataset.color === color);
        });
    }

    initTagInputs() {
        this.initTagInput('keywordInput', 'keywordTags');
        this.initTagInput('userInput', 'userTags');
    }

    initTagInput(inputId, tagsId) {
        const input = document.getElementById(inputId);
        const tagsContainer = document.getElementById(tagsId);
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                e.preventDefault();
                this.addTag(tagsContainer, input.value.trim());
                input.value = '';
                this.markDirty();
            }
        });
    }

    addTag(container, text) {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            ${text}
            <button class="tag-remove" type="button">&times;</button>
        `;
        
        tag.querySelector('.tag-remove').addEventListener('click', () => {
            tag.remove();
            this.markDirty();
        });
        
        container.appendChild(tag);
    }

    populateTags(containerId, tags) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        tags.forEach(tag => {
            this.addTag(container, tag);
        });
    }

    getTagsFromContainer(containerId) {
        const container = document.getElementById(containerId);
        return Array.from(container.querySelectorAll('.tag')).map(tag => 
            tag.textContent.replace('×', '').trim()
        );
    }

    initRangeInputs() {
        const minRange = document.getElementById('likeDelayMin');
        const maxRange = document.getElementById('likeDelayMax');
        
        [minRange, maxRange].forEach(range => {
            range.addEventListener('input', () => {
                this.updateRangeDisplay();
                this.markDirty();
            });
        });
    }

    updateRangeDisplay() {
        const minValue = document.getElementById('likeDelayMin').value;
        const maxValue = document.getElementById('likeDelayMax').value;
        
        document.getElementById('delayMinValue').textContent = minValue;
        document.getElementById('delayMaxValue').textContent = maxValue;
        
        // 确保最小值不大于最大值
        if (parseFloat(minValue) > parseFloat(maxValue)) {
            document.getElementById('likeDelayMax').value = minValue;
            document.getElementById('delayMaxValue').textContent = minValue;
        }
    }

    bindEvents() {
        // 保存按钮
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveSettings();
        });
        
        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSettings();
        });
        
        // 导出按钮
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportSettings();
        });
        
        // 导入按钮
        document.getElementById('importBtn').addEventListener('click', () => {
            this.importSettings();
        });
        
        // 文件输入
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileImport(e);
        });
        
        // 数据管理按钮
        document.getElementById('clearCacheBtn').addEventListener('click', () => {
            this.clearCache();
        });
        
        document.getElementById('clearLogsBtn').addEventListener('click', () => {
            this.clearLogs();
        });
        
        document.getElementById('resetSettingsBtn').addEventListener('click', () => {
            this.confirmResetSettings();
        });
        
        // 主题模式变化
        document.querySelectorAll('input[name="themeMode"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.applyTheme();
                this.markDirty();
            });
        });
        
        // 监听所有输入变化
        this.bindInputChanges();
        
        // 模态框事件
        this.bindModalEvents();
        
        // 键盘快捷键
        this.bindKeyboardShortcuts();
    }

    bindInputChanges() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.markDirty();
            });
        });
    }

    bindModalEvents() {
        const modal = document.getElementById('modal');
        const modalClose = document.querySelector('.modal-close');
        const modalCancel = document.getElementById('modalCancel');
        const modalConfirm = document.getElementById('modalConfirm');
        
        [modalClose, modalCancel].forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal();
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
        
        modalConfirm.addEventListener('click', () => {
            if (this.modalCallback) {
                this.modalCallback();
            }
            this.hideModal();
        });
    }

    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S 保存
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveSettings();
            }
            
            // Escape 关闭模态框
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }

    async saveSettings() {
        try {
            this.showLoading(true);
            
            // 收集表单数据
            const newSettings = this.collectFormData();
            
            // 保存设置
            await this.storage.updateSettings(newSettings);
            
            this.settings = newSettings;
            this.isDirty = false;
            
            // 应用主题
            this.applyTheme();
            
            // 通知后台脚本设置已更新
            if (chrome.runtime) {
                chrome.runtime.sendMessage({
                    action: 'updateSettings',
                    settings: newSettings
                });
            }
            
            this.showNotification('设置已保存', 'success');
            this.updateStatus('设置已保存', 'success');
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showNotification('保存设置失败', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    collectFormData() {
        return {
            enabled: this.getCheckbox('enabled'),
            autoStart: this.getCheckbox('autoStart'),
            dailyLimit: parseInt(this.getValue('dailyLimit')) || 100,
            
            likeDelay: {
                min: (parseFloat(this.getValue('likeDelayMin')) || 2) * 1000,
                max: (parseFloat(this.getValue('likeDelayMax')) || 5) * 1000
            },
            
            smartFilter: {
                enabled: this.getCheckbox('smartFilterEnabled'),
                skipLiked: this.getCheckbox('skipLiked'),
                skipOwnPosts: this.getCheckbox('skipOwnPosts'),
                skipAds: this.getCheckbox('skipAds'),
                keywordFilter: this.getTagsFromContainer('keywordTags'),
                userFilter: this.getTagsFromContainer('userTags')
            },
            
            notifications: {
                enabled: this.getCheckbox('notificationsEnabled'),
                desktop: this.getCheckbox('desktopNotifications'),
                sound: this.getCheckbox('soundNotifications'),
                onComplete: this.getCheckbox('notifyOnComplete'),
                onError: this.getCheckbox('notifyOnError'),
                onLimit: this.getCheckbox('notifyOnLimit')
            },
            
            advanced: {
                batchSize: parseInt(this.getValue('batchSize')) || 10,
                retryAttempts: parseInt(this.getValue('retryAttempts')) || 3,
                scrollDelay: parseInt(this.getValue('scrollDelay')) || 1000,
                pageLoadTimeout: parseInt(this.getValue('pageLoadTimeout')) || 10,
                debugMode: this.getCheckbox('debugMode'),
                autoBackup: this.getCheckbox('autoBackup')
            },
            
            theme: {
                mode: this.getRadio('themeMode'),
                accentColor: this.getValue('accentColor'),
                animations: this.getCheckbox('animations')
            },
            
            analytics: {
                enabled: this.getCheckbox('analyticsEnabled'),
                trackPerformance: this.getCheckbox('trackPerformance'),
                trackErrors: this.getCheckbox('trackErrors')
            }
        };
    }

    resetSettings() {
        this.showModal(
            '重置设置',
            '确定要重置所有设置到默认值吗？此操作不可撤销。',
            () => {
                this.performReset();
            }
        );
    }

    async performReset() {
        try {
            this.showLoading(true);
            
            // 获取默认设置
            const defaultSettings = this.getDefaultSettings();
            
            // 保存默认设置
            await this.storage.updateSettings(defaultSettings);
            
            this.settings = defaultSettings;
            this.isDirty = false;
            
            // 重新填充表单
            this.populateForm();
            
            // 应用主题
            this.applyTheme();
            
            this.showNotification('设置已重置', 'success');
            this.updateStatus('设置已重置', 'success');
            
        } catch (error) {
            console.error('Failed to reset settings:', error);
            this.showNotification('重置设置失败', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async exportSettings() {
        try {
            const data = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                settings: this.settings,
                statistics: this.statistics
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qzone-automator-settings-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            this.showNotification('设置已导出', 'success');
            
        } catch (error) {
            console.error('Failed to export settings:', error);
            this.showNotification('导出设置失败', 'error');
        }
    }

    importSettings() {
        document.getElementById('fileInput').click();
    }

    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // 验证数据格式
            if (!data.settings) {
                throw new Error('Invalid file format');
            }
            
            this.showModal(
                '导入设置',
                '确定要导入这些设置吗？当前设置将被覆盖。',
                async () => {
                    await this.performImport(data);
                }
            );
            
        } catch (error) {
            console.error('Failed to import settings:', error);
            this.showNotification('导入设置失败：文件格式错误', 'error');
        }
        
        // 清除文件输入
        event.target.value = '';
    }

    async performImport(data) {
        try {
            this.showLoading(true);
            
            // 保存导入的设置
            await this.storage.updateSettings(data.settings);
            
            if (data.statistics) {
                await this.storage.updateStatistics(data.statistics);
            }
            
            // 重新加载数据
            await this.loadData();
            
            // 重新填充表单
            this.populateForm();
            
            // 应用主题
            this.applyTheme();
            
            // 更新统计显示
            this.updateStatistics();
            
            this.isDirty = false;
            this.showNotification('设置已导入', 'success');
            this.updateStatus('设置已导入', 'success');
            
        } catch (error) {
            console.error('Failed to import settings:', error);
            this.showNotification('导入设置失败', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async clearCache() {
        try {
            if (this.storage.clearCache) {
                await this.storage.clearCache();
            } else {
                await chrome.storage.local.remove('cache');
            }
            
            this.showNotification('缓存已清除', 'success');
        } catch (error) {
            console.error('Failed to clear cache:', error);
            this.showNotification('清除缓存失败', 'error');
        }
    }

    async clearLogs() {
        try {
            if (this.storage.clearLogs) {
                await this.storage.clearLogs();
            } else {
                await chrome.storage.local.remove('logs');
            }
            
            this.showNotification('日志已清除', 'success');
        } catch (error) {
            console.error('Failed to clear logs:', error);
            this.showNotification('清除日志失败', 'error');
        }
    }

    confirmResetSettings() {
        this.showModal(
            '重置所有设置',
            '确定要重置所有设置并清除所有数据吗？此操作不可撤销！',
            async () => {
                try {
                    await chrome.storage.sync.clear();
                    await chrome.storage.local.clear();
                    
                    // 重新初始化
                    await this.loadData();
                    this.populateForm();
                    this.applyTheme();
                    this.updateStatistics();
                    
                    this.showNotification('所有数据已重置', 'success');
                } catch (error) {
                    console.error('Failed to reset all data:', error);
                    this.showNotification('重置失败', 'error');
                }
            }
        );
    }

    applyTheme() {
        const themeMode = this.getRadio('themeMode') || 'auto';
        const accentColor = this.getValue('accentColor') || '#667eea';
        
        // 应用主题模式
        if (themeMode === 'auto') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', themeMode);
        }
        
        // 应用主题色
        this.updateAccentColor(accentColor);
        this.updateColorPresetSelection(accentColor);
    }

    updateStatistics() {
        if (this.currentTab !== 'analytics') return;
        
        const stats = this.statistics;
        
        document.getElementById('totalLikes').textContent = stats.totalLikes || 0;
        document.getElementById('successRate').textContent = 
            ((stats.successRate || 0) * 100).toFixed(1) + '%';
        
        const totalHours = Math.floor((stats.totalRunTime || 0) / 3600000);
        document.getElementById('totalRunTime').textContent = totalHours + ' 小时';
        
        const avgDaily = stats.totalLikes && stats.dailyStats ? 
            Math.round(stats.totalLikes / Object.keys(stats.dailyStats).length) : 0;
        document.getElementById('avgDaily').textContent = avgDaily;
    }

    // 工具方法
    setValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }

    getValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }

    setCheckbox(id, checked) {
        const element = document.getElementById(id);
        if (element) element.checked = !!checked;
    }

    getCheckbox(id) {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    }

    setRadio(name, value) {
        const element = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (element) element.checked = true;
    }

    getRadio(name) {
        const element = document.querySelector(`input[name="${name}"]:checked`);
        return element ? element.value : '';
    }

    markDirty() {
        this.isDirty = true;
        this.updateStatus('有未保存的更改', 'warning');
    }

    updateStatus(message, type = 'success') {
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');
        
        if (statusText) statusText.textContent = message;
        
        if (statusDot) {
            statusDot.className = 'status-dot';
            if (type === 'error') statusDot.style.background = 'var(--error-color)';
            else if (type === 'warning') statusDot.style.background = 'var(--warning-color)';
            else statusDot.style.background = 'var(--success-color)';
        }
    }

    showLoading(show) {
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.classList.toggle('loading', show);
            saveBtn.disabled = show;
        }
    }

    showModal(title, message, callback) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        this.modalCallback = callback;
        
        modal.classList.add('show');
    }

    hideModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('show');
        this.modalCallback = null;
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 自动移除
        setTimeout(() => {
            notification.remove();
        }, 3000);
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
                pageLoadTimeout: 10,
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
}

// 初始化选项管理器
document.addEventListener('DOMContentLoaded', () => {
    new OptionsManager();
});