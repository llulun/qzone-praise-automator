// QZone Praise Automator Pro - Analytics Module

class AnalyticsEngine {
    constructor() {
        this.data = {
            dailyStats: {},
            hourlyStats: {},
            userStats: {},
            contentStats: {},
            performanceStats: {},
            errorStats: {}
        };
        
        this.insights = [];
        this.recommendations = [];
        
        // 初始化设置
        this.settings = {
            performanceMonitoring: {
                enabled: true,
                memoryInterval: 300000, // 5分钟
                metricsInterval: 60000,  // 1分钟
                alertThresholds: {
                    memoryUsage: 0.8,
                    responseTime: 5000,
                    errorRate: 0.1
                }
            },
            analysis: {
                enabled: true,
                insightInterval: 3600000, // 1小时
                reportInterval: 86400000, // 24小时
                dataRetention: 2592000000 // 30天
            },
            reporting: {
                enabled: true,
                autoExport: false,
                format: 'json'
            }
        };
        
        this.performanceMonitoringStarted = false;
        this.performanceObserver = null;
        
        // 异步初始化，避免在构造函数中调用
        this.initAsync();
    }
    
    async initAsync() {
        try {
            await this.init();
        } catch (error) {
            console.error('Analytics engine initialization failed:', error);
        }
    }

    async init() {
        await this.loadData();
        this.startPerformanceMonitoring();
        this.scheduleAnalysis();
    }

    async loadData() {
        try {
            const stored = await chrome.storage.local.get('analyticsData');
            if (stored.analyticsData) {
                this.data = { ...this.data, ...stored.analyticsData };
            }
        } catch (error) {
            console.error('Failed to load analytics data:', error);
        }
    }

    async saveData() {
        try {
            await chrome.storage.local.set({ analyticsData: this.data });
        } catch (error) {
            console.error('Failed to save analytics data:', error);
        }
    }

    // 记录点赞事件
    recordLikeEvent(eventData) {
        const now = new Date();
        const dateKey = now.toISOString().split('T')[0];
        const hourKey = now.getHours();
        
        // 每日统计
        if (!this.data.dailyStats[dateKey]) {
            this.data.dailyStats[dateKey] = {
                likes: 0,
                attempts: 0,
                errors: 0,
                duration: 0,
                users: new Set()
            };
        }
        
        const dailyStat = this.data.dailyStats[dateKey];
        dailyStat.attempts++;
        
        if (eventData.success) {
            dailyStat.likes++;
        } else {
            dailyStat.errors++;
        }
        
        if (eventData.userId) {
            dailyStat.users.add(eventData.userId);
        }
        
        // 每小时统计
        if (!this.data.hourlyStats[hourKey]) {
            this.data.hourlyStats[hourKey] = {
                likes: 0,
                attempts: 0,
                avgResponseTime: 0
            };
        }
        
        const hourlyStat = this.data.hourlyStats[hourKey];
        hourlyStat.attempts++;
        
        if (eventData.success) {
            hourlyStat.likes++;
        }
        
        if (eventData.responseTime) {
            hourlyStat.avgResponseTime = 
                (hourlyStat.avgResponseTime + eventData.responseTime) / 2;
        }
        
        // 用户统计
        if (eventData.userId) {
            if (!this.data.userStats[eventData.userId]) {
                this.data.userStats[eventData.userId] = {
                    likes: 0,
                    lastLiked: null,
                    frequency: 0,
                    contentTypes: {}
                };
            }
            
            const userStat = this.data.userStats[eventData.userId];
            if (eventData.success) {
                userStat.likes++;
                userStat.lastLiked = now.toISOString();
            }
            
            if (eventData.contentType) {
                userStat.contentTypes[eventData.contentType] = 
                    (userStat.contentTypes[eventData.contentType] || 0) + 1;
            }
        }
        
        // 内容统计
        if (eventData.contentType) {
            if (!this.data.contentStats[eventData.contentType]) {
                this.data.contentStats[eventData.contentType] = {
                    count: 0,
                    successRate: 0,
                    avgEngagement: 0
                };
            }
            
            const contentStat = this.data.contentStats[eventData.contentType];
            contentStat.count++;
            
            if (eventData.success) {
                contentStat.successRate = 
                    (contentStat.successRate * (contentStat.count - 1) + 1) / contentStat.count;
            }
        }
        
        this.saveData();
    }

