// QZone Praise Automator Pro - Recommendation System

class RecommendationSystem {
    constructor() {
        this.rules = new Map();
        this.userProfile = {};
        this.contextData = {};
        this.recommendations = [];
        
        this.init();
    }

    async init() {
        await this.loadUserProfile();
        this.initializeRules();
        this.startContextMonitoring();
    }

    async loadUserProfile() {
        try {
            const stored = await chrome.storage.local.get('userProfile');
            this.userProfile = stored.userProfile || {
                preferences: {},
                behavior: {},
                performance: {},
                goals: {}
            };
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
    }

    async saveUserProfile() {
        try {
            await chrome.storage.local.set({ userProfile: this.userProfile });
        } catch (error) {
            console.error('Failed to save user profile:', error);
        }
    }

    // 初始化推荐规则
    initializeRules() {
        // 时间优化规则
        this.addRule('time_optimization', {
            condition: (context) => {
                const currentHour = new Date().getHours();
                const bestHours = context.analytics?.bestActiveHours || [];
                return !bestHours.includes(currentHour) && bestHours.length > 0;
            },
            recommendation: (context) => ({
                type: 'timing',
                priority: 'medium',
                title: '优化活动时间',
                description: `当前时间(${new Date().getHours()}点)不是最佳活动时间，建议在 ${context.analytics.bestActiveHours.join(', ')} 点进行`,
                action: 'adjust_schedule',
                confidence: 0.8,
                data: {
                    currentHour: new Date().getHours(),
                    recommendedHours: context.analytics.bestActiveHours
                }
            })
        });

        // 频率调整规则
        this.addRule('frequency_adjustment', {
            condition: (context) => {
                const recentSuccessRate = context.statistics?.recentSuccessRate || 0;
                const targetRate = this.userProfile.goals?.targetSuccessRate || 0.8;
                return Math.abs(recentSuccessRate - targetRate) > 0.2;
            },
            recommendation: (context) => {
                const recentRate = context.statistics.recentSuccessRate;
                const targetRate = this.userProfile.goals.targetSuccessRate || 0.8;
                const isLow = recentRate < targetRate;
                
                return {
                    type: 'frequency',
                    priority: isLow ? 'high' : 'medium',
                    title: isLow ? '降低操作频率' : '可以提高操作频率',
                    description: isLow 
                        ? `当前成功率(${(recentRate * 100).toFixed(1)}%)低于目标，建议降低操作频率`
                        : `当前成功率(${(recentRate * 100).toFixed(1)}%)良好，可以适当提高频率`,
                    action: isLow ? 'decrease_frequency' : 'increase_frequency',
                    confidence: 0.7,
                    data: {
                        currentRate: recentRate,
                        targetRate: targetRate,
                        adjustment: isLow ? -0.2 : 0.1
                    }
                };
            }
        });

        // 内容过滤优化规则
        this.addRule('content_filter_optimization', {
            condition: (context) => {
                const contentStats = context.analytics?.contentPreferences || {};
                const lowPerformingTypes = contentStats.avoided || [];
                return lowPerformingTypes.length > 0;
            },
            recommendation: (context) => ({
                type: 'filtering',
                priority: 'medium',
                title: '优化内容过滤',
                description: `检测到某些内容类型表现不佳，建议添加过滤规则`,
                action: 'update_filters',
                confidence: 0.6,
                data: {
                    avoidedTypes: context.analytics.contentPreferences.avoided,
                    preferredTypes: context.analytics.contentPreferences.preferred
                }
            })
        });

        // 用户互动优化规则
        this.addRule('user_interaction_optimization', {
            condition: (context) => {
                const userPatterns = context.analytics?.userPatterns || {};
                const highEngagement = userPatterns.highEngagement || [];
                const lowEngagement = userPatterns.lowEngagement || [];
                return highEngagement.length > 0 || lowEngagement.length > 10;
            },
            recommendation: (context) => {
                const patterns = context.analytics.userPatterns;
                const hasHighEngagement = patterns.highEngagement.length > 0;
                const hasManyLowEngagement = patterns.lowEngagement.length > 10;
                
                if (hasHighEngagement && hasManyLowEngagement) {
                    return {
                        type: 'targeting',
                        priority: 'high',
                        title: '优化用户定位',
                        description: `发现${patterns.highEngagement.length}个高互动用户和${patterns.lowEngagement.length}个低互动用户，建议调整策略`,
                        action: 'optimize_targeting',
                        confidence: 0.8,
                        data: {
                            highEngagementUsers: patterns.highEngagement.slice(0, 5),
                            lowEngagementCount: patterns.lowEngagement.length
                        }
                    };
                } else if (hasHighEngagement) {
                    return {
                        type: 'targeting',
                        priority: 'medium',
                        title: '重点关注高互动用户',
                        description: `发现${patterns.highEngagement.length}个高互动用户，建议优先关注`,
                        action: 'prioritize_users',
                        confidence: 0.7,
                        data: {
                            users: patterns.highEngagement.slice(0, 5)
                        }
                    };
                }
                
                return null;
            }
        });

        // 性能优化规则
        this.addRule('performance_optimization', {
            condition: (context) => {
                const perfTrends = context.analytics?.performanceTrends || {};
                return perfTrends.declining && perfTrends.declining.length > 0;
            },
            recommendation: (context) => {
                const declining = context.analytics.performanceTrends.declining;
                const primaryIssue = declining[0];
                
                const recommendations = {
                    responseTime: {
                        title: '优化响应时间',
                        description: '检测到响应时间增长，建议增加延迟或减少并发',
                        action: 'adjust_delays'
                    },
                    memoryUsage: {
                        title: '优化内存使用',
                        description: '内存使用量持续增长，建议清理缓存',
                        action: 'clear_cache'
                    },
                    cpuUsage: {
                        title: '优化CPU使用',
                        description: 'CPU使用率过高，建议降低操作频率',
                        action: 'reduce_intensity'
                    }
                };
                
                const rec = recommendations[primaryIssue];
                if (rec) {
                    return {
                        type: 'performance',
                        priority: 'high',
                        title: rec.title,
                        description: rec.description,
                        action: rec.action,
                        confidence: 0.9,
                        data: {
                            metric: primaryIssue,
                            decliningMetrics: declining
                        }
                    };
                }
                
                return null;
            }
        });

        // 错误处理规则
        this.addRule('error_handling', {
            condition: (context) => {
                const errorRate = context.statistics?.errorRate || 0;
                return errorRate > 0.1; // 错误率超过10%
            },
            recommendation: (context) => ({
                type: 'stability',
                priority: 'high',
                title: '提高稳定性',
                description: `当前错误率为${(context.statistics.errorRate * 100).toFixed(1)}%，建议检查网络或调整设置`,
                action: 'improve_stability',
                confidence: 0.8,
                data: {
                    errorRate: context.statistics.errorRate,
                    commonErrors: context.analytics?.commonErrors || []
                }
            })
        });

        // 目标达成规则
        this.addRule('goal_achievement', {
            condition: (context) => {
                const dailyTarget = this.userProfile.goals?.dailyTarget || 0;
                const currentProgress = context.statistics?.todayLikes || 0;
                const progressRate = dailyTarget > 0 ? currentProgress / dailyTarget : 0;
                const currentHour = new Date().getHours();
                const expectedProgress = currentHour / 24;
                
                return dailyTarget > 0 && Math.abs(progressRate - expectedProgress) > 0.3;
            },
            recommendation: (context) => {
                const dailyTarget = this.userProfile.goals.dailyTarget;
                const currentProgress = context.statistics.todayLikes;
                const progressRate = currentProgress / dailyTarget;
                const currentHour = new Date().getHours();
                const expectedProgress = currentHour / 24;
                const isBehind = progressRate < expectedProgress;
                
                return {
                    type: 'goal',
                    priority: isBehind ? 'high' : 'medium',
                    title: isBehind ? '加快进度以达成目标' : '进度良好，可以放缓',
                    description: isBehind 
                        ? `当前进度${(progressRate * 100).toFixed(1)}%，落后于预期，建议加快操作`
                        : `当前进度${(progressRate * 100).toFixed(1)}%，超前于预期，可以适当放缓`,
                    action: isBehind ? 'accelerate' : 'maintain_pace',
                    confidence: 0.7,
                    data: {
                        currentProgress,
                        dailyTarget,
                        progressRate,
                        expectedProgress,
                        remaining: dailyTarget - currentProgress
                    }
                };
            }
        });

        // 学习适应规则
        this.addRule('adaptive_learning', {
            condition: (context) => {
                const userBehavior = this.userProfile.behavior || {};
                const recentChanges = userBehavior.recentSettingsChanges || [];
                return recentChanges.length > 3; // 最近有多次设置变更
            },
            recommendation: (context) => {
                const changes = this.userProfile.behavior.recentSettingsChanges;
                const patterns = this.analyzeSettingsPatterns(changes);
                
                return {
                    type: 'learning',
                    priority: 'low',
                    title: '学习您的偏好',
                    description: `检测到您经常调整${patterns.mostChanged}设置，建议自动优化`,
                    action: 'auto_adjust',
                    confidence: 0.5,
                    data: {
                        patterns,
                        suggestedSettings: this.generateOptimalSettings(patterns)
                    }
                };
            }
        });
    }

    // 添加推荐规则
    addRule(name, rule) {
        this.rules.set(name, rule);
    }

    // 更新上下文数据
    updateContext(newContext) {
        this.contextData = { ...this.contextData, ...newContext };
    }

    // 生成推荐
    generateRecommendations() {
        this.recommendations = [];
        
        for (const [name, rule] of this.rules) {
            try {
                if (rule.condition(this.contextData)) {
                    const recommendation = rule.recommendation(this.contextData);
                    if (recommendation) {
                        recommendation.id = this.generateRecommendationId();
                        recommendation.ruleName = name;
                        recommendation.timestamp = new Date().toISOString();
                        this.recommendations.push(recommendation);
                    }
                }
            } catch (error) {
                console.error(`Error in rule ${name}:`, error);
            }
        }
        
        // 按优先级和置信度排序
        this.recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return (b.confidence || 0) - (a.confidence || 0);
        });
        
