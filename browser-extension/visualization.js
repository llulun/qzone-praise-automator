// QZone Praise Automator Pro - Data Visualization

class DataVisualization {
    constructor(container) {
        this.container = container;
        this.charts = new Map();
        this.themes = {
            light: {
                background: '#ffffff',
                text: '#333333',
                primary: '#4CAF50',
                secondary: '#2196F3',
                accent: '#FF9800',
                grid: '#e0e0e0',
                success: '#4CAF50',
                warning: '#FF9800',
                error: '#f44336'
            },
            dark: {
                background: '#1a1a1a',
                text: '#ffffff',
                primary: '#66BB6A',
                secondary: '#42A5F5',
                accent: '#FFB74D',
                grid: '#333333',
                success: '#66BB6A',
                warning: '#FFB74D',
                error: '#EF5350'
            }
        };
        this.currentTheme = 'light';
        
        this.init();
    }

    init() {
        this.createContainer();
        this.bindEvents();
    }

    createContainer() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="visualization-container">
                <div class="visualization-header">
                    <h2>数据分析面板</h2>
                    <div class="visualization-controls">
                        <select id="timeRange" class="control-select">
                            <option value="today">今天</option>
                            <option value="week">本周</option>
                            <option value="month">本月</option>
                            <option value="quarter">本季度</option>
                            <option value="year">本年</option>
                        </select>
                        <button id="refreshData" class="control-btn">刷新</button>
                        <button id="exportData" class="control-btn">导出</button>
                        <button id="toggleTheme" class="control-btn">切换主题</button>
                    </div>
                </div>
                
                <div class="visualization-grid">
                    <!-- 概览卡片 -->
                    <div class="overview-cards">
                        <div class="overview-card" id="totalLikes">
                            <div class="card-icon">👍</div>
                            <div class="card-content">
                                <div class="card-value">0</div>
                                <div class="card-label">总点赞数</div>
                                <div class="card-trend">+0%</div>
                            </div>
                        </div>
                        
                        <div class="overview-card" id="successRate">
                            <div class="card-icon">✅</div>
                            <div class="card-content">
                                <div class="card-value">0%</div>
                                <div class="card-label">成功率</div>
                                <div class="card-trend">+0%</div>
                            </div>
                        </div>
                        
                        <div class="overview-card" id="avgResponseTime">
                            <div class="card-icon">⏱️</div>
                            <div class="card-content">
                                <div class="card-value">0ms</div>
                                <div class="card-label">平均响应时间</div>
                                <div class="card-trend">+0%</div>
                            </div>
                        </div>
                        
                        <div class="overview-card" id="activeHours">
                            <div class="card-icon">🕐</div>
                            <div class="card-content">
                                <div class="card-value">0h</div>
                                <div class="card-label">活跃时长</div>
                                <div class="card-trend">+0%</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 主要图表区域 -->
                    <div class="chart-container large" id="activityChart">
                        <div class="chart-header">
                            <h3>活动趋势</h3>
                            <div class="chart-controls">
                                <button class="chart-type-btn active" data-type="line">线图</button>
                                <button class="chart-type-btn" data-type="bar">柱图</button>
                                <button class="chart-type-btn" data-type="area">面积图</button>
                            </div>
                        </div>
                        <canvas id="activityCanvas"></canvas>
                    </div>
                    
                    <div class="chart-container medium" id="successRateChart">
                        <div class="chart-header">
                            <h3>成功率分析</h3>
                        </div>
                        <canvas id="successRateCanvas"></canvas>
                    </div>
                    
                    <div class="chart-container medium" id="hourlyDistribution">
                        <div class="chart-header">
                            <h3>时段分布</h3>
                        </div>
                        <canvas id="hourlyCanvas"></canvas>
                    </div>
                    
                    <div class="chart-container medium" id="performanceMetrics">
                        <div class="chart-header">
                            <h3>性能指标</h3>
                        </div>
                        <canvas id="performanceCanvas"></canvas>
                    </div>
                    