    // 记录性能数据
    recordPerformance(metric, value) {
        const now = new Date();
        const dateKey = now.toISOString().split('T')[0];
        
        if (!this.data.performanceStats[dateKey]) {
            this.data.performanceStats[dateKey] = {};
        }
        
        if (!this.data.performanceStats[dateKey][metric]) {
            this.data.performanceStats[dateKey][metric] = {
                values: [],
                avg: 0,
                min: Infinity,
                max: -Infinity
            };
        }
        
        const perfStat = this.data.performanceStats[dateKey][metric];
        perfStat.values.push(value);
        
        // 保持最近100个值
        if (perfStat.values.length > 100) {
            perfStat.values.shift();
        }
        
        perfStat.avg = perfStat.values.reduce((a, b) => a + b, 0) / perfStat.values.length;
        perfStat.min = Math.min(perfStat.min, value);
        perfStat.max = Math.max(perfStat.max, value);
        
        this.saveData();
    }

    // 记录错误
    recordError(error, context) {
        const now = new Date();
        const dateKey = now.toISOString().split('T')[0];
        
        if (!this.data.errorStats[dateKey]) {
            this.data.errorStats[dateKey] = {};
        }
        
        const errorKey = error.name || 'UnknownError';
        if (!this.data.errorStats[dateKey][errorKey]) {
            this.data.errorStats[dateKey][errorKey] = {
                count: 0,
                contexts: [],
                lastOccurred: null
            };
        }
        
        const errorStat = this.data.errorStats[dateKey][errorKey];
        errorStat.count++;
        errorStat.lastOccurred = now.toISOString();
        
        if (context && errorStat.contexts.length < 10) {
            errorStat.contexts.push({
                context,
                timestamp: now.toISOString(),
                message: error.message
            });
        }
        
        this.saveData();
    }

    // 生成数据洞察
    generateInsights() {
        this.insights = [];
        
        // 分析最佳活动时间
        const bestHours = this.analyzeBestActiveHours();
        if (bestHours.length > 0) {
            this.insights.push({
                type: 'timing',
                title: '最佳活动时间',
                description: `在 ${bestHours.join(', ')} 点进行点赞活动效果最好`,
                impact: 'high',
                data: bestHours
            });
        }
        
        // 分析用户互动模式
        const userPatterns = this.analyzeUserPatterns();
        if (userPatterns.highEngagement.length > 0) {
            this.insights.push({
                type: 'users',
                title: '高互动用户',
                description: `发现 ${userPatterns.highEngagement.length} 个高互动用户`,
                impact: 'medium',
                data: userPatterns.highEngagement
            });
        }
        
        // 分析内容偏好
        const contentPrefs = this.analyzeContentPreferences();
        if (contentPrefs.preferred.length > 0) {
            this.insights.push({
                type: 'content',
                title: '内容偏好分析',
                description: `${contentPrefs.preferred[0]} 类型内容最受欢迎`,
                impact: 'medium',
                data: contentPrefs
            });
        }
        
        // 分析性能趋势
        const perfTrends = this.analyzePerformanceTrends();
        if (perfTrends.declining.length > 0) {
            this.insights.push({
                type: 'performance',
                title: '性能警告',
                description: `检测到性能下降趋势`,
                impact: 'high',
                data: perfTrends
            });
        }
        
        return this.insights;
    }

