// QZone Praise Automator Pro - Machine Learning Engine

class MLEngine {
    constructor() {
        this.models = new Map();
        this.trainingData = [];
        this.features = [];
        this.predictions = new Map();
        this.modelAccuracy = new Map();
        
        this.init();
    }

    async init() {
        await this.loadTrainingData();
        this.initializeModels();
        this.startContinuousLearning();
    }

    // 初始化机器学习模型
    initializeModels() {
        // 成功率预测模型
        this.models.set('success_prediction', new SuccessPredictionModel());
        
        // 最佳时间预测模型
        this.models.set('optimal_timing', new OptimalTimingModel());
        
        // 用户行为预测模型
        this.models.set('user_behavior', new UserBehaviorModel());
        
        // 内容质量评估模型
        this.models.set('content_quality', new ContentQualityModel());
        
        // 风险评估模型
        this.models.set('risk_assessment', new RiskAssessmentModel());
        
        // 性能预测模型
        this.models.set('performance_prediction', new PerformancePredictionModel());
    }

    // 加载训练数据
    async loadTrainingData() {
        try {
            const stored = await chrome.storage.local.get('mlTrainingData');
            this.trainingData = stored.mlTrainingData || [];
            
            // 如果没有足够的训练数据，使用默认数据集
            if (this.trainingData.length < 100) {
                this.trainingData = this.generateDefaultTrainingData();
            }
        } catch (error) {
            console.error('Failed to load training data:', error);
            this.trainingData = this.generateDefaultTrainingData();
        }
    }

    // 保存训练数据
    async saveTrainingData() {
        try {
            // 只保存最近的1000条数据
            const dataToSave = this.trainingData.slice(-1000);
            await chrome.storage.local.set({ mlTrainingData: dataToSave });
        } catch (error) {
            console.error('Failed to save training data:', error);
        }
    }

    // 添加训练样本
    addTrainingSample(sample) {
        // 验证样本格式
        if (!this.validateSample(sample)) {
            console.warn('Invalid training sample:', sample);
            return;
        }
        
        // 添加时间戳
        sample.timestamp = new Date().toISOString();
        
        // 添加到训练数据
        this.trainingData.push(sample);
        
        // 限制数据大小
        if (this.trainingData.length > 2000) {
            this.trainingData = this.trainingData.slice(-1500);
        }
        
        // 异步保存
        this.saveTrainingData();
        
        // 触发增量学习
        this.incrementalLearning(sample);
    }

    // 验证训练样本
    validateSample(sample) {
        const requiredFields = ['action', 'context', 'result', 'features'];
        return requiredFields.every(field => sample.hasOwnProperty(field));
    }

    // 预测成功率
    async predictSuccessRate(context) {
        const model = this.models.get('success_prediction');
        if (!model || !model.isTrained()) {
            return { probability: 0.5, confidence: 0.1 };
        }
        
        const features = this.extractFeatures(context, 'success_prediction');
        const prediction = model.predict(features);
        
        return {
            probability: prediction.value,
            confidence: prediction.confidence,
            factors: prediction.factors
        };
    }

    // 预测最佳操作时间
    async predictOptimalTiming(context) {
        const model = this.models.get('optimal_timing');
        if (!model || !model.isTrained()) {
            return { hour: new Date().getHours(), confidence: 0.1 };
        }
        
        const features = this.extractFeatures(context, 'optimal_timing');
        const prediction = model.predict(features);
        
        return {
            hour: prediction.value,
            confidence: prediction.confidence,
            reasoning: prediction.reasoning
        };
    }

    // 预测用户行为
    async predictUserBehavior(userId, context) {
        const model = this.models.get('user_behavior');
        if (!model || !model.isTrained()) {
            return { engagement: 0.5, responseTime: 3600, confidence: 0.1 };
        }
        
        const features = this.extractUserFeatures(userId, context);
        const prediction = model.predict(features);
        
        return {
            engagement: prediction.engagement,
            responseTime: prediction.responseTime,
            interactionType: prediction.interactionType,
            confidence: prediction.confidence
        };
    }