        return this.recommendations;
    }

    // 应用推荐
    async applyRecommendation(recommendationId, userApproved = true) {
        const recommendation = this.recommendations.find(r => r.id === recommendationId);
        if (!recommendation) {
            throw new Error('Recommendation not found');
        }
        
        // 记录用户反馈
        this.recordUserFeedback(recommendation, userApproved);
        
        if (!userApproved) {
            return { success: false, message: 'User declined recommendation' };
        }
        
        try {
            const result = await this.executeRecommendationAction(recommendation);
            
            // 更新用户行为记录
            this.updateUserBehavior(recommendation, result);
            
            return result;
        } catch (error) {
            console.error('Failed to apply recommendation:', error);
            return { success: false, error: error.message };
        }
    }

    // 执行推荐动作
    async executeRecommendationAction(recommendation) {
        const { action, data } = recommendation;
        
        switch (action) {
            case 'adjust_schedule':
                return await this.adjustSchedule(data);
                
            case 'decrease_frequency':
            case 'increase_frequency':
                return await this.adjustFrequency(action, data);
                
            case 'update_filters':
                return await this.updateFilters(data);
                
            case 'optimize_targeting':
            case 'prioritize_users':
                return await this.optimizeTargeting(data);
                
            case 'adjust_delays':
                return await this.adjustDelays(data);
                
            case 'clear_cache':
                return await this.clearCache();
                
            case 'reduce_intensity':
                return await this.reduceIntensity(data);
                
            case 'improve_stability':
                return await this.improveStability(data);
                
            case 'accelerate':
            case 'maintain_pace':
                return await this.adjustPace(action, data);
                
            case 'auto_adjust':
                return await this.autoAdjustSettings(data);
                
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    // 调整时间安排
    async adjustSchedule(data) {
        const settings = await this.getCurrentSettings();
        settings.schedule = {
            ...settings.schedule,
            preferredHours: data.recommendedHours,
            avoidCurrentHour: true
        };
        
        await this.updateSettings(settings);
        return { success: true, message: '已调整活动时间安排' };
    }

    // 调整频率
    async adjustFrequency(action, data) {
        const settings = await this.getCurrentSettings();
        const currentDelay = settings.likeDelay || { min: 2000, max: 5000 };
        const adjustment = data.adjustment || (action === 'increase_frequency' ? -0.2 : 0.2);
        
        settings.likeDelay = {
            min: Math.max(1000, currentDelay.min * (1 + adjustment)),
            max: Math.max(2000, currentDelay.max * (1 + adjustment))
        };
        
        await this.updateSettings(settings);
        return { 
            success: true, 
            message: `已${action === 'increase_frequency' ? '提高' : '降低'}操作频率` 
        };
    }

    // 更新过滤器
    async updateFilters(data) {
        const settings = await this.getCurrentSettings();
        const smartFilter = settings.smartFilter || {};
        
        // 添加避免的内容类型到关键词过滤
        if (data.avoidedTypes) {
            smartFilter.keywordFilter = [
                ...(smartFilter.keywordFilter || []),
                ...data.avoidedTypes
            ];
        }
        
        settings.smartFilter = smartFilter;
        await this.updateSettings(settings);
        return { success: true, message: '已更新内容过滤规则' };
    }

    // 优化用户定位
    async optimizeTargeting(data) {
        const settings = await this.getCurrentSettings();
        
        if (data.highEngagementUsers) {
            // 创建高优先级用户列表
            settings.priorityUsers = data.highEngagementUsers.map(u => u.userId);
        }
        
        if (data.lowEngagementCount > 20) {
            // 启用更严格的过滤
            settings.smartFilter = {
                ...settings.smartFilter,
                strictMode: true
            };
        }
        
        await this.updateSettings(settings);
        return { success: true, message: '已优化用户定位策略' };
    }

    // 调整延迟
    async adjustDelays(data) {
        const settings = await this.getCurrentSettings();
        const currentDelay = settings.likeDelay || { min: 2000, max: 5000 };
        
        // 增加延迟以改善性能
        settings.likeDelay = {
            min: currentDelay.min * 1.5,
            max: currentDelay.max * 1.5
        };
        
        // 减少批处理大小
        if (settings.advanced) {
            settings.advanced.batchSize = Math.max(1, (settings.advanced.batchSize || 10) - 2);
        }
        
        await this.updateSettings(settings);
        return { success: true, message: '已调整延迟设置以优化性能' };
    }

    // 清理缓存
    async clearCache() {
        try {
            await chrome.storage.local.remove(['cache', 'tempData']);
            return { success: true, message: '已清理缓存' };
        } catch (error) {
            throw new Error('清理缓存失败: ' + error.message);
        }
    }

    // 降低强度
    async reduceIntensity(data) {
        const settings = await this.getCurrentSettings();
        
        // 增加延迟
        if (settings.likeDelay) {
            settings.likeDelay.min *= 2;
            settings.likeDelay.max *= 2;
        }
        
        // 减少批处理大小
        if (settings.advanced) {
            settings.advanced.batchSize = Math.max(1, Math.floor((settings.advanced.batchSize || 10) / 2));
        }
        
        await this.updateSettings(settings);
        return { success: true, message: '已降低操作强度' };
    }

    // 提高稳定性
    async improveStability(data) {
        const settings = await this.getCurrentSettings();
        
        // 增加重试次数
        if (settings.advanced) {
            settings.advanced.retryAttempts = Math.min(5, (settings.advanced.retryAttempts || 3) + 1);
            settings.advanced.pageLoadTimeout = Math.min(30, (settings.advanced.pageLoadTimeout || 10) + 5);
        }
        
        // 启用更保守的设置
        settings.likeDelay = {
            min: Math.max(3000, settings.likeDelay?.min || 2000),
            max: Math.max(6000, settings.likeDelay?.max || 5000)
        };
        
        await this.updateSettings(settings);
        return { success: true, message: '已调整设置以提高稳定性' };
    }

    // 调整节奏
    async adjustPace(action, data) {
        const settings = await this.getCurrentSettings();
        
        if (action === 'accelerate') {
            // 加快节奏
            if (settings.likeDelay) {
                settings.likeDelay.min = Math.max(1000, settings.likeDelay.min * 0.8);
                settings.likeDelay.max = Math.max(2000, settings.likeDelay.max * 0.8);
            }
        } else {
            // 保持当前节奏，可能稍微放缓
            if (settings.likeDelay) {
                settings.likeDelay.min = settings.likeDelay.min * 1.1;
                settings.likeDelay.max = settings.likeDelay.max * 1.1;
            }
        }
        
        await this.updateSettings(settings);
        return { 
            success: true, 
            message: action === 'accelerate' ? '已加快操作节奏' : '已调整为稳定节奏' 
        };
    }

    // 自动调整设置
    async autoAdjustSettings(data) {
        const settings = await this.getCurrentSettings();
        const suggestedSettings = data.suggestedSettings || {};
        
        // 应用建议的设置
        Object.assign(settings, suggestedSettings);
        
        await this.updateSettings(settings);
        return { success: true, message: '已根据您的使用习惯自动调整设置' };
    }

    // 记录用户反馈
    recordUserFeedback(recommendation, approved) {
        if (!this.userProfile.behavior) {
            this.userProfile.behavior = {};
        }
        
        if (!this.userProfile.behavior.recommendationFeedback) {
            this.userProfile.behavior.recommendationFeedback = [];
        }
        
        this.userProfile.behavior.recommendationFeedback.push({
            recommendationId: recommendation.id,
            type: recommendation.type,
            action: recommendation.action,
            approved,
            timestamp: new Date().toISOString(),
            confidence: recommendation.confidence
        });
        
        // 保持最近100条反馈
        if (this.userProfile.behavior.recommendationFeedback.length > 100) {
            this.userProfile.behavior.recommendationFeedback.shift();
        }
        
        this.saveUserProfile();
    }

    // 更新用户行为记录
    updateUserBehavior(recommendation, result) {
        if (!this.userProfile.behavior) {
            this.userProfile.behavior = {};
        }
        
        // 记录应用的推荐
        if (!this.userProfile.behavior.appliedRecommendations) {
            this.userProfile.behavior.appliedRecommendations = [];
        }
        
        this.userProfile.behavior.appliedRecommendations.push({
            recommendationId: recommendation.id,
            type: recommendation.type,
            action: recommendation.action,
            result,
            timestamp: new Date().toISOString()
        });
        
        // 更新偏好
        this.updateUserPreferences(recommendation, result);
        
        this.saveUserProfile();
    }

    // 更新用户偏好
    updateUserPreferences(recommendation, result) {
        if (!this.userProfile.preferences) {
            this.userProfile.preferences = {};
        }
        
        const prefs = this.userProfile.preferences;
        
        // 根据推荐类型更新偏好
        if (result.success) {
            switch (recommendation.type) {
                case 'timing':
                    prefs.preferredTiming = recommendation.data.recommendedHours;
                    break;
                case 'frequency':
                    prefs.preferredFrequency = recommendation.action;
                    break;
                case 'performance':
                    prefs.performanceOptimization = true;
                    break;
            }
        }
    }

    // 分析设置变更模式
    analyzeSettingsPatterns(changes) {
        const settingCounts = {};
        const recentChanges = changes.slice(-10); // 最近10次变更
        
        recentChanges.forEach(change => {
            settingCounts[change.setting] = (settingCounts[change.setting] || 0) + 1;
        });
        
        const mostChanged = Object.keys(settingCounts)
            .sort((a, b) => settingCounts[b] - settingCounts[a])[0];
        
        return {
            mostChanged,
            settingCounts,
            totalChanges: recentChanges.length
        };
    }

    // 生成最优设置
    generateOptimalSettings(patterns) {
        const optimal = {};
        
        // 基于用户行为模式生成建议设置
        if (patterns.mostChanged === 'likeDelay') {
            // 用户经常调整延迟，建议一个中等值
            optimal.likeDelay = { min: 3000, max: 5000 };
        }
        
        if (patterns.mostChanged === 'dailyLimit') {
            // 基于历史调整建议合适的每日限制
            optimal.dailyLimit = 80; // 保守估计
        }
        
        return optimal;
    }

    // 获取当前设置
    async getCurrentSettings() {
        try {
            const result = await chrome.storage.sync.get('settings');
            return result.settings || {};
        } catch (error) {
            console.error('Failed to get current settings:', error);
            return {};
        }
    }

    // 更新设置
    async updateSettings(settings) {
        try {
            await chrome.storage.sync.set({ settings });
            
            // 记录设置变更
            this.recordSettingsChange(settings);
            
            // 通知其他组件设置已更新
            if (chrome.runtime) {
                chrome.runtime.sendMessage({
                    action: 'settingsUpdated',
                    settings
                });
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error;
        }
    }

    // 记录设置变更
    recordSettingsChange(newSettings) {
        if (!this.userProfile.behavior) {
            this.userProfile.behavior = {};
        }
        
        if (!this.userProfile.behavior.recentSettingsChanges) {
            this.userProfile.behavior.recentSettingsChanges = [];
        }
        
        // 简化记录，只记录主要设置
        const importantSettings = ['likeDelay', 'dailyLimit', 'smartFilter'];
        importantSettings.forEach(setting => {
            if (newSettings[setting]) {
                this.userProfile.behavior.recentSettingsChanges.push({
                    setting,
                    value: newSettings[setting],
                    timestamp: new Date().toISOString(),
                    source: 'recommendation'
                });
            }
        });
        
        // 保持最近20次变更
        if (this.userProfile.behavior.recentSettingsChanges.length > 20) {
            this.userProfile.behavior.recentSettingsChanges = 
                this.userProfile.behavior.recentSettingsChanges.slice(-20);
        }
        
        this.saveUserProfile();
    }

    // 生成推荐ID
    generateRecommendationId() {
        return 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 开始上下文监控
    startContextMonitoring() {
        // 定期更新上下文数据
        setInterval(() => {
            this.updateContextFromAnalytics();
        }, 5 * 60 * 1000); // 每5分钟更新一次
    }

    // 从分析数据更新上下文
    async updateContextFromAnalytics() {
        try {
            // 获取最新的分析数据
            if (typeof window !== 'undefined' && window.analyticsEngine) {
                const analytics = window.analyticsEngine;
                this.updateContext({
                    analytics: {
                        bestActiveHours: analytics.analyzeBestActiveHours(),
                        userPatterns: analytics.analyzeUserPatterns(),
                        contentPreferences: analytics.analyzeContentPreferences(),
                        performanceTrends: analytics.analyzePerformanceTrends()
                    },
                    statistics: analytics.getStatsSummary()
                });
            }
        } catch (error) {
            console.error('Failed to update context from analytics:', error);
        }
    }

    // 获取推荐摘要
    getRecommendationSummary() {
        const recommendations = this.generateRecommendations();
        
        return {
            total: recommendations.length,
            byPriority: {
                high: recommendations.filter(r => r.priority === 'high').length,
                medium: recommendations.filter(r => r.priority === 'medium').length,
                low: recommendations.filter(r => r.priority === 'low').length
            },
            byType: recommendations.reduce((acc, r) => {
                acc[r.type] = (acc[r.type] || 0) + 1;
                return acc;
            }, {}),
            topRecommendations: recommendations.slice(0, 3)
        };
    }
}

// 导出推荐系统
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecommendationSystem;
} else if (typeof window !== 'undefined') {
    window.RecommendationSystem = RecommendationSystem;
}