    // 生成智能推荐
    generateRecommendations() {
        this.recommendations = [];
        
        // 基于时间分析的推荐
        const timeRecommendations = this.getTimeBasedRecommendations();
        this.recommendations.push(...timeRecommendations);
        
        // 基于用户行为的推荐
        const userRecommendations = this.getUserBasedRecommendations();
        this.recommendations.push(...userRecommendations);
        
        // 基于性能的推荐
        const perfRecommendations = this.getPerformanceRecommendations();
        this.recommendations.push(...perfRecommendations);
        
        // 基于错误分析的推荐
        const errorRecommendations = this.getErrorBasedRecommendations();
        this.recommendations.push(...errorRecommendations);
        
        return this.recommendations;
    }

    // 分析最佳活动时间
    analyzeBestActiveHours() {
        const hourlyData = Object.entries(this.data.hourlyStats)
            .map(([hour, stats]) => ({
                hour: parseInt(hour),
                successRate: stats.likes / (stats.attempts || 1),
                totalLikes: stats.likes,
                avgResponseTime: stats.avgResponseTime
            }))
            .filter(data => data.totalLikes > 5) // 至少5次点赞
            .sort((a, b) => b.successRate - a.successRate);
        
        return hourlyData.slice(0, 3).map(data => data.hour);
    }

    // 分析用户互动模式
    analyzeUserPatterns() {
        const users = Object.entries(this.data.userStats)
            .map(([userId, stats]) => ({
                userId,
                likes: stats.likes,
                frequency: stats.frequency,
                lastLiked: stats.lastLiked,
                contentDiversity: Object.keys(stats.contentTypes).length
            }))
            .sort((a, b) => b.likes - a.likes);
        
        const avgLikes = users.reduce((sum, user) => sum + user.likes, 0) / users.length;
        
        return {
            highEngagement: users.filter(user => user.likes > avgLikes * 1.5).slice(0, 10),
            lowEngagement: users.filter(user => user.likes < avgLikes * 0.5),
            diverse: users.filter(user => user.contentDiversity > 3)
        };
    }

    // 分析内容偏好
    analyzeContentPreferences() {
        const contentTypes = Object.entries(this.data.contentStats)
            .map(([type, stats]) => ({
                type,
                count: stats.count,
                successRate: stats.successRate,
                avgEngagement: stats.avgEngagement
            }))
            .sort((a, b) => b.successRate - a.successRate);
        
        return {
            preferred: contentTypes.slice(0, 3).map(c => c.type),
            avoided: contentTypes.slice(-3).map(c => c.type),
            trending: contentTypes.filter(c => c.avgEngagement > 0.8)
        };
    }

    // 分析性能趋势
    analyzePerformanceTrends() {
        const recentDays = Object.keys(this.data.performanceStats)
            .sort()
            .slice(-7); // 最近7天
        
        const trends = {};
        
        ['responseTime', 'memoryUsage', 'cpuUsage'].forEach(metric => {
            const values = recentDays.map(day => {
                const dayStats = this.data.performanceStats[day];
                return dayStats[metric] ? dayStats[metric].avg : 0;
            }).filter(v => v > 0);
            
            if (values.length >= 3) {
                const trend = this.calculateTrend(values);
                trends[metric] = trend;
            }
        });
        
        return {
            improving: Object.keys(trends).filter(k => trends[k] < -0.1),
            declining: Object.keys(trends).filter(k => trends[k] > 0.1),
            stable: Object.keys(trends).filter(k => Math.abs(trends[k]) <= 0.1)
        };
    }