    // 评估内容质量
    async assessContentQuality(content) {
        const model = this.models.get('content_quality');
        if (!model || !model.isTrained()) {
            return { score: 0.5, confidence: 0.1 };
        }
        
        const features = this.extractContentFeatures(content);
        const prediction = model.predict(features);
        
        return {
            score: prediction.value,
            confidence: prediction.confidence,
            factors: prediction.factors,
            suggestions: prediction.suggestions
        };
    }

    // 风险评估
    async assessRisk(action, context) {
        const model = this.models.get('risk_assessment');
        if (!model || !model.isTrained()) {
            return { riskLevel: 'medium', confidence: 0.1 };
        }
        
        const features = this.extractRiskFeatures(action, context);
        const prediction = model.predict(features);
        
        return {
            riskLevel: prediction.level,
            riskScore: prediction.score,
            confidence: prediction.confidence,
            mitigations: prediction.mitigations
        };
    }

    // 性能预测
    async predictPerformance(settings, context) {
        const model = this.models.get('performance_prediction');
        if (!model || !model.isTrained()) {
            return { expectedPerformance: 0.5, confidence: 0.1 };
        }
        
        const features = this.extractPerformanceFeatures(settings, context);
        const prediction = model.predict(features);
        
        return {
            expectedPerformance: prediction.value,
            confidence: prediction.confidence,
            bottlenecks: prediction.bottlenecks,
            optimizations: prediction.optimizations
        };
    }

    // 提取特征
    extractFeatures(context, modelType) {
        const baseFeatures = {
            hour: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
            isWeekend: [0, 6].includes(new Date().getDay()),
            recentActivity: context.recentActivity || 0,
            errorRate: context.errorRate || 0,
            responseTime: context.responseTime || 1000
        };
        
        switch (modelType) {
            case 'success_prediction':
                return {
                    ...baseFeatures,
                    networkQuality: context.networkQuality || 1,
                    serverLoad: context.serverLoad || 0.5,
                    userOnlineCount: context.userOnlineCount || 1000,
                    previousSuccessRate: context.previousSuccessRate || 0.5
                };
                
            case 'optimal_timing':
                return {
                    ...baseFeatures,
                    userActivityPattern: context.userActivityPattern || [],
                    serverPerformance: context.serverPerformance || 1,
                    competitionLevel: context.competitionLevel || 0.5
                };
                
            default:
                return baseFeatures;
        }
    }

    // 提取用户特征
    extractUserFeatures(userId, context) {
        const userHistory = context.userHistory?.[userId] || {};
        
        return {
            userId: this.hashUserId(userId),
            avgResponseTime: userHistory.avgResponseTime || 3600,
            engagementRate: userHistory.engagementRate || 0.5,
            lastActiveTime: userHistory.lastActiveTime || 0,
            interactionCount: userHistory.interactionCount || 0,
            preferredContentTypes: userHistory.preferredContentTypes || [],
            timeZone: userHistory.timeZone || 8,
            deviceType: userHistory.deviceType || 'unknown'
        };
    }

    // 提取内容特征
    extractContentFeatures(content) {
        return {
            length: content.text?.length || 0,
            hasImages: (content.images?.length || 0) > 0,
            hasVideo: (content.videos?.length || 0) > 0,
            hasLinks: (content.links?.length || 0) > 0,
            sentiment: this.analyzeSentiment(content.text || ''),
            keywords: this.extractKeywords(content.text || ''),
            readability: this.calculateReadability(content.text || ''),
            timestamp: content.timestamp || new Date().toISOString(),
            authorPopularity: content.authorPopularity || 0.5
        };
    }

    // 提取风险特征
    extractRiskFeatures(action, context) {
        return {
            actionType: action.type,
            frequency: action.frequency || 1,
            timeInterval: action.timeInterval || 1000,
            batchSize: action.batchSize || 1,
            recentErrors: context.recentErrors || 0,
            accountAge: context.accountAge || 365,
            previousViolations: context.previousViolations || 0,
            networkStability: context.networkStability || 1,
            deviceFingerprint: context.deviceFingerprint || 'unknown'
        };
    }