                    <div class="chart-container medium" id="userEngagement">
                        <div class="chart-header">
                            <h3>用户互动</h3>
                        </div>
                        <canvas id="engagementCanvas"></canvas>
                    </div>
                    
                    <!-- 热力图 -->
                    <div class="chart-container large" id="heatmapChart">
                        <div class="chart-header">
                            <h3>活动热力图</h3>
                            <div class="heatmap-legend">
                                <span class="legend-label">低</span>
                                <div class="legend-gradient"></div>
                                <span class="legend-label">高</span>
                            </div>
                        </div>
                        <div id="heatmapContainer"></div>
                    </div>
                    
                    <!-- 详细统计表格 -->
                    <div class="chart-container full" id="detailsTable">
                        <div class="chart-header">
                            <h3>详细统计</h3>
                            <div class="table-controls">
                                <input type="text" id="tableSearch" placeholder="搜索..." class="table-search">
                                <select id="tableSort" class="table-sort">
                                    <option value="time">按时间排序</option>
                                    <option value="success">按成功率排序</option>
                                    <option value="count">按数量排序</option>
                                </select>
                            </div>
                        </div>
                        <div class="table-container">
                            <table id="statisticsTable">
                                <thead>
                                    <tr>
                                        <th>时间</th>
                                        <th>操作数</th>
                                        <th>成功数</th>
                                        <th>成功率</th>
                                        <th>平均响应时间</th>
                                        <th>错误数</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .visualization-container {
                padding: 20px;
                background: var(--bg-color, #f5f5f5);
                min-height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .visualization-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding: 20px;
                background: var(--card-bg, white);
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .visualization-header h2 {
                margin: 0;
                color: var(--text-color, #333);
                font-size: 24px;
                font-weight: 600;
            }
            
            .visualization-controls {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .control-select, .control-btn {
                padding: 8px 16px;
                border: 1px solid var(--border-color, #ddd);
                border-radius: 6px;
                background: var(--input-bg, white);
                color: var(--text-color, #333);
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .control-btn:hover {
                background: var(--primary-color, #4CAF50);
                color: white;
                border-color: var(--primary-color, #4CAF50);
            }
            
            .visualization-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                grid-auto-rows: min-content;
            }
            
            .overview-cards {
                grid-column: 1 / -1;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .overview-card {
                background: var(--card-bg, white);
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 16px;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .overview-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            }
            
            .card-icon {
                font-size: 32px;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--primary-light, #E8F5E8);
                border-radius: 12px;
            }
            
            .card-content {
                flex: 1;
            }
            
            .card-value {
                font-size: 28px;
                font-weight: 700;
                color: var(--text-color, #333);
                margin-bottom: 4px;
            }
            
            .card-label {
                font-size: 14px;
                color: var(--text-secondary, #666);
                margin-bottom: 8px;
            }
            
            .card-trend {
                font-size: 12px;
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 4px;
                display: inline-block;
            }
            
            .card-trend.positive {
                background: var(--success-light, #E8F5E8);
                color: var(--success-color, #4CAF50);
            }
            
            .card-trend.negative {
                background: var(--error-light, #FFEBEE);
                color: var(--error-color, #f44336);
            }
            
            .chart-container {
                background: var(--card-bg, white);
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                position: relative;
            }
            
            .chart-container.large {
                grid-column: span 2;
                min-height: 400px;
            }
            
            .chart-container.medium {
                min-height: 300px;
            }
            
            .chart-container.full {
                grid-column: 1 / -1;
            }
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--border-color, #eee);
            }
            
            .chart-header h3 {
                margin: 0;
                color: var(--text-color, #333);
                font-size: 18px;
                font-weight: 600;
            }
            
            .chart-controls {
                display: flex;
                gap: 8px;
            }
            
            .chart-type-btn {
                padding: 6px 12px;
                border: 1px solid var(--border-color, #ddd);
                border-radius: 4px;
                background: var(--input-bg, white);
                color: var(--text-color, #333);
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .chart-type-btn.active,
            .chart-type-btn:hover {
                background: var(--primary-color, #4CAF50);
                color: white;
                border-color: var(--primary-color, #4CAF50);
            }
            
            canvas {
                width: 100% !important;
                height: 250px !important;
            }
            
            .heatmap-legend {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: var(--text-secondary, #666);
            }
            
            .legend-gradient {
                width: 100px;
                height: 12px;
                background: linear-gradient(to right, #E3F2FD, #1976D2);
                border-radius: 6px;
            }
            
            #heatmapContainer {
                height: 300px;
                overflow: auto;
            }
            
            .heatmap-grid {
                display: grid;
                grid-template-columns: repeat(24, 1fr);
                gap: 2px;
                margin: 20px 0;
            }
            
            .heatmap-cell {
                aspect-ratio: 1;
                border-radius: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: white;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            
            .heatmap-cell:hover {
                transform: scale(1.1);
                z-index: 10;
                position: relative;
            }
            
            .heatmap-labels {
                display: grid;
                grid-template-columns: repeat(24, 1fr);
                gap: 2px;
                margin-bottom: 10px;
                font-size: 10px;
                color: var(--text-secondary, #666);
                text-align: center;
            }
            
            .table-container {
                overflow-x: auto;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .table-controls {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .table-search, .table-sort {
                padding: 6px 12px;
                border: 1px solid var(--border-color, #ddd);
                border-radius: 4px;
                background: var(--input-bg, white);
                color: var(--text-color, #333);
                font-size: 14px;
            }
            
            #statisticsTable {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }
            
            #statisticsTable th,
            #statisticsTable td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid var(--border-color, #eee);
            }
            
            #statisticsTable th {
                background: var(--bg-secondary, #f8f9fa);
                font-weight: 600;
                color: var(--text-color, #333);
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            #statisticsTable tr:hover {
                background: var(--hover-bg, #f5f5f5);
            }
            
            /* 深色主题 */
            .dark-theme {
                --bg-color: #1a1a1a;
                --card-bg: #2d2d2d;
                --text-color: #ffffff;
                --text-secondary: #b0b0b0;
                --border-color: #404040;
                --input-bg: #3d3d3d;
                --primary-color: #66BB6A;
                --primary-light: #2d4a2f;
                --success-color: #66BB6A;
                --success-light: #2d4a2f;
                --error-color: #EF5350;
                --error-light: #4a2d2d;
                --bg-secondary: #3d3d3d;
                --hover-bg: #404040;
            }
            
            /* 响应式设计 */
            @media (max-width: 768px) {
                .visualization-grid {
                    grid-template-columns: 1fr;
                }
                
                .chart-container.large {
                    grid-column: span 1;
                }
                
                .overview-cards {
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                }
                
                .visualization-header {
                    flex-direction: column;
                    gap: 15px;
                    align-items: stretch;
                }
                
                .visualization-controls {
                    justify-content: center;
                    flex-wrap: wrap;
                }
            }
            
            /* 动画效果 */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .chart-container {
                animation: fadeIn 0.5s ease-out;
            }
            
            .overview-card {
                animation: fadeIn 0.5s ease-out;
            }
            
            /* 加载状态 */
            .loading {
                position: relative;
                overflow: hidden;
            }
            
            .loading::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                animation: loading 1.5s infinite;
            }
            
            @keyframes loading {
                0% { left: -100%; }
                100% { left: 100%; }
            }
        `;
        
        document.head.appendChild(style);
    }

    bindEvents() {
        // 时间范围选择
        const timeRange = document.getElementById('timeRange');
        if (timeRange) {
            timeRange.addEventListener('change', (e) => {
                this.updateTimeRange(e.target.value);
            });
        }
        
        // 刷新数据
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }
        
        // 导出数据
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // 切换主题
        const themeBtn = document.getElementById('toggleTheme');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // 图表类型切换
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chart-type-btn')) {
                const container = e.target.closest('.chart-container');
                const chartType = e.target.dataset.type;
                this.changeChartType(container.id, chartType);
                
                // 更新按钮状态
                container.querySelectorAll('.chart-type-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });
        
        // 表格搜索
        const tableSearch = document.getElementById('tableSearch');
        if (tableSearch) {
            tableSearch.addEventListener('input', (e) => {
                this.filterTable(e.target.value);
            });
        }
        
        // 表格排序
        const tableSort = document.getElementById('tableSort');
        if (tableSort) {
            tableSort.addEventListener('change', (e) => {
                this.sortTable(e.target.value);
            });
        }
    }

    // 更新时间范围
    updateTimeRange(range) {
        this.currentTimeRange = range;
        this.refreshData();
    }

    // 刷新数据
    async refreshData() {
        this.showLoading();
        
        try {
            // 获取数据
            const data = await this.fetchData();
            
            // 更新概览卡片
            this.updateOverviewCards(data.overview);
            
            // 更新图表
            this.updateActivityChart(data.activity);
            this.updateSuccessRateChart(data.successRate);
            this.updateHourlyDistribution(data.hourly);
            this.updatePerformanceMetrics(data.performance);
            this.updateUserEngagement(data.engagement);
            this.updateHeatmap(data.heatmap);
            this.updateDetailsTable(data.details);
            
        } catch (error) {
            console.error('Failed to refresh data:', error);
            this.showError('数据加载失败');
        } finally {
            this.hideLoading();
        }
    }

    // 获取数据
    async fetchData() {
        // 模拟数据获取
        const timeRange = this.currentTimeRange || 'today';
        
        // 这里应该从实际的数据源获取数据
        // 现在使用模拟数据
        return this.generateMockData(timeRange);
    }

    // 生成模拟数据
    generateMockData(timeRange) {
        const now = new Date();
        const data = {
            overview: {
                totalLikes: Math.floor(Math.random() * 1000) + 500,
                successRate: Math.random() * 0.3 + 0.7,
                avgResponseTime: Math.floor(Math.random() * 1000) + 1000,
                activeHours: Math.floor(Math.random() * 8) + 4
            },
            activity: [],
            successRate: [],
            hourly: [],
            performance: [],
            engagement: [],
            heatmap: [],
            details: []
        };
        
        // 生成活动趋势数据
        const days = this.getTimeRangeDays(timeRange);
        for (let i = 0; i < days; i++) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            data.activity.push({
                date: date.toISOString().split('T')[0],
                likes: Math.floor(Math.random() * 100) + 20,
                success: Math.floor(Math.random() * 80) + 15
            });
        }
        
        // 生成成功率数据
        for (let i = 0; i < 24; i++) {
            data.successRate.push({
                hour: i,
                rate: Math.random() * 0.4 + 0.6
            });
        }
        
        // 生成时段分布数据
        for (let i = 0; i < 24; i++) {
            data.hourly.push({
                hour: i,
                count: Math.floor(Math.random() * 50) + 5
            });
        }
        
        // 生成性能数据
        const metrics = ['responseTime', 'memoryUsage', 'cpuUsage', 'networkLatency'];
        metrics.forEach(metric => {
            data.performance.push({
                metric,
                value: Math.random() * 100,
                trend: Math.random() > 0.5 ? 'up' : 'down'
            });
        });
        
        // 生成用户互动数据
        const engagementTypes = ['点赞', '评论', '分享', '收藏'];
        engagementTypes.forEach(type => {
            data.engagement.push({
                type,
                count: Math.floor(Math.random() * 200) + 50,
                percentage: Math.random() * 100
            });
        });
        
        // 生成热力图数据
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                data.heatmap.push({
                    day,
                    hour,
                    value: Math.random() * 100
                });
            }
        }
        
        // 生成详细统计数据
        for (let i = 0; i < 20; i++) {
            const date = new Date(now.getTime() - i * 60 * 60 * 1000);
            data.details.push({
                time: date.toLocaleString(),
                operations: Math.floor(Math.random() * 50) + 10,
                success: Math.floor(Math.random() * 45) + 8,
                successRate: Math.random() * 0.3 + 0.7,
                avgResponseTime: Math.floor(Math.random() * 1000) + 500,
                errors: Math.floor(Math.random() * 5)
            });
        }
        
        return data;
    }

    getTimeRangeDays(range) {
        switch (range) {
            case 'today': return 1;
            case 'week': return 7;
            case 'month': return 30;
            case 'quarter': return 90;
            case 'year': return 365;
            default: return 7;
        }
    }

    // 更新概览卡片
    updateOverviewCards(data) {
        const cards = {
            totalLikes: {
                value: data.totalLikes.toLocaleString(),
                trend: '+12%'
            },
            successRate: {
                value: (data.successRate * 100).toFixed(1) + '%',
                trend: '+5%'
            },
            avgResponseTime: {
                value: data.avgResponseTime + 'ms',
                trend: '-8%'
            },
            activeHours: {
                value: data.activeHours + 'h',
                trend: '+15%'
            }
        };
        
        Object.entries(cards).forEach(([id, cardData]) => {
            const card = document.getElementById(id);
            if (card) {
                const valueEl = card.querySelector('.card-value');
                const trendEl = card.querySelector('.card-trend');
                
                if (valueEl) valueEl.textContent = cardData.value;
                if (trendEl) {
                    trendEl.textContent = cardData.trend;
                    trendEl.className = 'card-trend ' + (cardData.trend.startsWith('+') ? 'positive' : 'negative');
                }
            }
        });
    }

    // 更新活动趋势图表
    updateActivityChart(data) {
        const canvas = document.getElementById('activityCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const chart = this.createLineChart(ctx, {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: '点赞数',
                    data: data.map(d => d.likes),
                    borderColor: this.themes[this.currentTheme].primary,
                    backgroundColor: this.themes[this.currentTheme].primary + '20',
                    fill: true
                },
                {
                    label: '成功数',
                    data: data.map(d => d.success),
                    borderColor: this.themes[this.currentTheme].secondary,
                    backgroundColor: this.themes[this.currentTheme].secondary + '20',
                    fill: true
                }
            ]
        });
        
        this.charts.set('activity', chart);
    }

    // 更新成功率图表
    updateSuccessRateChart(data) {
        const canvas = document.getElementById('successRateCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const chart = this.createLineChart(ctx, {
            labels: data.map(d => d.hour + ':00'),
            datasets: [{
                label: '成功率',
                data: data.map(d => d.rate * 100),
                borderColor: this.themes[this.currentTheme].success,
                backgroundColor: this.themes[this.currentTheme].success + '20',
                fill: true
            }]
        });
        
        this.charts.set('successRate', chart);
    }

    // 更新时段分布图表
    updateHourlyDistribution(data) {
        const canvas = document.getElementById('hourlyCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const chart = this.createBarChart(ctx, {
            labels: data.map(d => d.hour + ':00'),
            datasets: [{
                label: '操作次数',
                data: data.map(d => d.count),
                backgroundColor: this.themes[this.currentTheme].accent + '80',
                borderColor: this.themes[this.currentTheme].accent,
                borderWidth: 1
            }]
        });
        
        this.charts.set('hourly', chart);
    }

    // 更新性能指标图表
    updatePerformanceMetrics(data) {
        const canvas = document.getElementById('performanceCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const chart = this.createRadarChart(ctx, {
            labels: data.map(d => d.metric),
            datasets: [{
                label: '性能指标',
                data: data.map(d => d.value),
                backgroundColor: this.themes[this.currentTheme].primary + '20',
                borderColor: this.themes[this.currentTheme].primary,
                borderWidth: 2
            }]
        });
        
        this.charts.set('performance', chart);
    }

    // 更新用户互动图表
    updateUserEngagement(data) {
        const canvas = document.getElementById('engagementCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const chart = this.createDoughnutChart(ctx, {
            labels: data.map(d => d.type),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: [
                    this.themes[this.currentTheme].primary,
                    this.themes[this.currentTheme].secondary,
                    this.themes[this.currentTheme].accent,
                    this.themes[this.currentTheme].success
                ]
            }]
        });
        
        this.charts.set('engagement', chart);
    }

    // 更新热力图
    updateHeatmap(data) {
        const container = document.getElementById('heatmapContainer');
        if (!container) return;
        
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const hours = Array.from({length: 24}, (_, i) => i);
        
        // 创建热力图HTML
        let html = '<div class="heatmap-labels">';
        hours.forEach(hour => {
            html += `<div>${hour}</div>`;
        });
        html += '</div>';
        
        days.forEach((day, dayIndex) => {
            html += `<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">`;
            html += `<div style="width: 60px; font-size: 12px; color: var(--text-secondary, #666);">${day}</div>`;
            html += '<div class="heatmap-grid" style="flex: 1;">';
            
            hours.forEach(hour => {
                const cellData = data.find(d => d.day === dayIndex && d.hour === hour);
                const value = cellData ? cellData.value : 0;
                const intensity = value / 100;
                const color = this.getHeatmapColor(intensity);
                
                html += `<div class="heatmap-cell" 
                    style="background-color: ${color};" 
                    title="${day} ${hour}:00 - ${value.toFixed(0)}次操作"
                    data-value="${value}">
                </div>`;
            });
            
            html += '</div></div>';
        });
        
        container.innerHTML = html;
    }

    // 获取热力图颜色
    getHeatmapColor(intensity) {
        const colors = [
            '#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6',
            '#42A5F5', '#2196F3', '#1E88E5', '#1976D2'
        ];
        const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
        return colors[index];
    }

    // 更新详细统计表格
    updateDetailsTable(data) {
        const tbody = document.querySelector('#statisticsTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.time}</td>
                <td>${row.operations}</td>
                <td>${row.success}</td>
                <td>${(row.successRate * 100).toFixed(1)}%</td>
                <td>${row.avgResponseTime}ms</td>
                <td>${row.errors}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 创建线图
    createLineChart(ctx, data) {
        return this.createChart(ctx, 'line', data);
    }

    // 创建柱状图
    createBarChart(ctx, data) {
        return this.createChart(ctx, 'bar', data);
    }

    // 创建雷达图
    createRadarChart(ctx, data) {
        return this.createChart(ctx, 'radar', data);
    }

    // 创建环形图
    createDoughnutChart(ctx, data) {
        return this.createChart(ctx, 'doughnut', data);
    }

    // 创建图表的通用方法
    createChart(ctx, type, data) {
        // 简化的图表实现，实际项目中应该使用Chart.js等库
        const chart = {
            type,
            data,
            ctx,
            render: () => {
                this.renderSimpleChart(ctx, type, data);
            }
        };
        
        chart.render();
        return chart;
    }

    // 简单的图表渲染实现
    renderSimpleChart(ctx, type, data) {
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 设置样式
        ctx.fillStyle = this.themes[this.currentTheme].text;
        ctx.strokeStyle = this.themes[this.currentTheme].primary;
        ctx.lineWidth = 2;
        
        if (type === 'line' && data.datasets && data.datasets.length > 0) {
            this.renderLineChart(ctx, data, width, height);
        } else if (type === 'bar' && data.datasets && data.datasets.length > 0) {
            this.renderBarChart(ctx, data, width, height);
        } else {
            // 显示占位符
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('图表数据加载中...', width / 2, height / 2);
        }
    }

    // 渲染线图
    renderLineChart(ctx, data, width, height) {
        const dataset = data.datasets[0];
        const values = dataset.data;
        const labels = data.labels;
        
        if (!values || values.length === 0) return;
        
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const valueRange = maxValue - minValue || 1;
        
        // 绘制网格线
        ctx.strokeStyle = this.themes[this.currentTheme].grid;
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // 绘制数据线
        ctx.strokeStyle = dataset.borderColor || this.themes[this.currentTheme].primary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        values.forEach((value, index) => {
            const x = padding + (chartWidth / (values.length - 1)) * index;
            const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // 绘制数据点
        ctx.fillStyle = dataset.borderColor || this.themes[this.currentTheme].primary;
        values.forEach((value, index) => {
            const x = padding + (chartWidth / (values.length - 1)) * index;
            const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    // 渲染柱状图
    renderBarChart(ctx, data, width, height) {
        const dataset = data.datasets[0];
        const values = dataset.data;
        const labels = data.labels;
        
        if (!values || values.length === 0) return;
        
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        const maxValue = Math.max(...values);
        const barWidth = chartWidth / values.length * 0.8;
        const barSpacing = chartWidth / values.length * 0.2;
        
        ctx.fillStyle = dataset.backgroundColor || this.themes[this.currentTheme].primary;
        
        values.forEach((value, index) => {
            const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
            const barHeight = (value / maxValue) * chartHeight;
            const y = padding + chartHeight - barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
        });
    }

    // 切换图表类型
    changeChartType(containerId, chartType) {
        const chart = this.charts.get(containerId.replace('Chart', ''));
        if (chart) {
            chart.type = chartType;
            chart.render();
        }
    }

    // 过滤表格
    filterTable(searchTerm) {
        const table = document.getElementById('statisticsTable');
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const matches = text.includes(searchTerm.toLowerCase());
            row.style.display = matches ? '' : 'none';
        });
    }

    // 排序表格
    sortTable(sortBy) {
        const table = document.getElementById('statisticsTable');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'time':
                    aValue = new Date(a.cells[0].textContent);
                    bValue = new Date(b.cells[0].textContent);
                    break;
                case 'success':
                    aValue = parseFloat(a.cells[3].textContent);
                    bValue = parseFloat(b.cells[3].textContent);
                    break;
                case 'count':
                    aValue = parseInt(a.cells[1].textContent);
                    bValue = parseInt(b.cells[1].textContent);
                    break;
                default:
                    return 0;
            }
            
            return bValue - aValue;
        });
        
        rows.forEach(row => tbody.appendChild(row));
    }

    // 切换主题
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');
        
        // 重新渲染所有图表
        this.charts.forEach(chart => {
            if (chart.render) {
                chart.render();
            }
        });
    }

    // 导出数据
    async exportData() {
        try {
            const data = await this.fetchData();
            const exportData = {
                timestamp: new Date().toISOString(),
                timeRange: this.currentTimeRange,
                data
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qzone-analytics-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess('数据导出成功');
        } catch (error) {
            console.error('Export failed:', error);
            this.showError('数据导出失败');
        }
    }

    // 显示加载状态
    showLoading() {
        document.querySelectorAll('.chart-container').forEach(container => {
            container.classList.add('loading');
        });
    }

    // 隐藏加载状态
    hideLoading() {
        document.querySelectorAll('.chart-container').forEach(container => {
            container.classList.remove('loading');
        });
    }

    // 显示成功消息
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // 显示错误消息
    showError(message) {
        this.showNotification(message, 'error');
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 销毁可视化组件
    destroy() {
        this.charts.forEach(chart => {
            if (chart.destroy) {
                chart.destroy();
            }
        });
        this.charts.clear();
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// 导出数据可视化类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataVisualization;
} else if (typeof window !== 'undefined') {
    window.DataVisualization = DataVisualization;
}