    // 计算趋势
    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const n = values.length;
        const sumX = (n * (n + 1)) / 2;
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = values.reduce((sum, y, i) => sum + (i + 1) * y, 0);
        const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope / (sumY / n); // 归一化斜率
    }

    // 基于时间的推荐
    getTimeBasedRecommendations() {
        const recommendations = [];
        const bestHours = this.analyzeBestActiveHours();
        
        if (bestHours.length > 0) {
            recommendations.push({
                type: 'timing',
                priority: 'high',
                title: '优化活动时间',
                description: `建议在 ${bestHours.join(', ')} 点进行点赞活动`,
                action: 'schedule',
                data: { hours: bestHours }
            });
        }
        
        // 检查活动频率
        const recentDays = Object.keys(this.data.dailyStats).slice(-7);
        const avgDailyLikes = recentDays.reduce((sum, day) => {
            return sum + (this.data.dailyStats[day]?.likes || 0);
        }, 0) / recentDays.length;
        
        if (avgDailyLikes < 20) {
            recommendations.push({
                type: 'frequency',
                priority: 'medium',
                title: '增加活动频率',
                description: '当前每日平均点赞数较低，建议适当增加活动频率',
                action: 'increase_frequency',
                data: { currentAvg: Math.round(avgDailyLikes) }
            });
        }
        
        return recommendations;
    }

    // 基于用户行为的推荐
    getUserBasedRecommendations() {
        const recommendations = [];
        const userPatterns = this.analyzeUserPatterns();
        
        if (userPatterns.highEngagement.length > 0) {
            recommendations.push({
                type: 'targeting',
                priority: 'medium',
                title: '重点关注高互动用户',
                description: `发现 ${userPatterns.highEngagement.length} 个高互动用户，建议优先关注`,
                action: 'prioritize_users',
                data: { users: userPatterns.highEngagement.slice(0, 5) }
            });
        }
        
        if (userPatterns.lowEngagement.length > userPatterns.highEngagement.length) {
            recommendations.push({
                type: 'filtering',
                priority: 'low',
                title: '优化用户过滤',
                description: '检测到较多低互动用户，建议调整过滤策略',
                action: 'adjust_filters',
                data: { lowEngagementCount: userPatterns.lowEngagement.length }
            });
        }
        
        return recommendations;
    }

    // 基于性能的推荐
    getPerformanceRecommendations() {
        const recommendations = [];
        const perfTrends = this.analyzePerformanceTrends();
        
        if (perfTrends.declining.includes('responseTime')) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                title: '优化响应时间',
                description: '检测到响应时间增长趋势，建议调整延迟设置',
                action: 'adjust_delays',
                data: { metric: 'responseTime' }
            });
        }
        
        if (perfTrends.declining.includes('memoryUsage')) {
            recommendations.push({
                type: 'performance',
                priority: 'medium',
                title: '优化内存使用',
                description: '内存使用量持续增长，建议清理缓存或重启插件',
                action: 'clear_cache',
                data: { metric: 'memoryUsage' }
            });
        }
        
        return recommendations;
    }

    // 基于错误分析的推荐
    getErrorBasedRecommendations() {
        const recommendations = [];
        const recentErrors = Object.values(this.data.errorStats)
            .flatMap(dayErrors => Object.entries(dayErrors))
            .filter(([_, errorData]) => {
                const lastOccurred = new Date(errorData.lastOccurred);
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return lastOccurred > dayAgo;
            });
        
        if (recentErrors.length > 5) {
            recommendations.push({
                type: 'stability',
                priority: 'high',
                title: '提高稳定性',
                description: '检测到较多错误，建议检查网络连接或调整设置',
                action: 'check_stability',
                data: { errorCount: recentErrors.length }
            });
        }
        
        return recommendations;
    }

    // 获取统计摘要
    getStatsSummary() {
        const today = new Date().toISOString().split('T')[0];
        const todayStats = this.data.dailyStats[today] || { likes: 0, attempts: 0, errors: 0 };
        
        const totalLikes = Object.values(this.data.dailyStats)
            .reduce((sum, day) => sum + (day.likes || 0), 0);
        
        const totalAttempts = Object.values(this.data.dailyStats)
            .reduce((sum, day) => sum + (day.attempts || 0), 0);
        
        const successRate = totalAttempts > 0 ? totalLikes / totalAttempts : 0;
        
        const activeDays = Object.keys(this.data.dailyStats).length;
        const avgDailyLikes = activeDays > 0 ? totalLikes / activeDays : 0;
        
        return {
            today: {
                likes: todayStats.likes,
                attempts: todayStats.attempts,
                errors: todayStats.errors,
                successRate: todayStats.attempts > 0 ? todayStats.likes / todayStats.attempts : 0
            },
            total: {
                likes: totalLikes,
                attempts: totalAttempts,
                successRate: successRate,
                activeDays: activeDays,
                avgDailyLikes: Math.round(avgDailyLikes)
            },
            users: {
                total: Object.keys(this.data.userStats).length,
                active: Object.values(this.data.userStats)
                    .filter(user => {
                        if (!user.lastLiked) return false;
                        const lastLiked = new Date(user.lastLiked);
                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        return lastLiked > weekAgo;
                    }).length
            }
        };
    }

    // 开始性能监控
    startPerformanceMonitoring() {
        if (this.performanceMonitoringStarted) {
            return;
        }
        this.performanceMonitoringStarted = true;
        
        // 降低内存监控频率
        this.memoryMonitoringInterval = setInterval(() => {
            this.collectMemoryMetrics();
        }, Math.max(this.settings.performanceMonitoring.memoryInterval, 300000)); // 最少5分钟
        
        // 页面加载时间监控（仅在浏览器环境中）
        if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
            this.performanceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordPageLoadTime(entry);
                }
            });
            this.performanceObserver.observe({ entryTypes: ['navigation'] });
        }
    }

    // 开始分析调度
    startAnalysisScheduling() {
        if (this.analysisSchedulingStarted) {
            return;
        }
        this.analysisSchedulingStarted = true;
        
        // 降低分析频率
        this.analysisInterval = setInterval(() => {
            this.generateInsights();
            this.generateRecommendations();
        }, Math.max(this.settings.analysis.insightInterval, 3600000)); // 最少1小时
        
        // 延迟首次执行
        setTimeout(() => {
            this.generateInsights();
            this.generateRecommendations();
        }, 30000); // 30秒后执行，而不是5秒
    }

    // 定期分析
    scheduleAnalysis() {
        // 每小时生成洞察和推荐
        setInterval(() => {
            this.generateInsights();
            this.generateRecommendations();
        }, 60 * 60 * 1000); // 1小时
        
        // 立即执行一次
        setTimeout(() => {
            this.generateInsights();
            this.generateRecommendations();
        }, 5000);
    }

    // 导出分析报告
    exportReport() {
        const summary = this.getStatsSummary();
        const insights = this.generateInsights();
        const recommendations = this.generateRecommendations();
        
        return {
            generatedAt: new Date().toISOString(),
            summary,
            insights,
            recommendations,
            rawData: this.data
        };
    }

    // 清理旧数据
    cleanupOldData(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffString = cutoffDate.toISOString().split('T')[0];
        
        // 清理每日统计
        Object.keys(this.data.dailyStats).forEach(date => {
            if (date < cutoffString) {
                delete this.data.dailyStats[date];
            }
        });
        
        // 清理性能统计
        Object.keys(this.data.performanceStats).forEach(date => {
            if (date < cutoffString) {
                delete this.data.performanceStats[date];
            }
        });
        
        // 清理错误统计
        Object.keys(this.data.errorStats).forEach(date => {
            if (date < cutoffString) {
                delete this.data.errorStats[date];
            }
        });
        
        this.saveData();
    }

    // 停止所有监控和清理资源
    stopMonitoring() {
        if (this.memoryMonitoringInterval) {
            clearInterval(this.memoryMonitoringInterval);
            this.memoryMonitoringInterval = null;
        }
        
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }
        
        this.performanceMonitoringStarted = false;
        this.analysisSchedulingStarted = false;
    }

    // 销毁分析引擎
    destroy() {
        this.stopMonitoring();
        
        // 清理PerformanceObserver
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
            this.performanceObserver = null;
        }
        
        this.data = null;
        this.insights = null;
        this.recommendations = null;
    }
}

// 导出分析引擎
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsEngine;
} else if (typeof window !== 'undefined') {
    window.AnalyticsEngine = AnalyticsEngine;
}