    // 提取性能特征
    extractPerformanceFeatures(settings, context) {
        return {
            delayMin: settings.likeDelay?.min || 2000,
            delayMax: settings.likeDelay?.max || 5000,
            batchSize: settings.advanced?.batchSize || 10,
            concurrency: settings.advanced?.concurrency || 1,
            memoryUsage: context.memoryUsage || 0.5,
            cpuUsage: context.cpuUsage || 0.5,
            networkLatency: context.networkLatency || 100,
            cacheHitRate: context.cacheHitRate || 0.8
        };
    }

    // 情感分析
    analyzeSentiment(text) {
        // 简单的情感分析实现
        const positiveWords = ['好', '棒', '赞', '喜欢', '开心', '快乐', '美好', '精彩'];
        const negativeWords = ['坏', '差', '讨厌', '难过', '失望', '糟糕', '无聊'];
        
        let score = 0;
        const words = text.split(/\s+/);
        
        words.forEach(word => {
            if (positiveWords.some(pw => word.includes(pw))) score += 1;
            if (negativeWords.some(nw => word.includes(nw))) score -= 1;
        });
        
        return Math.max(-1, Math.min(1, score / words.length));
    }

    // 关键词提取
    extractKeywords(text) {
        // 简单的关键词提取
        const words = text.split(/\s+/).filter(word => word.length > 2);
        const frequency = {};
        
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        
        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }

    // 可读性计算
    calculateReadability(text) {
        const sentences = text.split(/[。！？]/).length;
        const words = text.split(/\s+/).length;
        const avgWordsPerSentence = words / Math.max(1, sentences);
        
        // 简化的可读性评分
        return Math.max(0, Math.min(1, 1 - (avgWordsPerSentence - 10) / 20));
    }

    // 用户ID哈希
    hashUserId(userId) {
        // 简单的哈希函数，保护用户隐私
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash);
    }

    // 增量学习
    incrementalLearning(sample) {
        // 为每个模型更新
        this.models.forEach((model, name) => {
            if (model.supportsIncrementalLearning && model.supportsIncrementalLearning()) {
                try {
                    model.incrementalUpdate(sample);
                } catch (error) {
                    console.error(`Incremental learning failed for model ${name}:`, error);
                }
            }
        });
    }

    // 开始持续学习
    startContinuousLearning() {
        // 每小时重新训练模型
        setInterval(() => {
            this.retrainModels();
        }, 60 * 60 * 1000);
        
        // 每天评估模型性能
        setInterval(() => {
            this.evaluateModels();
        }, 24 * 60 * 60 * 1000);
    }

    // 重新训练模型
    async retrainModels() {
        if (this.trainingData.length < 50) {
            return; // 数据不足，跳过训练
        }
        
        console.log('Starting model retraining...');
        
        for (const [name, model] of this.models) {
            try {
                const relevantData = this.filterDataForModel(name);
                if (relevantData.length >= 20) {
                    await model.train(relevantData);
                    console.log(`Model ${name} retrained with ${relevantData.length} samples`);
                }
            } catch (error) {
                console.error(`Failed to retrain model ${name}:`, error);
            }
        }
    }

    // 为特定模型过滤数据
    filterDataForModel(modelName) {
        return this.trainingData.filter(sample => {
            switch (modelName) {
                case 'success_prediction':
                    return sample.action === 'like' && sample.result.hasOwnProperty('success');
                case 'optimal_timing':
                    return sample.context.hasOwnProperty('hour') && sample.result.hasOwnProperty('engagement');
                case 'user_behavior':
                    return sample.context.hasOwnProperty('userId') && sample.result.hasOwnProperty('userResponse');
                case 'content_quality':
                    return sample.context.hasOwnProperty('content') && sample.result.hasOwnProperty('engagement');
                case 'risk_assessment':
                    return sample.result.hasOwnProperty('violation') || sample.result.hasOwnProperty('blocked');
                case 'performance_prediction':
                    return sample.result.hasOwnProperty('responseTime') || sample.result.hasOwnProperty('memoryUsage');
                default:
                    return true;
            }
        });
    }

    // 评估模型性能
    async evaluateModels() {
        console.log('Evaluating model performance...');
        
        for (const [name, model] of this.models) {
            try {
                const testData = this.getTestData(name);
                if (testData.length >= 10) {
                    const accuracy = await this.calculateModelAccuracy(model, testData);
                    this.modelAccuracy.set(name, accuracy);
                    console.log(`Model ${name} accuracy: ${(accuracy * 100).toFixed(2)}%`);
                }
            } catch (error) {
                console.error(`Failed to evaluate model ${name}:`, error);
            }
        }
    }

    // 获取测试数据
    getTestData(modelName) {
        const relevantData = this.filterDataForModel(modelName);
        // 使用最近20%的数据作为测试集
        const testSize = Math.floor(relevantData.length * 0.2);
        return relevantData.slice(-testSize);
    }

    // 计算模型准确率
    async calculateModelAccuracy(model, testData) {
        let correct = 0;
        let total = 0;
        
        for (const sample of testData) {
            try {
                const features = this.extractFeatures(sample.context, model.name);
                const prediction = model.predict(features);
                const actual = sample.result;
                
                if (this.isPredictionCorrect(prediction, actual)) {
                    correct++;
                }
                total++;
            } catch (error) {
                console.error('Error in accuracy calculation:', error);
            }
        }
        
        return total > 0 ? correct / total : 0;
    }

    // 判断预测是否正确
    isPredictionCorrect(prediction, actual) {
        // 简化的准确性判断
        if (typeof prediction.value === 'number' && typeof actual.value === 'number') {
            const error = Math.abs(prediction.value - actual.value);
            return error < 0.1; // 10%的误差范围内认为正确
        }
        
        if (typeof prediction.value === 'string' && typeof actual.value === 'string') {
            return prediction.value === actual.value;
        }
        
        return false;
    }

    // 生成默认训练数据
    generateDefaultTrainingData() {
        const data = [];
        const hours = Array.from({length: 24}, (_, i) => i);
        const days = Array.from({length: 7}, (_, i) => i);
        
        // 生成模拟数据
        for (let i = 0; i < 200; i++) {
            const hour = hours[Math.floor(Math.random() * hours.length)];
            const day = days[Math.floor(Math.random() * days.length)];
            const isWeekend = [0, 6].includes(day);
            
            // 模拟成功率数据
            let successRate = 0.5;
            if (hour >= 9 && hour <= 11) successRate += 0.2; // 上午活跃
            if (hour >= 19 && hour <= 22) successRate += 0.3; // 晚上活跃
            if (isWeekend) successRate += 0.1; // 周末更活跃
            
            successRate = Math.max(0, Math.min(1, successRate + (Math.random() - 0.5) * 0.2));
            
            data.push({
                action: 'like',
                context: {
                    hour,
                    dayOfWeek: day,
                    isWeekend,
                    recentActivity: Math.random(),
                    errorRate: Math.random() * 0.1,
                    responseTime: 1000 + Math.random() * 2000
                },
                result: {
                    success: Math.random() < successRate,
                    value: successRate,
                    responseTime: 1000 + Math.random() * 2000
                },
                features: {
                    hour,
                    day,
                    isWeekend,
                    activity: Math.random()
                },
                timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
        
        return data;
    }

    // 获取模型状态
    getModelStatus() {
        const status = {};
        
        this.models.forEach((model, name) => {
            status[name] = {
                trained: model.isTrained ? model.isTrained() : false,
                accuracy: this.modelAccuracy.get(name) || 0,
                lastUpdate: model.lastUpdate || null,
                sampleCount: model.sampleCount || 0
            };
        });
        
        return status;
    }

    // 导出模型数据
    async exportModelData() {
        const data = {
            trainingData: this.trainingData,
            modelAccuracy: Object.fromEntries(this.modelAccuracy),
            modelStatus: this.getModelStatus(),
            exportTime: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
    }

    // 导入模型数据
    async importModelData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.trainingData) {
                this.trainingData = data.trainingData;
                await this.saveTrainingData();
            }
            
            if (data.modelAccuracy) {
                this.modelAccuracy = new Map(Object.entries(data.modelAccuracy));
            }
            
            // 重新训练模型
            await this.retrainModels();
            
            return { success: true, message: '模型数据导入成功' };
        } catch (error) {
            console.error('Failed to import model data:', error);
            return { success: false, error: error.message };
        }
    }
}

// 基础模型类
class BaseModel {
    constructor(name) {
        this.name = name;
        this.trained = false;
        this.lastUpdate = null;
        this.sampleCount = 0;
    }

    isTrained() {
        return this.trained;
    }

    async train(data) {
        this.sampleCount = data.length;
        this.lastUpdate = new Date().toISOString();
        this.trained = true;
    }

    predict(features) {
        if (!this.trained) {
            throw new Error('Model not trained');
        }
        return { value: 0.5, confidence: 0.1 };
    }

    supportsIncrementalLearning() {
        return false;
    }
}

// 成功率预测模型
class SuccessPredictionModel extends BaseModel {
    constructor() {
        super('success_prediction');
        this.weights = {};
        this.bias = 0;
    }

    async train(data) {
        await super.train(data);
        
        // 简单的线性回归实现
        const features = data.map(d => this.extractFeatures(d));
        const targets = data.map(d => d.result.success ? 1 : 0);
        
        this.weights = this.trainLinearRegression(features, targets);
    }

    predict(features) {
        if (!this.trained) {
            return super.predict(features);
        }
        
        let prediction = this.bias;
        for (const [key, value] of Object.entries(features)) {
            if (this.weights[key]) {
                prediction += this.weights[key] * value;
            }
        }
        
        // Sigmoid激活函数
        const probability = 1 / (1 + Math.exp(-prediction));
        
        return {
            value: probability,
            confidence: Math.min(0.9, 0.5 + Math.abs(prediction) * 0.1),
            factors: this.getImportantFactors(features)
        };
    }

    extractFeatures(sample) {
        return {
            hour: sample.context.hour / 24,
            isWeekend: sample.context.isWeekend ? 1 : 0,
            recentActivity: sample.context.recentActivity || 0,
            errorRate: sample.context.errorRate || 0,
            responseTime: Math.min(1, (sample.context.responseTime || 1000) / 5000)
        };
    }

    trainLinearRegression(features, targets) {
        const weights = {};
        const learningRate = 0.01;
        const epochs = 100;
        
        // 初始化权重
        if (features.length > 0) {
            for (const key of Object.keys(features[0])) {
                weights[key] = Math.random() * 0.1;
            }
        }
        
        // 梯度下降
        for (let epoch = 0; epoch < epochs; epoch++) {
            for (let i = 0; i < features.length; i++) {
                const feature = features[i];
                const target = targets[i];
                
                let prediction = this.bias;
                for (const [key, value] of Object.entries(feature)) {
                    prediction += weights[key] * value;
                }
                
                const error = target - prediction;
                
                // 更新权重
                for (const [key, value] of Object.entries(feature)) {
                    weights[key] += learningRate * error * value;
                }
                this.bias += learningRate * error;
            }
        }
        
        return weights;
    }

    getImportantFactors(features) {
        const factors = [];
        for (const [key, weight] of Object.entries(this.weights)) {
            if (Math.abs(weight) > 0.1) {
                factors.push({
                    factor: key,
                    importance: Math.abs(weight),
                    value: features[key]
                });
            }
        }
        return factors.sort((a, b) => b.importance - a.importance).slice(0, 3);
    }

    supportsIncrementalLearning() {
        return true;
    }

    incrementalUpdate(sample) {
        if (!this.trained) return;
        
        const features = this.extractFeatures(sample);
        const target = sample.result.success ? 1 : 0;
        const learningRate = 0.001;
        
        let prediction = this.bias;
        for (const [key, value] of Object.entries(features)) {
            if (this.weights[key]) {
                prediction += this.weights[key] * value;
            }
        }
        
        const error = target - prediction;
        
        // 更新权重
        for (const [key, value] of Object.entries(features)) {
            if (this.weights[key]) {
                this.weights[key] += learningRate * error * value;
            }
        }
        this.bias += learningRate * error;
    }
}

// 最佳时间预测模型
class OptimalTimingModel extends BaseModel {
    constructor() {
        super('optimal_timing');
        this.hourlyStats = new Array(24).fill(0).map(() => ({ count: 0, successSum: 0 }));
    }

    async train(data) {
        await super.train(data);
        
        // 重置统计
        this.hourlyStats = new Array(24).fill(0).map(() => ({ count: 0, successSum: 0 }));
        
        // 统计每小时的成功率
        data.forEach(sample => {
            const hour = sample.context.hour;
            const success = sample.result.engagement || sample.result.success || 0;
            
            if (hour >= 0 && hour < 24) {
                this.hourlyStats[hour].count++;
                this.hourlyStats[hour].successSum += success;
            }
        });
    }

    predict(features) {
        if (!this.trained) {
            return super.predict(features);
        }
        
        // 找到成功率最高的小时
        let bestHour = 0;
        let bestRate = 0;
        
        this.hourlyStats.forEach((stat, hour) => {
            if (stat.count > 0) {
                const rate = stat.successSum / stat.count;
                if (rate > bestRate) {
                    bestRate = rate;
                    bestHour = hour;
                }
            }
        });
        
        const confidence = this.hourlyStats[bestHour].count > 5 ? 0.8 : 0.3;
        
        return {
            value: bestHour,
            confidence,
            reasoning: `基于${this.hourlyStats[bestHour].count}次历史数据，${bestHour}点的成功率最高(${(bestRate * 100).toFixed(1)}%)`
        };
    }
}

// 用户行为预测模型
class UserBehaviorModel extends BaseModel {
    constructor() {
        super('user_behavior');
        this.userProfiles = new Map();
    }

    async train(data) {
        await super.train(data);
        
        // 构建用户画像
        data.forEach(sample => {
            if (sample.context.userId) {
                const userId = sample.context.userId;
                if (!this.userProfiles.has(userId)) {
                    this.userProfiles.set(userId, {
                        interactions: [],
                        avgEngagement: 0,
                        avgResponseTime: 0,
                        preferredHours: []
                    });
                }
                
                const profile = this.userProfiles.get(userId);
                profile.interactions.push({
                    hour: sample.context.hour,
                    engagement: sample.result.userResponse?.engagement || 0,
                    responseTime: sample.result.userResponse?.responseTime || 3600
                });
            }
        });
        
        // 计算统计信息
        this.userProfiles.forEach(profile => {
            if (profile.interactions.length > 0) {
                profile.avgEngagement = profile.interactions.reduce((sum, i) => sum + i.engagement, 0) / profile.interactions.length;
                profile.avgResponseTime = profile.interactions.reduce((sum, i) => sum + i.responseTime, 0) / profile.interactions.length;
                
                // 找出偏好时间
                const hourCounts = {};
                profile.interactions.forEach(i => {
                    hourCounts[i.hour] = (hourCounts[i.hour] || 0) + 1;
                });
                profile.preferredHours = Object.entries(hourCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([hour]) => parseInt(hour));
            }
        });
    }

    predict(features) {
        if (!this.trained) {
            return super.predict(features);
        }
        
        const userId = features.userId;
        const profile = this.userProfiles.get(userId);
        
        if (profile) {
            return {
                engagement: profile.avgEngagement,
                responseTime: profile.avgResponseTime,
                interactionType: this.predictInteractionType(profile),
                confidence: Math.min(0.9, profile.interactions.length / 10)
            };
        }
        
        // 默认预测
        return {
            engagement: 0.5,
            responseTime: 3600,
            interactionType: 'unknown',
            confidence: 0.1
        };
    }

    predictInteractionType(profile) {
        if (profile.avgEngagement > 0.7) return 'high_engagement';
        if (profile.avgEngagement > 0.3) return 'medium_engagement';
        return 'low_engagement';
    }
}

// 内容质量评估模型
class ContentQualityModel extends BaseModel {
    constructor() {
        super('content_quality');
        this.qualityFactors = {};
    }

    async train(data) {
        await super.train(data);
        
        // 分析内容特征与质量的关系
        const features = ['length', 'hasImages', 'hasVideo', 'sentiment', 'readability'];
        this.qualityFactors = {};
        
        features.forEach(feature => {
            const values = data.map(d => d.context.content?.[feature] || 0);
            const qualities = data.map(d => d.result.engagement || 0);
            
            this.qualityFactors[feature] = this.calculateCorrelation(values, qualities);
        });
    }

    predict(features) {
        if (!this.trained) {
            return super.predict(features);
        }
        
        let score = 0.5;
        const factors = [];
        
        for (const [factor, correlation] of Object.entries(this.qualityFactors)) {
            if (features[factor] !== undefined) {
                const contribution = correlation * features[factor];
                score += contribution * 0.1;
                factors.push({ factor, contribution: Math.abs(contribution) });
            }
        }
        
        score = Math.max(0, Math.min(1, score));
        
        return {
            value: score,
            confidence: 0.6,
            factors: factors.sort((a, b) => b.contribution - a.contribution).slice(0, 3),
            suggestions: this.generateSuggestions(features, score)
        };
    }

    calculateCorrelation(x, y) {
        if (x.length !== y.length || x.length === 0) return 0;
        
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    }

    generateSuggestions(features, score) {
        const suggestions = [];
        
        if (score < 0.5) {
            if (features.length < 50) suggestions.push('内容过短，建议增加详细描述');
            if (!features.hasImages) suggestions.push('添加图片可以提高吸引力');
            if (features.sentiment < 0) suggestions.push('使用更积极正面的表达');
            if (features.readability < 0.5) suggestions.push('简化语言，提高可读性');
        }
        
        return suggestions;
    }
}

// 风险评估模型
class RiskAssessmentModel extends BaseModel {
    constructor() {
        super('risk_assessment');
        this.riskThresholds = {
            frequency: 10, // 每分钟操作次数
            timeInterval: 1000, // 最小时间间隔
            errorRate: 0.1, // 错误率阈值
            batchSize: 20 // 批处理大小
        };
    }

    predict(features) {
        let riskScore = 0;
        const mitigations = [];
        
        // 频率风险
        if (features.frequency > this.riskThresholds.frequency) {
            riskScore += 0.3;
            mitigations.push('降低操作频率');
        }
        
        // 时间间隔风险
        if (features.timeInterval < this.riskThresholds.timeInterval) {
            riskScore += 0.2;
            mitigations.push('增加操作间隔');
        }
        
        // 错误率风险
        if (features.recentErrors > this.riskThresholds.errorRate) {
            riskScore += 0.3;
            mitigations.push('检查网络连接和设置');
        }
        
        // 批处理风险
        if (features.batchSize > this.riskThresholds.batchSize) {
            riskScore += 0.2;
            mitigations.push('减少批处理大小');
        }
        
        let level = 'low';
        if (riskScore > 0.7) level = 'high';
        else if (riskScore > 0.4) level = 'medium';
        
        return {
            level,
            score: riskScore,
            confidence: 0.8,
            mitigations
        };
    }
}

// 性能预测模型
class PerformancePredictionModel extends BaseModel {
    constructor() {
        super('performance_prediction');
        this.performanceBaseline = {
            responseTime: 2000,
            memoryUsage: 0.3,
            cpuUsage: 0.2
        };
    }

    predict(features) {
        let performance = 1.0;
        const bottlenecks = [];
        const optimizations = [];
        
        // 延迟影响
        const avgDelay = (features.delayMin + features.delayMax) / 2;
        if (avgDelay < 1000) {
            performance -= 0.2;
            bottlenecks.push('延迟过短可能导致限制');
            optimizations.push('增加操作延迟');
        }
        
        // 并发影响
        if (features.concurrency > 3) {
            performance -= 0.3;
            bottlenecks.push('并发过高影响稳定性');
            optimizations.push('降低并发数');
        }
        
        // 资源使用影响
        if (features.memoryUsage > 0.8) {
            performance -= 0.2;
            bottlenecks.push('内存使用过高');
            optimizations.push('清理缓存');
        }
        
        if (features.cpuUsage > 0.8) {
            performance -= 0.2;
            bottlenecks.push('CPU使用过高');
            optimizations.push('降低处理强度');
        }
        
        // 网络影响
        if (features.networkLatency > 500) {
            performance -= 0.1;
            bottlenecks.push('网络延迟较高');
            optimizations.push('优化网络连接');
        }
        
        performance = Math.max(0, Math.min(1, performance));
        
        return {
            value: performance,
            confidence: 0.7,
            bottlenecks,
            optimizations
        };
    }
}

// 导出机器学习引擎
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLEngine;
} else if (typeof window !== 'undefined') {
    window.MLEngine = MLEngine;
}