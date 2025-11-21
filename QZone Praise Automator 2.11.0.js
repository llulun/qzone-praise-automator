// ==UserScript==
// @name         QZone Praise Automator
// @namespace    https://github.com/llulun/qzone-autopraise-pro
// @license      MIT
// @version      2.11.1
// @description  网页版QQ空间自动点赞工具（增强版：简化工作流，通过检测点赞元素判断是否在好友动态页面，有则直接执行点赞，无则切换到好友动态后刷新页面重走流程，移除菜单元素，添加延迟处理、安全点赞、菜单调整、状态栏美化、滚动模拟等功能。更新：状态栏更详细显示任务进度、剩余时间等，美化透明度与阴影；控制面板增大、居中、透明化；修复状态栏文字模糊与重叠问题，通过分行显示、调整字体与行高确保清晰；状态栏背景改为黑色渐变，添加透明阴影与底部圆角；扩展控制面板为左侧菜单栏式结构，添加更多参数调整如状态栏/控制面板透明度、颜色、屏蔽用户、过滤选项、重试次数、滚动步长、初始延迟等，所有可调参数均集成到面板中，支持动态应用变化；移除双击页面调用setConfig事件，所有设置统一通过控制面板；控制面板默认隐藏，通过点击浮动按钮打开；修复状态栏文字随背景透明问题，添加文字颜色与亮度设置；新增：暂停/恢复功能，允许用户暂停或恢复自动点赞流程，状态栏显示暂停状态；修复：状态栏第二行参数与等待时间显示错误，确保实时同步最新参数和正确时间；优化：修复状态栏多余分隔符逻辑，避免显示异常；兼容：将模板字符串改为字符串连接，提高旧浏览器兼容性，避免潜在语法报错。贡献更新（v2.4）：美化控制面板和状态栏的UI（添加过渡动画、圆角按钮、响应式布局）；修复潜在bug如滚动事件重复触发点赞、暂停时定时器未完全清理、cookie值解析边缘案例；优化性能（减少不必要的setInterval调用、批量DOM操作）；添加暗黑模式自动适配选项。贡献更新（v2.5）：修复bug：在点赞或滚动任务执行过程中，如果任务时间超过刷新间隔，导致倒计时重置的问题（通过在任务开始时推迟nextTime来避免中断）；美化状态栏：添加进度条表示当前任务进度、使用emoji图标增强视觉反馈、优化字体和间距以提高可读性。贡献更新（v2.6）：修复状态栏逻辑问题：防止safeLike重复调用导致nextTime多次推迟和倒计时跳动；优化点赞逻辑，仅调度实际需要点赞的动态，避免不必要延迟和卡在“跳过”步骤；如果所有动态被跳过，立即完成任务并更新状态栏为等待刷新，而不是等待无谓时间或显示跳过消息。贡献更新（v2.8）：UI美化升级（主题系统、响应式设计、微交互）；新增动态关键词过滤（屏蔽/允许模式，支持正则）；黑名单扩展（分组、白名单、导入/导出）；每日点赞上限；浏览器通知；性能监控（点赞成功率统计）；多账号支持（配置切换）。贡献更新（v2.8.1）：修复动态元素事件监听器添加问题，确保在tab内容加载后绑定事件，避免null错误；优化JSON解析错误处理；确保所有字符串连接正确，避免语法问题。贡献更新（v2.8.2）：修复关键词屏蔽不生效问题，将内容提取改为innerText以避免HTML标签干扰匹配；加强已赞动态检测，添加点赞后延迟检查class更新，防止手动滚动触发重复点赞导致取消；优化日志记录关键词匹配细节。贡献更新（v2.8.3）：新增自动登录检测与提醒（如果检测到登录过期，暂停脚本并通知用户）；优化滚动模拟以支持无限滚动页面（动态检测底部加载元素）；添加配置备份/恢复功能到控制面板；修复多账号切换时日志和统计不隔离的问题；增强暗黑模式兼容性，支持自定义主题色调调整。贡献更新（v2.8.4）：修复控制面板浮动按钮被状态栏遮挡的问题，提高浮动按钮z-index至10003，确保其显示在状态栏上方。贡献更新（v2.8.5）：增强存储功能，使用localStorage存储性能统计数据，确保网页刷新后不会清空。）贡献更新（v2.8.6）：增强登录检测：添加自动重登录选项，如果检测到过期，可选重定向到登录页，避免手动干预；添加冷却机制防循环。贡献更新（v2.8.7）：添加MutationObserver以监控动态内容加载，提高脚本对QQ空间无限滚动的响应性和稳定性；优化safeLike以避免重复触发。贡献更新（v2.8.8）：使日志存储持久化，使用localStorage存储日志，避免页面刷新后丢失。贡献更新（v2.8.9）：在控制面板的日志标签添加导出日志按钮，允许用户下载日志为JSON文件，便于调试和分享。贡献更新（v2.11.0）：全面UI界面美化与优化：添加饼图数据可视化展示点赞统计；优化状态栏显示效果（添加进度条动画、脉冲效果、滑入动画）；重构控制面板布局（添加卡片式设计、过渡动画、响应式布局）；实现8种精美主题预设（默认、科技、生态、暗黑、紫色、日落、海洋、樱花）；添加主题实时预览功能；增强微交互体验（添加涟漪效果、按钮反馈、加载动画）；优化动画和过渡效果，提升整体视觉体验。
// @author       llulun (with contributions)
// @match        *://*.qzone.qq.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// @grant        GM_notification
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 从cookie获取配置（扩展：添加新参数，如关键词、模式、白名单、分组、每日上限等）
    let duration = parseInt(getCookie('al-duration')) || 180;
    let refreshDelay = parseInt(getCookie('al-refreshDelay')) || 10;
    let likeDelay = parseInt(getCookie('al-likeDelay')) || 5;
    let scrollCount = parseInt(getCookie('al-scrollCount')) || 3;
    let blocked = getCookie('al-blocked') ? getCookie('al-blocked').split(',') : [];
    let whiteList = getCookie('al-whiteList') ? getCookie('al-whiteList').split(',') : [];
    let blockGroups = safeJsonParse(getCookie('al-blockGroups')) || {}; // 使用安全解析
    let filterKeywords = getCookie('al-filterKeywords') ? getCookie('al-filterKeywords').split(',') : [];
    let filterMode = getCookie('al-filterMode') || 'block'; // 'block' or 'allow'
    let dailyLimit = parseInt(getCookie('al-dailyLimit')) || 0; // 0 means unlimited
    let dailyCount = parseInt(getCookie('al-dailyCount')) || 0;
    let lastDailyReset = parseInt(getCookie('al-lastDailyReset')) || Date.now();
    let smartLikeMode = getCookie('al-smartLikeMode') || 'normal'; // 'normal', 'smart', 'aggressive'
    let smartLikeKeywords = safeJsonParse(getCookie('al-smartLikeKeywords')) || {
        'high': ['感谢', '祝福', '生日', '节日', '喜讯', '好消息', '恭喜'],
        'medium': ['旅行', '美食', '风景', '照片', '分享'],
        'low': ['转发', '广告', '抽奖']
    };
    const dict = ['点赞', '转发', '评论'];
    let select = Boolean(getCookie('al-select'));
    let lastRefresh = parseInt(getCookie('al-lastRefresh')) || 0;
    let nextTime = Math.max(Date.now(), lastRefresh + duration * 1000);
    let isScrolling = false;
    let timeout = null;
    let isRunning = false;
    let isPaused = false;
    let testMode = false;
    let uin = unsafeWindow.g_iUin || unsafeWindow.g_iLoginUin || '';
    let retryCount = 0;
    let maxRetries = parseInt(getCookie('al-maxRetries')) || 3;
    let currentTask = '';
    let taskStartTime = 0;
    let taskDuration = 0;
    let nextTask = '';
    let statusOpacity = parseFloat(getCookie('al-statusOpacity')) || 0.8;
    let statusBgColor = getCookie('al-statusBgColor') || 'linear-gradient(to right, #333, #222)';
    let menuOpacity = parseFloat(getCookie('al-menuOpacity')) || 0.9;
    let menuBgColor = getCookie('al-menuBgColor') || 'linear-gradient(to bottom, #ffffff, #f0f0f0)';
    let scrollStepPercent = parseFloat(getCookie('al-scrollStepPercent')) || 0.9;
    let initialDelay = parseInt(getCookie('al-initialDelay')) || 3000;
    let statusTextColor = getCookie('al-statusTextColor') || (statusBgColor.includes('#333') || statusBgColor.includes('#222') ? '#ddd' : '#333');
    let statusTextBrightness = parseFloat(getCookie('al-statusTextBrightness')) || 1.0;
    let darkModeAuto = Boolean(getCookie('al-darkModeAuto'));
    let logLevel = getCookie('al-logLevel') || 'INFO';
    let logs = safeJsonParse(localStorage.getItem('al-logs')) || {}; // 修改：使用localStorage存储日志
    let theme = getCookie('al-theme') || 'default'; // 新增：主题
    let randomDelayMin = parseInt(getCookie('al-randomDelayMin')) || 1; // 新增：随机延迟
    let randomDelayMax = parseInt(getCookie('al-randomDelayMax')) || 3;
    let enableNotifications = Boolean(getCookie('al-enableNotifications')); // 新增：通知
    let stats = safeJsonParse(localStorage.getItem('al-stats')) || {}; // 修改：使用localStorage存储性能统计
    let accounts = safeJsonParse(getCookie('al-accounts')) || {}; // 新增：多账号
    let currentAccount = uin; // 当前账号
    let enableLoginCheck = (getCookie('al-enableLoginCheck') !== undefined) ? Boolean(getCookie('al-enableLoginCheck')) : true; // 新增：登录检测
    let themeHue = parseInt(getCookie('al-themeHue')) || 0; // 新增：主题色调调整
    let enableAutoRelogin = Boolean(getCookie('al-enableAutoRelogin')) || false; // 新增：自动重登录
    let totalLikes = parseInt(getCookie('al-totalLikes')) || 0; // 新增：总点赞数统计
    let timeUpdateInterval = null;
    let statusUpdateInterval = null;

    // 新增：安全JSON解析
    function safeJsonParse(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            log('WARN', 'JSON解析失败: ' + e.message + ', 返回默认值');
            return null;
        }
    }

    // Cookie 操作函数
    function getCookie(name) {
        let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function setCookie(name, value, maxAge) {
        let expires = "";
        if (maxAge) {
            let date = new Date();
            date.setTime(date.getTime() + maxAge * 1000);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    // ==================== 日志系统 ====================
    function log(level, message) {
        try {
            if (!shouldLog(level)) return;
            let now = new Date();
            let timestamp = now.getFullYear() + '-' +
                            ('0' + (now.getMonth() + 1)).slice(-2) + '-' +
                            ('0' + now.getDate()).slice(-2) + ' ' +
                            ('0' + now.getHours()).slice(-2) + ':' +
                            ('0' + now.getMinutes()).slice(-2) + ':' +
                            ('0' + now.getSeconds()).slice(-2);
            let fullMessage = '[' + timestamp + '] [' + level + '] ' + message;
            let consoleMethod = console.log;
            if (level === 'WARN') consoleMethod = console.warn;
            if (level === 'ERROR') consoleMethod = console.error;
            consoleMethod(fullMessage);

            // 多账号日志隔离
            logs[currentAccount] = logs[currentAccount] || [];
            logs[currentAccount].push(fullMessage);
            if (logs[currentAccount].length > 500) {
                logs[currentAccount].shift();
            }

            // 持久化日志到localStorage
            localStorage.setItem('al-logs', JSON.stringify(logs));
        } catch (e) {}
    }
    
    // ==================== 图表绘制 ====================
    function drawPieChart(ctx, data) {
        // 检查是否有数据
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) {
            // 没有数据时显示空状态
            ctx.font = '14px Arial';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('暂无数据', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }
        
        // 绘制饼图
        let startAngle = 0;
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        
        // 绘制各个扇区
        data.forEach(item => {
            if (item.value === 0) return; // 跳过值为0的项
            
            const sliceAngle = 2 * Math.PI * item.value / total;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            
            ctx.fillStyle = item.color;
            ctx.fill();
            
            // 绘制标签线和文本
            const midAngle = startAngle + sliceAngle / 2;
            const labelRadius = radius * 1.2;
            const labelX = centerX + Math.cos(midAngle) * labelRadius;
            const labelY = centerY + Math.sin(midAngle) * labelRadius;
            
            // 计算百分比
            const percentage = Math.round((item.value / total) * 100);
            if (percentage >= 5) { // 只为占比较大的扇区添加标签
                ctx.beginPath();
                ctx.moveTo(centerX + Math.cos(midAngle) * radius, centerY + Math.sin(midAngle) * radius);
                ctx.lineTo(labelX, labelY);
                ctx.strokeStyle = item.color;
                ctx.lineWidth = 1;
                ctx.stroke();
                
                ctx.font = '12px Arial';
                ctx.fillStyle = '#333';
                ctx.textAlign = midAngle < Math.PI ? 'left' : 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${item.label}: ${percentage}%`, labelX, labelY);
            }
            
            startAngle += sliceAngle;
        });
        
        // 绘制中心圆形
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 在中心显示总数
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`总计: ${total}`, centerX, centerY);
    }
    
    // 添加波纹效果函数
    function addRippleEffect(element) {
        element.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('al-ripple');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'al-ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            // 计算点击位置
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
            
            element.appendChild(ripple);
            
            // 动画结束后移除
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    // 添加悬停效果
    function addHoverEffect(element, scale) {
        const targetScale = scale || '1.05';
        element.style.transition = (element.style.transition ? element.style.transition + ', ' : '') + 'transform 0.2s ease, box-shadow 0.2s ease';
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(' + targetScale + ')';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        });
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '';
        });
    }

    // 添加点击反馈效果
    function addClickFeedback(element) {
        element.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.97)';
        });
        element.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }

    // 添加提示气泡
    function addTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.classList.add('al-tooltip');
        tooltip.textContent = text;
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '10005';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.2s ease';
        tooltip.style.whiteSpace = 'nowrap';
        document.body.appendChild(tooltip);

        element.addEventListener('mouseenter', function() {
            const rect = this.getBoundingClientRect();
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = (rect.top - 8 - tooltip.offsetHeight) + 'px';
            tooltip.style.opacity = '1';
        });
        element.addEventListener('mouseleave', function() {
            tooltip.style.opacity = '0';
        });
        return tooltip;
    }

    function shouldLog(level) {
        const levels = { 'INFO': 0, 'WARN': 1, 'ERROR': 2 };
        return levels[logLevel] <= levels[level];
    }

    // 重置每日计数
    function resetDailyCount() {
        let today = new Date().setHours(0,0,0,0);
        if (lastDailyReset < today) {
            dailyCount = 0;
            lastDailyReset = today;
            setCookie('al-dailyCount', dailyCount, Number.MAX_SAFE_INTEGER);
            setCookie('al-lastDailyReset', lastDailyReset, Number.MAX_SAFE_INTEGER);
        }
    }

    // 发送通知
    function sendNotification(title, body) {
        if (enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: body });
        } else if (enableNotifications && 'Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(function(perm) {
                if (perm === 'granted') {
                    new Notification(title, { body: body });
                }
            });
        }
    }

    // 更新统计（多账号隔离，使用localStorage持久化）
    function updateStats(key) {
        stats[currentAccount] = stats[currentAccount] || { likes: 0, skips: 0, errors: 0 };
        stats[currentAccount][key] = (stats[currentAccount][key] || 0) + 1;
        localStorage.setItem('al-stats', JSON.stringify(stats));
    }

    // 新增：检测登录状态
    function checkLoginStatus() {
        if (!enableLoginCheck) return true;
        const isLoggedIn = !!uin && document.querySelector('.user-info') !== null;
        if (!isLoggedIn) {
            isPaused = true;
            updateStatusBar('检测到登录过期，请重新登录');
            sendNotification('登录过期', 'QZone Praise Automator 检测到登录状态失效，请重新登录以继续。');
            log('WARN', '登录状态失效，脚本暂停');

            // 新增：自动重登录逻辑
            if (enableAutoRelogin) {
                const lastAttempt = parseInt(getCookie('al-lastReloginAttempt')) || 0;
                const cooldown = 5 * 60 * 1000; // 5分钟冷却
                if (Date.now() - lastAttempt > cooldown) {
                    log('INFO', '尝试自动重登录，重定向到登录页');
                    sendNotification('自动重登录', '检测到过期，正在重定向到QQ空间登录页...');
                    setCookie('al-lastReloginAttempt', Date.now(), Number.MAX_SAFE_INTEGER);
                    location.href = 'https://qzone.qq.com/'; // QQ空间首页，会触发登录如果过期
                } else {
                    log('WARN', '重登录冷却中，跳过自动尝试');
                }
            }
            return false;
        }
        return true;
    }

    // 新增：设置MutationObserver以监控动态内容
    let mutationObserver = null;
    function setupMutationObserver() {
        const targetNode = document.querySelector('#feed_friend_list') || document.body; // 假设好友动态容器为#feed_friend_list，实际根据QQ空间调整
        if (!targetNode) {
            log('WARN', '未找到动态容器，MutationObserver未启动');
            return;
        }

        mutationObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    let hasNewLikes = Array.from(mutation.addedNodes).some(node => node.querySelector && node.querySelector('.qz_like_btn_v3'));
                    if (hasNewLikes) {
                        log('INFO', '检测到新动态加载，触发safeLike');
                        safeLike();
                    }
                }
            });
        });

        const config = { childList: true, subtree: true };
        mutationObserver.observe(targetNode, config);
        log('INFO', 'MutationObserver已启动，监控动态内容');
    }

    // 控制面板按钮回调函数
    function saveSettings() {
        try {
            // 读取核心参数（存在则更新）
            var durEl = document.getElementById('al-dur');
            if (durEl) { duration = parseInt(durEl.value) || duration; setCookie('al-duration', duration, Number.MAX_SAFE_INTEGER); }
            var rdelayEl = document.getElementById('al-rdelay');
            if (rdelayEl) { refreshDelay = parseInt(rdelayEl.value) || refreshDelay; setCookie('al-refreshDelay', refreshDelay, Number.MAX_SAFE_INTEGER); }
            var ldelayEl = document.getElementById('al-ldelay');
            if (ldelayEl) { likeDelay = parseInt(ldelayEl.value) || likeDelay; setCookie('al-likeDelay', likeDelay, Number.MAX_SAFE_INTEGER); }
            var scountEl = document.getElementById('al-scount');
            if (scountEl) { scrollCount = parseInt(scountEl.value) || scrollCount; setCookie('al-scrollCount', scrollCount, Number.MAX_SAFE_INTEGER); }
            var dailyLimitEl = document.getElementById('al-dailyLimit');
            if (dailyLimitEl) { dailyLimit = parseInt(dailyLimitEl.value) || dailyLimit; setCookie('al-dailyLimit', dailyLimit, Number.MAX_SAFE_INTEGER); }
            var smartLikeModeEl = document.getElementById('al-smartLikeMode');
            if (smartLikeModeEl) { smartLikeMode = smartLikeModeEl.value || smartLikeMode; setCookie('al-smartLikeMode', smartLikeMode, Number.MAX_SAFE_INTEGER); }
            var selectEl = document.getElementById('al-select');
            if (selectEl) { select = !!selectEl.checked; setCookie('al-select', select ? '1' : '', Number.MAX_SAFE_INTEGER); }
            var loginCheckEl = document.getElementById('al-enableLoginCheck');
            if (loginCheckEl) { enableLoginCheck = !!loginCheckEl.checked; setCookie('al-enableLoginCheck', enableLoginCheck ? '1' : '', Number.MAX_SAFE_INTEGER); }
            var autoReloginEl = document.getElementById('al-enableAutoRelogin');
            if (autoReloginEl) { enableAutoRelogin = !!autoReloginEl.checked; setCookie('al-enableAutoRelogin', enableAutoRelogin ? '1' : '', Number.MAX_SAFE_INTEGER); }

            // 读取UI参数（存在则更新）
            var themeEl = document.getElementById('al-theme');
            if (themeEl) { theme = themeEl.value || theme; setCookie('al-theme', theme, Number.MAX_SAFE_INTEGER); }
            var themeHueEl = document.getElementById('al-themeHue');
            if (themeHueEl) { themeHue = parseInt(themeHueEl.value) || themeHue; setCookie('al-themeHue', themeHue, Number.MAX_SAFE_INTEGER); }
            var statusOpacityEl = document.getElementById('al-statusOpacity');
            if (statusOpacityEl) { statusOpacity = parseFloat(statusOpacityEl.value) || statusOpacity; setCookie('al-statusOpacity', statusOpacity, Number.MAX_SAFE_INTEGER); }
            var statusBgColorEl = document.getElementById('al-statusBgColor');
            if (statusBgColorEl) { statusBgColor = statusBgColorEl.value || statusBgColor; setCookie('al-statusBgColor', statusBgColor, Number.MAX_SAFE_INTEGER); }
            var statusTextColorEl = document.getElementById('al-statusTextColor');
            if (statusTextColorEl) { statusTextColor = statusTextColorEl.value || statusTextColor; setCookie('al-statusTextColor', statusTextColor, Number.MAX_SAFE_INTEGER); }
            var statusTextBrightnessEl = document.getElementById('al-statusTextBrightness');
            if (statusTextBrightnessEl) { statusTextBrightness = parseFloat(statusTextBrightnessEl.value) || statusTextBrightness; setCookie('al-statusTextBrightness', statusTextBrightness, Number.MAX_SAFE_INTEGER); }
            var darkModeAutoEl = document.getElementById('al-darkModeAuto');
            if (darkModeAutoEl) { darkModeAuto = !!darkModeAutoEl.checked; setCookie('al-darkModeAuto', darkModeAuto ? '1' : '', Number.MAX_SAFE_INTEGER); }
            var menuOpacityEl = document.getElementById('al-menuOpacity');
            if (menuOpacityEl) { menuOpacity = parseFloat(menuOpacityEl.value) || menuOpacity; setCookie('al-menuOpacity', menuOpacity, Number.MAX_SAFE_INTEGER); }
            var menuBgColorEl = document.getElementById('al-menuBgColor');
            if (menuBgColorEl) { menuBgColor = menuBgColorEl.value || menuBgColor; setCookie('al-menuBgColor', menuBgColor, Number.MAX_SAFE_INTEGER); }

            // 保存到多账号配置
            if (typeof saveAccountConfig === 'function') {
                saveAccountConfig();
            }

            // 应用并反馈
            applyDarkMode();
            updateStatusBar('设置已保存并应用');
            log('INFO', '设置已保存并应用');
        } catch (e) {
            log('ERROR', '保存设置失败: ' + e.message);
        }
    }

    function togglePause() {
        isPaused = !isPaused;
        updateStatusBar(isPaused ? '脚本已暂停' : '脚本已恢复');
        var pauseBtn = document.getElementById('al-pause');
        if (pauseBtn) {
            pauseBtn.textContent = isPaused ? '恢复' : '暂停';
        }
        
        // 修复：暂停时断开MutationObserver，恢复时重新连接
        if (isPaused) {
            if (mutationObserver) {
                mutationObserver.disconnect();
                log('INFO', 'MutationObserver已断开连接');
            }
        } else {
            setupMutationObserver();
        }
        
        log('INFO', isPaused ? '用户暂停脚本' : '用户恢复脚本');
    }

    function testRun() {
        try {
            testMode = true;
            updateStatusBar('测试执行中…');
            if (typeof safeLike === 'function') {
                safeLike();
            } else {
                log('WARN', '未找到safeLike，执行占位测试');
            }
            setTimeout(function() {
                testMode = false;
                updateStatusBar('测试执行完成');
            }, 1000);
        } catch (e) {
            log('ERROR', '测试执行失败: ' + e.message);
            updateStatusBar('测试执行失败');
        }
    }

    function resetSettings() {
        try {
            // 核心参数重置为默认
            duration = 180; setCookie('al-duration', duration, Number.MAX_SAFE_INTEGER);
            refreshDelay = 10; setCookie('al-refreshDelay', refreshDelay, Number.MAX_SAFE_INTEGER);
            likeDelay = 5; setCookie('al-likeDelay', likeDelay, Number.MAX_SAFE_INTEGER);
            scrollCount = 3; setCookie('al-scrollCount', scrollCount, Number.MAX_SAFE_INTEGER);
            dailyLimit = 0; setCookie('al-dailyLimit', dailyLimit, Number.MAX_SAFE_INTEGER);
            smartLikeMode = 'normal'; setCookie('al-smartLikeMode', smartLikeMode, Number.MAX_SAFE_INTEGER);
            select = false; setCookie('al-select', '', Number.MAX_SAFE_INTEGER);
            enableLoginCheck = true; setCookie('al-enableLoginCheck', '1', Number.MAX_SAFE_INTEGER);
            enableAutoRelogin = false; setCookie('al-enableAutoRelogin', '', Number.MAX_SAFE_INTEGER);

            // UI参数重置为默认
            theme = 'default'; setCookie('al-theme', theme, Number.MAX_SAFE_INTEGER);
            themeHue = 0; setCookie('al-themeHue', themeHue, Number.MAX_SAFE_INTEGER);
            statusOpacity = 0.8; setCookie('al-statusOpacity', statusOpacity, Number.MAX_SAFE_INTEGER);
            statusBgColor = 'linear-gradient(to right, #333, #222)'; setCookie('al-statusBgColor', statusBgColor, Number.MAX_SAFE_INTEGER);
            statusTextColor = '#ddd'; setCookie('al-statusTextColor', statusTextColor, Number.MAX_SAFE_INTEGER);
            statusTextBrightness = 1.0; setCookie('al-statusTextBrightness', statusTextBrightness, Number.MAX_SAFE_INTEGER);
            darkModeAuto = true; setCookie('al-darkModeAuto', '1', Number.MAX_SAFE_INTEGER);
            menuOpacity = 0.9; setCookie('al-menuOpacity', menuOpacity, Number.MAX_SAFE_INTEGER);
            menuBgColor = 'linear-gradient(to bottom, #ffffff, #f0f0f0)'; setCookie('al-menuBgColor', menuBgColor, Number.MAX_SAFE_INTEGER);

            if (typeof saveAccountConfig === 'function') { saveAccountConfig(); }
            applyDarkMode();
            updateStatusBar('已重置为默认设置');
            log('INFO', '已重置为默认设置');
        } catch (e) {
            log('ERROR', '重置设置失败: ' + e.message);
        }
    }

    function exportConfig() {
        try {
            var config = {
                duration: duration, refreshDelay: refreshDelay, likeDelay: likeDelay, scrollCount: scrollCount,
                blocked: blocked, whiteList: whiteList, blockGroups: blockGroups, filterKeywords: filterKeywords, filterMode: filterMode,
                dailyLimit: dailyLimit, select: select, theme: theme, themeHue: themeHue,
                statusOpacity: statusOpacity, statusBgColor: statusBgColor, statusTextColor: statusTextColor, statusTextBrightness: statusTextBrightness,
                darkModeAuto: darkModeAuto, menuOpacity: menuOpacity, menuBgColor: menuBgColor,
                maxRetries: maxRetries, scrollStepPercent: scrollStepPercent, initialDelay: initialDelay, randomDelayMin: randomDelayMin, randomDelayMax: randomDelayMax,
                logLevel: logLevel, enableNotifications: enableNotifications, enableLoginCheck: enableLoginCheck, enableAutoRelogin: enableAutoRelogin
            };
            var blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'qzone-praise-config.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            updateStatusBar('配置已导出');
            log('INFO', '配置已导出');
        } catch (e) {
            log('ERROR', '导出配置失败: ' + e.message);
        }
    }

    function backupConfig() {
        try {
            var config = {
                duration: duration, refreshDelay: refreshDelay, likeDelay: likeDelay, scrollCount: scrollCount,
                blocked: blocked, whiteList: whiteList, blockGroups: blockGroups, filterKeywords: filterKeywords, filterMode: filterMode,
                dailyLimit: dailyLimit, select: select, theme: theme, themeHue: themeHue,
                statusOpacity: statusOpacity, statusBgColor: statusBgColor, statusTextColor: statusTextColor, statusTextBrightness: statusTextBrightness,
                darkModeAuto: darkModeAuto, menuOpacity: menuOpacity, menuBgColor: menuBgColor,
                maxRetries: maxRetries, scrollStepPercent: scrollStepPercent, initialDelay: initialDelay, randomDelayMin: randomDelayMin, randomDelayMax: randomDelayMax,
                logLevel: logLevel, enableNotifications: enableNotifications, enableLoginCheck: enableLoginCheck, enableAutoRelogin: enableAutoRelogin
            };
            localStorage.setItem('al-config-backup', JSON.stringify(config));
            updateStatusBar('配置已备份');
            log('INFO', '配置已备份到localStorage');
        } catch (e) {
            log('ERROR', '备份配置失败: ' + e.message);
        }
    }

    function restoreConfig() {
        try {
            var backupStr = localStorage.getItem('al-config-backup');
            if (backupStr) {
                var cfg = safeJsonParse(backupStr);
                if (!cfg) {
                    log('ERROR', '备份配置格式无效');
                    updateStatusBar('恢复配置失败：格式无效');
                    return;
                }
                // 应用配置
                Object.keys(cfg).forEach(function(k){
                    try {
                        // 安全的属性赋值，避免使用 eval()
                        if (typeof window[k] !== 'undefined') {
                            window[k] = cfg[k];
                        }
                        setCookie('al-' + k, typeof cfg[k] === 'object' ? JSON.stringify(cfg[k]) : cfg[k], Number.MAX_SAFE_INTEGER);
                    } catch(e) {}
                });
                if (typeof saveAccountConfig === 'function') { saveAccountConfig(); }
                applyDarkMode();
                updateStatusBar('已从备份恢复配置');
                log('INFO', '已从localStorage恢复配置');
                return;
            }

            // 若无备份，允许文件导入
            var fileInput = document.getElementById('al-config-file-input');
            if (!fileInput) {
                fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.id = 'al-config-file-input';
                fileInput.accept = 'application/json';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
                fileInput.addEventListener('change', function(){
                    var file = fileInput.files[0];
                    if (!file) return;
                    var reader = new FileReader();
                    reader.onload = function(){
                        try {
                            var cfg = safeJsonParse(reader.result);
                            if (!cfg) {
                                log('ERROR', '配置文件格式无效');
                                updateStatusBar('配置文件格式无效');
                                return;
                            }
                            Object.keys(cfg).forEach(function(k){
                                try {
                                    // 安全的属性赋值，避免使用 eval()
                                    if (typeof window[k] !== 'undefined') {
                                        window[k] = cfg[k];
                                    }
                                    setCookie('al-' + k, typeof cfg[k] === 'object' ? JSON.stringify(cfg[k]) : cfg[k], Number.MAX_SAFE_INTEGER);
                                } catch(e) {}
                            });
                            if (typeof saveAccountConfig === 'function') { saveAccountConfig(); }
                            applyDarkMode();
                            updateStatusBar('配置文件恢复成功');
                            log('INFO', '配置文件恢复成功');
                        } catch (e) {
                            log('ERROR', '解析配置文件失败: ' + e.message);
                            updateStatusBar('解析配置文件失败');
                        }
                    };
                    reader.readAsText(file);
                });
            }
            fileInput.click();
        } catch (e) {
            log('ERROR', '恢复配置失败: ' + e.message);
        }
    }

    // 简易对比色计算，提升文字与控件清晰度
    function isDarkMenu(bg) {
        const s = String(bg || '').toLowerCase();
        return s.includes('#333') || s.includes('#222') || s.includes('#000');
    }
    function getMenuTextColor(bg) {
        return isDarkMenu(bg) ? '#f1f3f4' : '#222';
    }
    function getCardBackground(bg) {
        return isDarkMenu(bg) ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)';
    }
    function getCardBorder(bg) {
        return isDarkMenu(bg) ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.10)';
    }

    // 创建菜单栏（新增：配置备份/恢复、登录检测开关、色调调整）
    function createMenu() {
        // 添加菜单样式
        const menuStyles = document.createElement('style');
        menuStyles.textContent = `
            #al-menu {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.95);
                width: 80%;
                max-width: 800px;
                height: auto;
                max-height: 80vh;
                overflow: auto;
                background: ${menuBgColor};
                border: none;
                border-radius: 16px;
                padding: 0;
                z-index: 2147483647; /* 保证控制面板始终在最上层 */
                box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                font-family: "Arial", sans-serif;
                opacity: 0;
                display: none;
                pointer-events: auto;
                transition: opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1), 
                            transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
                filter: hue-rotate(${themeHue}deg);
                color: ${getMenuTextColor(menuBgColor)};
            }
            
            #al-menu.visible {
                opacity: ${menuOpacity};
                transform: translate(-50%, -50%) scale(1);
            }
            
            #al-menu-header {
                padding: 15px 20px;
                border-bottom: 1px solid rgba(200,200,200,0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(0,0,0,0.1);
                border-radius: 16px 16px 0 0;
            }
            
            #al-menu-title {
                margin: 0;
                font-size: 18px;
                font-weight: bold;
                color: inherit;
            }
            
            #al-menu-close {
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                background: rgba(255,255,255,0.1);
                transition: all 0.2s ease;
                color: inherit;
            }
            
            #al-menu-close:hover {
                background: rgba(255,255,255,0.2);
                transform: rotate(90deg);
            }
            
            #al-menu-body {
                display: flex;
                padding: 20px;
            }
            
            #al-sidebar {
                width: 150px;
                border-right: 1px solid rgba(200,200,200,0.2);
                padding-right: 15px;
            }
            
            #al-sidebar h4 {
                margin: 0 0 15px;
                font-size: 16px;
                opacity: 0.8;
                color: inherit;
            }
            
            #al-sidebar ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            #al-sidebar button {
                width: 100%;
                text-align: left;
                padding: 10px;
                background: none;
                border: none;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s ease;
                margin-bottom: 5px;
                position: relative;
                overflow: hidden;
                color: inherit;
            }
            
            #al-sidebar button:hover {
                background: rgba(255,255,255,0.1);
                transform: translateX(3px);
            }
            
            #al-sidebar button.active {
                background: rgba(255,255,255,0.2);
                font-weight: bold;
            }
            
            #al-content {
                flex: 1;
                padding-left: 20px;
                transition: opacity 0.3s ease;
                color: inherit;
            }
            
            #al-content h3 {
                margin-top: 0;
                font-size: 18px;
                border-bottom: 1px solid rgba(200,200,200,0.2);
                padding-bottom: 10px;
                color: inherit;
            }
            
            .al-card {
                background: ${getCardBackground(menuBgColor)};
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 15px;
                transition: all 0.2s ease;
                border: ${getCardBorder(menuBgColor)};
                color: inherit;
            }
            
            .al-card:hover {
                background: rgba(255,255,255,0.1);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }

            /* 表单控件：提高与背景的区分度 */
            #al-content label { color: inherit; }
            #al-content input,
            #al-content select,
            #al-content textarea {
                background: rgba(255,255,255,0.95);
                color: #222;
                border: 1px solid rgba(0,0,0,0.25);
                border-radius: 6px;
                padding: 6px 8px;
            }
            #al-content textarea { resize: vertical; }
            #al-content input:focus,
            #al-content select:focus,
            #al-content textarea:focus {
                outline: none;
                border-color: #2196F3;
                box-shadow: 0 0 0 2px rgba(33,150,243,0.25);
            }
            #al-content select { appearance: none; }
            
            #al-footer {
                margin-top: 20px;
                text-align: center;
                padding: 15px 20px;
                border-top: 1px solid rgba(200,200,200,0.2);
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
            }
            
            #al-footer button {
                background: rgba(255,255,255,0.1);
                color: inherit;
                border: none;
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                overflow: hidden;
            }
            
            #al-footer button:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-2px);
            }
            
            /* 按钮颜色主题 - 统一透明度管理 */
            #al-footer button { opacity: 0.7; }
            #al-save { background: rgba(76, 175, 80, 1) !important; }
            #al-pause { background: rgba(255, 152, 0, 1) !important; }
            #al-test { background: rgba(33, 150, 243, 1) !important; }
            #al-reset { background: rgba(158, 158, 158, 1) !important; }
            #al-export { background: rgba(103, 58, 183, 1) !important; }
            #al-backup { background: rgba(121, 85, 72, 1) !important; }
            #al-restore { background: rgba(96, 125, 139, 1) !important; }
            #al-close { background: rgba(244, 67, 54, 1) !important; }
            
            /* 响应式设计 */
            @media (max-width: 768px) {
                #al-menu {
                    width: 95%;
                }
                
                #al-menu-body {
                    flex-direction: column;
                }
                
                #al-sidebar {
                    width: 100%;
                    border-right: none;
                    border-bottom: 1px solid rgba(200,200,200,0.2);
                    padding-right: 0;
                    padding-bottom: 15px;
                    margin-bottom: 15px;
                }
                
                #al-content {
                    padding-left: 0;
                }
            }
        `;
        document.head.appendChild(menuStyles);
        
        // 创建菜单容器
        let menu = document.createElement('div');
        menu.id = 'al-menu';
        
        // 响应式
        if (window.innerWidth < 600) {
            menu.style.width = '95%';
        }
        
        // 创建菜单头部
        let menuHeader = document.createElement('div');
        menuHeader.id = 'al-menu-header';
        
        let menuTitle = document.createElement('h3');
        menuTitle.id = 'al-menu-title';
        menuTitle.textContent = 'QZone点赞助手控制面板';
        
        let menuClose = document.createElement('div');
        menuClose.id = 'al-menu-close';
        menuClose.innerHTML = '×';
        menuClose.addEventListener('click', function() {
            hideMenu();
        });
        
        // 添加微交互
        addRippleEffect(menuClose);
        addHoverEffect(menuClose, '1.08');
        addClickFeedback(menuClose);
        addTooltip(menuClose, '关闭面板');
        
        menuHeader.appendChild(menuTitle);
        menuHeader.appendChild(menuClose);
        menu.appendChild(menuHeader);
        
        // 创建菜单主体
        let menuBody = document.createElement('div');
        menuBody.id = 'al-menu-body';
        menu.appendChild(menuBody);

        // 创建侧边栏
        let sidebar = document.createElement('div');
        sidebar.id = 'al-sidebar';
        sidebar.innerHTML = '<h4>设置分类</h4><ul><li><button id="al-tab-core">核心参数</button></li><li><button id="al-tab-ui">界面自定义</button></li><li><button id="al-tab-filter">过滤规则</button></li><li><button id="al-tab-adv">高级参数</button></li><li><button id="al-tab-logs">查看日志</button></li><li><button id="al-tab-stats">性能统计</button></li><li><button id="al-tab-accounts">账号管理</button></li></ul>';
        menuBody.appendChild(sidebar);

        // 为侧边栏按钮添加微交互
        sidebar.querySelectorAll('button').forEach(btn => {
            addRippleEffect(btn);
            addHoverEffect(btn, '1.03');
            addClickFeedback(btn);
            addTooltip(btn, btn.textContent);
        });

        // 创建内容区域
        let content = document.createElement('div');
        content.id = 'al-content';
        menuBody.appendChild(content);

        // 创建页脚
        let footer = document.createElement('div');
        footer.id = 'al-footer';
        
        // 创建按钮
        const buttons = [
            { id: 'al-save', text: '保存并应用', action: saveSettings },
            { id: 'al-pause', text: isPaused ? '恢复' : '暂停', action: togglePause },
            { id: 'al-test', text: '测试执行', action: testRun },
            { id: 'al-reset', text: '重置默认', action: resetSettings },
            { id: 'al-export', text: '导出配置', action: exportConfig },
            { id: 'al-backup', text: '备份配置', action: backupConfig },
            { id: 'al-restore', text: '恢复配置', action: restoreConfig },
            { id: 'al-close', text: '关闭', action: hideMenu }
        ];
        
        buttons.forEach(btn => {
            let button = document.createElement('button');
            button.id = btn.id;
            button.textContent = btn.text;
            button.addEventListener('click', function() {
                btn.action();
                // 添加点击反馈
                this.classList.add('active');
                setTimeout(() => {
                    this.classList.remove('active');
                }, 300);
            });
            
            // 添加微交互
            addRippleEffect(button);
            addHoverEffect(button, '1.05');
            addClickFeedback(button);
            addTooltip(button, btn.text);
            
            footer.appendChild(button);
        });
        
        menu.appendChild(footer);
        document.body.appendChild(menu);
        
        // 显示菜单函数
        function showMenu() {
            menu.style.display = 'block';
            setTimeout(() => {
                menu.classList.add('visible');
            }, 10);
            
            // 默认显示核心参数标签页
            document.getElementById('al-tab-core').click();

            // 联动：打开面板时隐藏浮动按钮
            const fb = document.getElementById('al-float-btn');
            if (fb) fb.style.display = 'none';
        }
        
        // 隐藏菜单函数
        function hideMenu() {
            menu.classList.remove('visible');
            setTimeout(() => {
                menu.style.display = 'none';
                // 联动：关闭面板时恢复浮动按钮显示
                const fb = document.getElementById('al-float-btn');
                if (fb) fb.style.display = 'block';
            }, 400);
        }

        // 将菜单显示/隐藏函数暴露到全局，便于外部调用（预览页、浮动按钮等）
        try {
            (window || unsafeWindow).showMenu = showMenu;
            (window || unsafeWindow).hideMenu = hideMenu;
        } catch (e) {
            // 在用户脚本环境中没有 window/unsafeWindow 的极端情况时忽略
        }

        function showTab(tab) {
            content.style.opacity = '0';
            setTimeout(function() {
                content.innerHTML = '';
                if (tab === 'core') {
                    content.innerHTML = '<h3>核心参数</h3><div class="al-card"><label>刷新频率 (秒): <input type="number" id="al-dur" value="' + duration + '" min="30" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>刷新延迟 (秒): <input type="number" id="al-rdelay" value="' + refreshDelay + '" min="5" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>点赞延迟 (秒): <input type="number" id="al-ldelay" value="' + likeDelay + '" min="3" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>下滑动态数: <input type="number" id="al-scount" value="' + scrollCount + '" min="1" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>每日点赞上限 (0无限): <input type="number" id="al-dailyLimit" value="' + dailyLimit + '" min="0" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>智能点赞模式: <select id="al-smartLikeMode" style="width: 120px; margin-left: 10px;"><option value="normal" ' + (smartLikeMode === 'normal' ? 'selected' : '') + '>普通模式</option><option value="smart" ' + (smartLikeMode === 'smart' ? 'selected' : '') + '>智能模式</option><option value="aggressive" ' + (smartLikeMode === 'aggressive' ? 'selected' : '') + '>全面模式</option></select></label></div><div class="al-card"><label><input type="checkbox" id="al-select" ' + (select ? 'checked' : '') + '> 不点赞游戏转发内容</label></div><div class="al-card"><label><input type="checkbox" id="al-enableLoginCheck" ' + (enableLoginCheck ? 'checked' : '') + '> 启用登录状态检测</label></div>';
                    content.innerHTML += '<div class="al-card"><label><input type="checkbox" id="al-enableAutoRelogin" ' + (enableAutoRelogin ? 'checked' : '') + '> 启用自动重登录（过期时重定向）</label></div>'; // 新增复选框
                } else if (tab === 'ui') {
                    content.innerHTML = '<h3>界面自定义</h3><div class="al-card"><label>主题: <select id="al-theme"><option value="default" ' + (theme === 'default' ? 'selected' : '') + '>默认</option><option value="tech" ' + (theme === 'tech' ? 'selected' : '') + '>科技蓝</option><option value="eco" ' + (theme === 'eco' ? 'selected' : '') + '>环保绿</option></select></label></div><div class="al-card"><label>主题色调调整 (0-360): <input type="number" id="al-themeHue" value="' + themeHue + '" min="0" max="360" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>状态栏透明度 (0.1-1): <input type="number" id="al-statusOpacity" value="' + statusOpacity + '" min="0.1" max="1" step="0.1" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>状态栏背景: <select id="al-statusBgColor" style="width: 200px; margin-left: 10px;"><option value="linear-gradient(to right, #333, #222)" ' + (statusBgColor === 'linear-gradient(to right, #333, #222)' ? 'selected' : '') + '>黑色渐变</option><option value="linear-gradient(to right, #f0f0f0, #e0e0e0)" ' + (statusBgColor === 'linear-gradient(to right, #f0f0f0, #e0e0e0)' ? 'selected' : '') + '>白色渐变</option><option value="linear-gradient(to right, #2196F3, #1976D2)" ' + (statusBgColor === 'linear-gradient(to right, #2196F3, #1976D2)' ? 'selected' : '') + '>蓝色渐变</option><option value="linear-gradient(to right, #4CAF50, #388E3C)" ' + (statusBgColor === 'linear-gradient(to right, #4CAF50, #388E3C)' ? 'selected' : '') + '>绿色渐变</option></select></label></div><div class="al-card"><label>状态栏文字颜色: <select id="al-statusTextColor" style="width: 200px; margin-left: 10px;"><option value="auto" ' + (statusTextColor === 'auto' ? 'selected' : '') + '>自动</option><option value="#fff" ' + (statusTextColor === '#fff' ? 'selected' : '') + '>白色</option><option value="#000" ' + (statusTextColor === '#000' ? 'selected' : '') + '>黑色</option><option value="#ddd" ' + (statusTextColor === '#ddd' ? 'selected' : '') + '>浅灰</option></select></label></div><div class="al-card"><label>状态栏文字亮度 (0.5-1.5): <input type="number" id="al-statusTextBrightness" value="' + statusTextBrightness + '" min="0.5" max="1.5" step="0.1" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label><input type="checkbox" id="al-darkModeAuto" ' + (darkModeAuto ? 'checked' : '') + '> 自动适配暗黑模式</label></div><div class="al-card"><label>控制面板透明度 (0.1-1): <input type="number" id="al-menuOpacity" value="' + menuOpacity + '" min="0.1" max="1" step="0.1" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>控制面板背景: <select id="al-menuBgColor" style="width: 200px; margin-left: 10px;"><option value="linear-gradient(to bottom, #ffffff, #f0f0f0)" ' + (menuBgColor === 'linear-gradient(to bottom, #ffffff, #f0f0f0)' ? 'selected' : '') + '>白色渐变</option><option value="linear-gradient(to bottom, #333, #222)" ' + (menuBgColor === 'linear-gradient(to bottom, #333, #222)' ? 'selected' : '') + '>黑色渐变</option><option value="linear-gradient(to bottom, #2196F3, #1976D2)" ' + (menuBgColor === 'linear-gradient(to bottom, #2196F3, #1976D2)' ? 'selected' : '') + '>蓝色渐变</option><option value="linear-gradient(to bottom, #4CAF50, #388E3C)" ' + (menuBgColor === 'linear-gradient(to bottom, #4CAF50, #388E3C)' ? 'selected' : '') + '>绿色渐变</option></select></label></div>';
                } else if (tab === 'filter') {
                    content.innerHTML = '<h3>过滤规则</h3><div class="al-card"><label>屏蔽用户 (QQ号,逗号分隔): <textarea id="al-blocked" style="width: 200px; height: 50px; margin-left: 10px;">' + blocked.join(',') + '</textarea></label></div><div class="al-card"><label>白名单用户 (QQ号,逗号分隔): <textarea id="al-whiteList" style="width: 200px; height: 50px; margin-left: 10px;">' + whiteList.join(',') + '</textarea></label></div><div class="al-card"><label>黑名单分组 (JSON): <textarea id="al-blockGroups" style="width: 200px; height: 100px; margin-left: 10px;">' + JSON.stringify(blockGroups) + '</textarea></label></div><div class="al-card"><label>动态关键词 (逗号分隔,支持正则): <textarea id="al-filterKeywords" style="width: 200px; height: 50px; margin-left: 10px;">' + filterKeywords.join(',') + '</textarea></label></div><div class="al-card"><label>过滤模式: <select id="al-filterMode"><option value="block" ' + (filterMode === 'block' ? 'selected' : '') + '>屏蔽关键词</option><option value="allow" ' + (filterMode === 'allow' ? 'selected' : '') + '>仅允许关键词</option></select></label></div><div class="al-card"><button id="al-import-block" style="background: #2196F3; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">导入黑名单</button> <input type="file" id="al-file-input" style="display:none;"><button id="al-export-block" style="background: #673AB7; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">导出黑名单</button></div>';
                    // 添加事件监听器在这里，确保元素存在
                    document.getElementById('al-import-block').addEventListener('click', function() {
                        document.getElementById('al-file-input').click();
                    });
                    document.getElementById('al-file-input').addEventListener('change', function(e) {
                        let file = e.target.files[0];
                        if (file) {
                            let reader = new FileReader();
                            reader.onload = function(ev) {
                                try {
                                    let data = safeJsonParse(ev.target.result);
                                    if (!data) {
                                        alert('导入失败: 文件格式无效');
                                        return;
                                    }
                                    blocked = data.blocked || [];
                                    blockGroups = data.blockGroups || {};
                                    whiteList = data.whiteList || [];
                                    showTab('filter');
                                    alert('导入成功');
                                } catch (err) {
                                    alert('导入失败: ' + err.message);
                                }
                            };
                            reader.readAsText(file);
                        }
                    });
                    document.getElementById('al-export-block').addEventListener('click', function() {
                        let data = { blocked: blocked, blockGroups: blockGroups, whiteList: whiteList };
                        download('blocklist.json', JSON.stringify(data));
                    });
                } else if (tab === 'adv') {
                    content.innerHTML = '<h3>高级参数</h3><div class="al-card"><label>最大重试次数: <input type="number" id="al-maxRetries" value="' + maxRetries + '" min="1" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>滚动步长百分比 (0.1-1): <input type="number" id="al-scrollStepPercent" value="' + scrollStepPercent + '" min="0.1" max="1" step="0.1" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>初始延迟 (毫秒): <input type="number" id="al-initialDelay" value="' + initialDelay + '" min="1000" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>随机延迟最小 (秒): <input type="number" id="al-randomDelayMin" value="' + randomDelayMin + '" min="0" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>随机延迟最大 (秒): <input type="number" id="al-randomDelayMax" value="' + randomDelayMax + '" min="0" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>日志级别: <select id="al-logLevel" style="width: 100px; margin-left: 10px;"><option value="INFO" ' + (logLevel === 'INFO' ? 'selected' : '') + '>INFO</option><option value="WARN" ' + (logLevel === 'WARN' ? 'selected' : '') + '>WARN</option><option value="ERROR" ' + (logLevel === 'ERROR' ? 'selected' : '') + '>ERROR</option></select></label></div><div class="al-card"><label><input type="checkbox" id="al-enableNotifications" ' + (enableNotifications ? 'checked' : '') + '> 启用浏览器通知</label></div>';
                } else if (tab === 'logs') {
                    content.innerHTML = '<h3>系统日志</h3><div id="al-log-list" style="height: 300px; overflow: auto; border: 1px solid #ddd; padding: 10px; background: #f9f9f9; font-family: monospace; white-space: pre-wrap;">' + (logs[currentAccount] || []).join('\n') + '</div><button id="al-clear-logs" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 10px; margin-right: 10px;">清除日志</button><button id="al-export-logs" style="background: #673AB7; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 10px;">导出日志</button>';
                    document.getElementById('al-clear-logs').addEventListener('click', function() {
                        logs[currentAccount] = [];
                        localStorage.setItem('al-logs', JSON.stringify(logs)); // 更新localStorage
                        showTab('logs');
                    });
                    document.getElementById('al-export-logs').addEventListener('click', function() {
                        download('al-logs-' + currentAccount + '.json', JSON.stringify(logs[currentAccount] || []));
                    });
                } else if (tab === 'stats') {
    let accStats = stats[currentAccount] || { likes: 0, skips: 0, errors: 0 };
    let total = accStats.likes + accStats.skips + accStats.errors;
    let successSum = accStats.likes + accStats.skips; // 成功=点赞+跳过
    let successRate = total > 0 ? Math.round((successSum / total) * 100) + '%' : 'N/A';
    
    // 创建更美观的统计卡片和图表容器
    content.innerHTML = `
        <h3 style="margin-bottom: 20px; color: #333; font-weight: 600;">性能统计</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
            <div style="flex: 1; min-width: 120px; background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 14px; opacity: 0.9;">成功点赞</div>
                <div style="font-size: 24px; font-weight: bold; margin: 5px 0;">${accStats.likes}</div>
            </div>
            <div style="flex: 1; min-width: 120px; background: linear-gradient(135deg, #FFC107, #FF8F00); color: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 14px; opacity: 0.9;">已跳过</div>
                <div style="font-size: 24px; font-weight: bold; margin: 5px 0;">${accStats.skips}</div>
            </div>
            <div style="flex: 1; min-width: 120px; background: linear-gradient(135deg, #F44336, #C62828); color: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 14px; opacity: 0.9;">错误数</div>
                <div style="font-size: 24px; font-weight: bold; margin: 5px 0;">${accStats.errors}</div>
            </div>
            <div style="flex: 1; min-width: 120px; background: linear-gradient(135deg, #2196F3, #1565C0); color: white; padding: 15px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 14px; opacity: 0.9;">成功率（点赞+跳过）</div>
                <div style="font-size: 24px; font-weight: bold; margin: 5px 0;">${successRate}</div>
            </div>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 20px;">
            <div style="background: white; border-radius: 10px; padding: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <h4 style="margin-top: 0; margin-bottom: 15px; color: #333;">点赞分布</h4>
                <div style="height: 200px; position: relative;">
                    <canvas id="al-pie-chart" width="100%" height="100%"></canvas>
                </div>
            </div>
            
            <div style="background: white; border-radius: 10px; padding: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <h4 style="margin-top: 0; margin-bottom: 15px; color: #333;">历史趋势</h4>
                <div style="height: 200px; position: relative;">
                    <div id="al-trend-placeholder" style="display: flex; justify-content: center; align-items: center; height: 100%; color: #999;">
                        历史数据将在未来版本中显示
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: flex; justify-content: center; gap: 10px;">
            <button id="al-clear-stats" style="background: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: all 0.2s;">清除统计</button>
            <button id="al-export-stats" style="background: #673AB7; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: all 0.2s;">导出数据</button>
        </div>
    `;
    
    // 绘制饼图
    const pieCtx = document.getElementById('al-pie-chart').getContext('2d');
    drawPieChart(pieCtx, [
        { value: accStats.likes, color: '#4CAF50', label: '成功点赞' },
        { value: accStats.skips, color: '#FFC107', label: '已跳过' },
        { value: accStats.errors, color: '#F44336', label: '错误' }
    ]);
    
    // 添加事件监听器
    document.getElementById('al-clear-stats').addEventListener('click', function() {
        if (confirm('确定要清除所有统计数据吗？此操作不可撤销。')) {
            stats[currentAccount] = { likes: 0, skips: 0, errors: 0 };
            localStorage.setItem('al-stats', JSON.stringify(stats));
            showTab('stats');
        }
    });
    
    document.getElementById('al-export-stats').addEventListener('click', function() {
        const dataStr = JSON.stringify(stats[currentAccount], null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'qzone-stats-' + currentAccount + '.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });
                } else if (tab === 'accounts') {
                    let accountList = Object.keys(accounts).join(', ');
                    content.innerHTML = '<h3>账号管理</h3><div class="al-card"><label>当前账号: ' + currentAccount + '</label></div><div class="al-card"><label>切换账号 (输入QQ号): <input type="text" id="al-switchAcc" style="width: 150px; margin-left: 10px;"></label><button id="al-switch" style="background: #2196F3; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-left: 10px;">切换</button></div><div class="al-card">可用账号: ' + accountList + '</div>';
                    document.getElementById('al-switch').addEventListener('click', function() {
                        let newAcc = document.getElementById('al-switchAcc').value.trim();
                        if (newAcc) {
                            loadAccountConfig(newAcc);
                            updateStatusBar('切换到账号: ' + newAcc);
                            showTab('accounts');
                        }
                    });
                }
                content.style.opacity = '1';
            }, 300);
        }

        // 标签切换事件
        document.getElementById('al-tab-core').addEventListener('click', function() { showTab('core'); });
        document.getElementById('al-tab-ui').addEventListener('click', function() { showTab('ui'); });
        document.getElementById('al-tab-filter').addEventListener('click', function() { showTab('filter'); });
        document.getElementById('al-tab-adv').addEventListener('click', function() { showTab('adv'); });
        document.getElementById('al-tab-logs').addEventListener('click', function() { showTab('logs'); });
        document.getElementById('al-tab-stats').addEventListener('click', function() { showTab('stats'); });
        document.getElementById('al-tab-accounts').addEventListener('click', function() { showTab('accounts'); });

        // 保存按钮
        document.getElementById('al-save').addEventListener('click', function() {
            try {
                // 获取控制面板中的值
                if (document.getElementById('al-dur')) duration = parseInt(document.getElementById('al-dur').value) || duration;
                if (document.getElementById('al-rdelay')) refreshDelay = parseInt(document.getElementById('al-rdelay').value) || refreshDelay;
                if (document.getElementById('al-ldelay')) likeDelay = parseInt(document.getElementById('al-ldelay').value) || likeDelay;
                if (document.getElementById('al-scount')) scrollCount = parseInt(document.getElementById('al-scount').value) || scrollCount;
                if (document.getElementById('al-dailyLimit')) dailyLimit = parseInt(document.getElementById('al-dailyLimit').value) || dailyLimit;
                if (document.getElementById('al-select')) select = document.getElementById('al-select').checked;
                if (document.getElementById('al-theme')) theme = document.getElementById('al-theme').value;
                if (document.getElementById('al-themeHue')) themeHue = parseInt(document.getElementById('al-themeHue').value) || themeHue;
                if (document.getElementById('al-statusOpacity')) statusOpacity = parseFloat(document.getElementById('al-statusOpacity').value) || statusOpacity;
                if (document.getElementById('al-statusBgColor')) statusBgColor = document.getElementById('al-statusBgColor').value;
                if (document.getElementById('al-statusTextColor')) statusTextColor = document.getElementById('al-statusTextColor').value;
                if (document.getElementById('al-statusTextBrightness')) statusTextBrightness = parseFloat(document.getElementById('al-statusTextBrightness').value) || statusTextBrightness;
                if (document.getElementById('al-darkModeAuto')) darkModeAuto = document.getElementById('al-darkModeAuto').checked;
                if (document.getElementById('al-menuOpacity')) menuOpacity = parseFloat(document.getElementById('al-menuOpacity').value) || menuOpacity;
                if (document.getElementById('al-menuBgColor')) menuBgColor = document.getElementById('al-menuBgColor').value;
                if (document.getElementById('al-blocked')) blocked = document.getElementById('al-blocked').value.split(',').map(s => s.trim()).filter(s => s);
                if (document.getElementById('al-whiteList')) whiteList = document.getElementById('al-whiteList').value.split(',').map(s => s.trim()).filter(s => s);
                if (document.getElementById('al-blockGroups')) blockGroups = safeJsonParse(document.getElementById('al-blockGroups').value) || blockGroups;
                if (document.getElementById('al-filterKeywords')) filterKeywords = document.getElementById('al-filterKeywords').value.split(',').map(s => s.trim()).filter(s => s);
                if (document.getElementById('al-filterMode')) filterMode = document.getElementById('al-filterMode').value;
                if (document.getElementById('al-maxRetries')) maxRetries = parseInt(document.getElementById('al-maxRetries').value) || maxRetries;
                if (document.getElementById('al-scrollStepPercent')) scrollStepPercent = parseFloat(document.getElementById('al-scrollStepPercent').value) || scrollStepPercent;
                if (document.getElementById('al-initialDelay')) initialDelay = parseInt(document.getElementById('al-initialDelay').value) || initialDelay;
                if (document.getElementById('al-randomDelayMin')) randomDelayMin = parseInt(document.getElementById('al-randomDelayMin').value) || randomDelayMin;
                if (document.getElementById('al-randomDelayMax')) randomDelayMax = parseInt(document.getElementById('al-randomDelayMax').value) || randomDelayMax;
                if (document.getElementById('al-logLevel')) logLevel = document.getElementById('al-logLevel').value;
                if (document.getElementById('al-enableNotifications')) enableNotifications = document.getElementById('al-enableNotifications').checked;
                if (document.getElementById('al-enableLoginCheck')) enableLoginCheck = document.getElementById('al-enableLoginCheck').checked;
                if (document.getElementById('al-enableAutoRelogin')) enableAutoRelogin = document.getElementById('al-enableAutoRelogin').checked;
                if (document.getElementById('al-smartLikeMode')) smartLikeMode = document.getElementById('al-smartLikeMode').value;

                // 保存到cookie
                setCookie('al-duration', duration, Number.MAX_SAFE_INTEGER);
                setCookie('al-refreshDelay', refreshDelay, Number.MAX_SAFE_INTEGER);
                setCookie('al-likeDelay', likeDelay, Number.MAX_SAFE_INTEGER);
                setCookie('al-scrollCount', scrollCount, Number.MAX_SAFE_INTEGER);
                setCookie('al-blocked', blocked.join(','), Number.MAX_SAFE_INTEGER);
                setCookie('al-whiteList', whiteList.join(','), Number.MAX_SAFE_INTEGER);
                setCookie('al-blockGroups', JSON.stringify(blockGroups), Number.MAX_SAFE_INTEGER);
                setCookie('al-filterKeywords', filterKeywords.join(','), Number.MAX_SAFE_INTEGER);
                setCookie('al-filterMode', filterMode, Number.MAX_SAFE_INTEGER);
                setCookie('al-smartLikeMode', smartLikeMode, Number.MAX_SAFE_INTEGER);
                setCookie('al-dailyLimit', dailyLimit, Number.MAX_SAFE_INTEGER);
                setCookie('al-select', select ? 'true' : '', Number.MAX_SAFE_INTEGER);
                setCookie('al-theme', theme, Number.MAX_SAFE_INTEGER);
                setCookie('al-statusOpacity', statusOpacity, Number.MAX_SAFE_INTEGER);
                setCookie('al-statusBgColor', statusBgColor, Number.MAX_SAFE_INTEGER);
                setCookie('al-statusTextColor', statusTextColor, Number.MAX_SAFE_INTEGER);
                setCookie('al-statusTextBrightness', statusTextBrightness, Number.MAX_SAFE_INTEGER);
                setCookie('al-darkModeAuto', darkModeAuto ? 'true' : '', Number.MAX_SAFE_INTEGER);
                setCookie('al-menuOpacity', menuOpacity, Number.MAX_SAFE_INTEGER);
                setCookie('al-menuBgColor', menuBgColor, Number.MAX_SAFE_INTEGER);
                setCookie('al-maxRetries', maxRetries, Number.MAX_SAFE_INTEGER);
                setCookie('al-scrollStepPercent', scrollStepPercent, Number.MAX_SAFE_INTEGER);
                setCookie('al-initialDelay', initialDelay, Number.MAX_SAFE_INTEGER);
                setCookie('al-randomDelayMin', randomDelayMin, Number.MAX_SAFE_INTEGER);
                setCookie('al-randomDelayMax', randomDelayMax, Number.MAX_SAFE_INTEGER);
                setCookie('al-logLevel', logLevel, Number.MAX_SAFE_INTEGER);
                setCookie('al-enableNotifications', enableNotifications ? 'true' : '', Number.MAX_SAFE_INTEGER);
                setCookie('al-enableLoginCheck', enableLoginCheck ? 'true' : '', Number.MAX_SAFE_INTEGER);
                setCookie('al-themeHue', themeHue, Number.MAX_SAFE_INTEGER);
                setCookie('al-enableAutoRelogin', enableAutoRelogin ? 'true' : '', Number.MAX_SAFE_INTEGER);

                // 更新UI元素
                let menuElem = document.getElementById('al-menu');
                if (menuElem) {
                    menuElem.style.opacity = menuOpacity;
                    menuElem.style.background = menuBgColor;
                    menuElem.style.filter = 'hue-rotate(' + themeHue + 'deg)';
                }
                
                let statusBar = document.getElementById('al-status-bar');
                if (statusBar) {
                    statusBar.style.opacity = statusOpacity;
                    statusBar.style.background = statusBgColor;
                    statusBar.style.color = statusTextColor;
                    statusBar.style.filter = 'brightness(' + statusTextBrightness + ') hue-rotate(' + themeHue + 'deg)';
                }

                // 应用暗黑模式和保存账户配置
                applyDarkMode();
                saveAccountConfig();
                updateStatusBar('设置已保存');
                
                // 保存成功提示
                alert('设置已保存');
                log('INFO', '设置已保存');
            } catch (e) {
                log('ERROR', '保存设置失败: ' + e.message);
                alert('保存设置失败: ' + e.message);
            }
        });

        

        // 测试执行
        document.getElementById('al-test').addEventListener('click', function() {
            testMode = true;
            executeWorkflow();
            testMode = false;
        });

        // 重置默认
        document.getElementById('al-reset').addEventListener('click', function() {
            // 重置变量到默认
            duration = 180;
            refreshDelay = 10;
            likeDelay = 5;
            scrollCount = 3;
            blocked = [];
            whiteList = [];
            blockGroups = {};
            filterKeywords = [];
            filterMode = 'block';
            dailyLimit = 0;
            select = false;
            theme = 'default';
            themeHue = 0;
            statusOpacity = 0.8;
            statusBgColor = 'linear-gradient(to right, #333, #222)';
            statusTextColor = '#ddd';
            statusTextBrightness = 1.0;
            darkModeAuto = true;
            menuOpacity = 0.9;
            menuBgColor = 'linear-gradient(to bottom, #ffffff, #f0f0f0)';
            maxRetries = 3;
            scrollStepPercent = 0.9;
            initialDelay = 3000;
            randomDelayMin = 1;
            randomDelayMax = 3;
            logLevel = 'INFO';
            enableNotifications = false;
            enableLoginCheck = true;
            enableAutoRelogin = false;

            // 清空cookie
            ['al-duration', 'al-refreshDelay', 'al-likeDelay', 'al-scrollCount', 'al-blocked', 'al-whiteList', 'al-blockGroups', 'al-filterKeywords', 'al-filterMode', 'al-dailyLimit', 'al-select', 'al-theme', 'al-themeHue', 'al-statusOpacity', 'al-statusBgColor', 'al-statusTextColor', 'al-statusTextBrightness', 'al-darkModeAuto', 'al-menuOpacity', 'al-menuBgColor', 'al-maxRetries', 'al-scrollStepPercent', 'al-initialDelay', 'al-randomDelayMin', 'al-randomDelayMax', 'al-logLevel', 'al-enableNotifications', 'al-enableLoginCheck', 'al-enableAutoRelogin'].forEach(function(key) {
                setCookie(key, '', -1);
            });

            updateStatusBar('设置已重置');
            showTab(document.querySelector('[id^="al-tab-"]').id.replace('al-tab-', ''));
        });

        // 导出配置
        document.getElementById('al-export').addEventListener('click', function() {
            let config = {
                duration: duration, refreshDelay: refreshDelay, likeDelay: likeDelay, scrollCount: scrollCount, blocked: blocked, whiteList: whiteList, blockGroups: blockGroups, filterKeywords: filterKeywords, filterMode: filterMode, dailyLimit: dailyLimit, select: select, theme: theme, themeHue: themeHue, statusOpacity: statusOpacity, statusBgColor: statusBgColor, statusTextColor: statusTextColor, statusTextBrightness: statusTextBrightness, darkModeAuto: darkModeAuto, menuOpacity: menuOpacity, menuBgColor: menuBgColor, maxRetries: maxRetries, scrollStepPercent: scrollStepPercent, initialDelay: initialDelay, randomDelayMin: randomDelayMin, randomDelayMax: randomDelayMax, logLevel: logLevel, enableNotifications: enableNotifications, enableLoginCheck: enableLoginCheck, enableAutoRelogin: enableAutoRelogin
            };
            download('al-config.json', JSON.stringify(config));
        });

        // 备份配置（到localStorage）
        document.getElementById('al-backup').addEventListener('click', function() {
            let config = {
                duration: duration, refreshDelay: refreshDelay, likeDelay: likeDelay, scrollCount: scrollCount, blocked: blocked, whiteList: whiteList, blockGroups: blockGroups, filterKeywords: filterKeywords, filterMode: filterMode, dailyLimit: dailyLimit, select: select, theme: theme, themeHue: themeHue, statusOpacity: statusOpacity, statusBgColor: statusBgColor, statusTextColor: statusTextColor, statusTextBrightness: statusTextBrightness, darkModeAuto: darkModeAuto, menuOpacity: menuOpacity, menuBgColor: menuBgColor, maxRetries: maxRetries, scrollStepPercent: scrollStepPercent, initialDelay: initialDelay, randomDelayMin: randomDelayMin, randomDelayMax: randomDelayMax, logLevel: logLevel, enableNotifications: enableNotifications, enableLoginCheck: enableLoginCheck, enableAutoRelogin: enableAutoRelogin
            };
            localStorage.setItem('al-backup', JSON.stringify(config));
            alert('配置已备份');
        });

        // 恢复配置
        document.getElementById('al-restore').addEventListener('click', function() {
            let backup = safeJsonParse(localStorage.getItem('al-backup'));
            if (backup) {
                duration = backup.duration;
                refreshDelay = backup.refreshDelay;
                likeDelay = backup.likeDelay;
                scrollCount = backup.scrollCount;
                blocked = backup.blocked;
                whiteList = backup.whiteList;
                blockGroups = backup.blockGroups;
                filterKeywords = backup.filterKeywords;
                filterMode = backup.filterMode;
                dailyLimit = backup.dailyLimit;
                select = backup.select;
                theme = backup.theme;
                themeHue = backup.themeHue;
                statusOpacity = backup.statusOpacity;
                statusBgColor = backup.statusBgColor;
                statusTextColor = backup.statusTextColor;
                statusTextBrightness = backup.statusTextBrightness;
                darkModeAuto = backup.darkModeAuto;
                menuOpacity = backup.menuOpacity;
                menuBgColor = backup.menuBgColor;
                maxRetries = backup.maxRetries;
                scrollStepPercent = backup.scrollStepPercent;
                initialDelay = backup.initialDelay;
                randomDelayMin = backup.randomDelayMin;
                randomDelayMax = backup.randomDelayMax;
                logLevel = backup.logLevel;
                enableNotifications = backup.enableNotifications;
                enableLoginCheck = backup.enableLoginCheck;
                enableAutoRelogin = backup.enableAutoRelogin;

                alert('配置已恢复');
                showTab(document.querySelector('[id^="al-tab-"]').id.replace('al-tab-', ''));
            } else {
                alert('无备份可用');
            }
        });

        // 关闭菜单
        document.getElementById('al-close').addEventListener('click', function() {
            hideMenu();
        });

        log('INFO', '菜单加载完成');
    }

    // 下载函数
    function download(filename, text) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // 创建浮动按钮
    function createFloatButton() {
        let btn = document.createElement('div');
        btn.id = 'al-float-btn';
        btn.style.position = 'fixed';
        btn.style.top = '20px';
        btn.style.right = '20px';
        btn.style.background = '#2196F3';
        btn.style.color = 'white';
        btn.style.padding = '10px 15px';
        btn.style.borderRadius = '50px';
        btn.style.cursor = 'pointer';
        // 层级：按钮 < 面板(2147483647)；按钮 > 状态栏(2147483646)
        btn.style.zIndex = '2147483647';
        btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        btn.style.transition = 'background 0.2s';
        btn.innerText = 'AL Menu';
        
        // 安全的DOM插入，处理QQ空间的domain变化
        function safeAppendFloatButton() {
            try {
                if (document.body && !document.getElementById('al-float-btn')) {
                    document.body.appendChild(btn);
                    console.log('[AL] 浮动按钮已成功插入DOM');
                    return true;
                }
            } catch (e) {
                console.warn('[AL] 浮动按钮DOM插入失败:', e.message);
                return false;
            }
            return false;
        }

        // 立即尝试插入
        if (!safeAppendFloatButton()) {
            // 兜底1：等待 DOMContentLoaded
            document.addEventListener('DOMContentLoaded', function () {
                if (!safeAppendFloatButton()) {
                    // 兜底2：延迟插入
                    setTimeout(function() {
                        safeAppendFloatButton();
                    }, 1000);
                }
            });
            
            // 兜底3：监听body变化
            if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver(function(mutations) {
                    if (document.body && !document.getElementById('al-float-btn')) {
                        if (safeAppendFloatButton()) {
                            observer.disconnect();
                        }
                    }
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });
            }
        }

        // 根据状态栏高度动态下移，避免被遮挡
        const adjustByStatusBar = () => {
            const sb = document.getElementById('al-status-bar');
            if (sb) {
                const h = sb.offsetHeight || 48;
                btn.style.top = (h + 12) + 'px';
            } else {
                btn.style.top = '20px';
            }
        };
        // 初始化与窗口尺寸变化时调整
        adjustByStatusBar();
        window.addEventListener('resize', adjustByStatusBar);

        btn.addEventListener('click', function() {
            // 统一入口：直接调用全局 showMenu()
            if (typeof window.showMenu === 'function') {
                window.showMenu();
            } else if (typeof unsafeWindow !== 'undefined' && typeof unsafeWindow.showMenu === 'function') {
                unsafeWindow.showMenu();
            } else {
                const menu = document.getElementById('al-menu');
                if (!menu) return;
                menu.style.display = 'block';
                setTimeout(function() {
                    menu.classList.add('visible');
                    const coreTab = document.getElementById('al-tab-core');
                    if (coreTab) coreTab.click();
                }, 10);
            }
        });
    }

    // 加载账号配置
    function loadAccountConfig(acc) {
        let config = accounts[acc];
        if (config) {
            duration = config.duration;
            refreshDelay = config.refreshDelay;
            likeDelay = config.likeDelay;
            scrollCount = config.scrollCount;
            blocked = config.blocked;
            whiteList = config.whiteList;
            blockGroups = config.blockGroups;
            filterKeywords = config.filterKeywords;
            filterMode = config.filterMode;
            dailyLimit = config.dailyLimit;
            select = config.select;
            theme = config.theme;
            themeHue = config.themeHue;
            statusOpacity = config.statusOpacity;
            statusBgColor = config.statusBgColor;
            statusTextColor = config.statusTextColor;
            statusTextBrightness = config.statusTextBrightness;
            darkModeAuto = config.darkModeAuto;
            menuOpacity = config.menuOpacity;
            menuBgColor = config.menuBgColor;
            maxRetries = config.maxRetries;
            scrollStepPercent = config.scrollStepPercent;
            initialDelay = config.initialDelay;
            randomDelayMin = config.randomDelayMin;
            randomDelayMax = config.randomDelayMax;
            logLevel = config.logLevel;
            enableNotifications = config.enableNotifications;
            enableLoginCheck = config.enableLoginCheck;
            enableAutoRelogin = config.enableAutoRelogin; // 新增
            stats[acc] = config.stats || { likes: 0, skips: 0, errors: 0 };
            logs[acc] = config.logs || []; // 注意：logs现在从localStorage加载，但可以合并如果config有
            currentAccount = acc;
            updateStatusBar();
        } else {
            // 默认配置
            accounts[acc] = { duration: 180, refreshDelay: 10, likeDelay: 5, scrollCount: 3, blocked: [], whiteList: [], blockGroups: {}, filterKeywords: [], filterMode: 'block', dailyLimit: 0, select: false, theme: 'default', themeHue: 0, darkModeAuto: true, statusOpacity: 0.8, statusBgColor: 'linear-gradient(to right, #333, #222)', statusTextColor: '#ddd', statusTextBrightness: 1.0, menuOpacity: 0.9, menuBgColor: 'linear-gradient(to bottom, #ffffff, #f0f0f0)', maxRetries: 3, scrollStepPercent: 0.9, initialDelay: 3000, randomDelayMin: 1, randomDelayMax: 3, logLevel: 'INFO', enableNotifications: false, enableLoginCheck: true, enableAutoRelogin: false, stats: { likes: 0, skips: 0, errors: 0 }, logs: [] };
            currentAccount = acc;
        }
    }

    function saveAccountConfig() {
        accounts[currentAccount] = {
            duration: duration, refreshDelay: refreshDelay, likeDelay: likeDelay, scrollCount: scrollCount, blocked: blocked, whiteList: whiteList, blockGroups: blockGroups, filterKeywords: filterKeywords, filterMode: filterMode, dailyLimit: dailyLimit, select: select, theme: theme, themeHue: themeHue, statusOpacity: statusOpacity, statusBgColor: statusBgColor, statusTextColor: statusTextColor, statusTextBrightness: statusTextBrightness, darkModeAuto: darkModeAuto, menuOpacity: menuOpacity, menuBgColor: menuBgColor, maxRetries: maxRetries, scrollStepPercent: scrollStepPercent, initialDelay: initialDelay, randomDelayMin: randomDelayMin, randomDelayMax: randomDelayMax, logLevel: logLevel, enableNotifications: enableNotifications, enableLoginCheck: enableLoginCheck, enableAutoRelogin: enableAutoRelogin, stats: stats[currentAccount], logs: logs[currentAccount]
        };
        setCookie('al-accounts', JSON.stringify(accounts), Number.MAX_SAFE_INTEGER);
    }

    // 自动暗黑模式（增强兼容性）
    function applyDarkMode() {
        if (!darkModeAuto) return;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            statusBgColor = 'linear-gradient(to right, #333, #222)';
            statusTextColor = '#ddd';
            menuBgColor = 'linear-gradient(to bottom, #333, #222)';
        } else {
            statusBgColor = 'linear-gradient(to right, #f0f0f0, #e0e0e0)';
            statusTextColor = '#333';
            menuBgColor = 'linear-gradient(to bottom, #ffffff, #f0f0f0)';
        }
        let statusBar = document.getElementById('al-status-bar');
        if (statusBar) {
            statusBar.style.background = statusBgColor;
            statusBar.style.color = statusTextColor;
        }
        let menuElem = document.getElementById('al-menu');
        if (menuElem) {
            menuElem.style.background = menuBgColor;
        }
        // 应用到其他元素如果需要
    }

    // 创建状态栏（简化版本，确保在QQ空间中稳定工作）
    function createStatusBar() {
        console.log('[AL] 开始创建状态栏...');
        
        // 检查是否已存在
        if (document.getElementById('al-status-bar')) {
            console.log('[AL] 状态栏已存在，跳过创建');
            return;
        }
        
        // 优化的CSS样式，增强文字可读性和对比度
        const styleEl = document.createElement('style');
        
        // 智能计算文字颜色，确保与背景有足够对比度
        function getOptimalTextColor(bgColor) {
            // 统一的颜色解析和亮度计算函数
            function parseColorAndGetLuminance(colorStr) {
                let r, g, b;
                
                // 解析十六进制颜色
                if (colorStr.startsWith('#')) {
                    const hex = colorStr.replace('#', '');
                    if (hex.length === 3) {
                        r = parseInt(hex[0] + hex[0], 16);
                        g = parseInt(hex[1] + hex[1], 16);
                        b = parseInt(hex[2] + hex[2], 16);
                    } else {
                        r = parseInt(hex.substr(0, 2), 16);
                        g = parseInt(hex.substr(2, 2), 16);
                        b = parseInt(hex.substr(4, 2), 16);
                    }
                }
                // 解析RGB颜色
                else if (colorStr.startsWith('rgb')) {
                    const matches = colorStr.match(/\d+/g);
                    r = parseInt(matches[0]);
                    g = parseInt(matches[1]);
                    b = parseInt(matches[2]);
                }
                // 处理颜色名称
                else if (colorStr.includes('white') || colorStr.includes('#fff')) {
                    r = g = b = 255;
                } else if (colorStr.includes('black') || colorStr.includes('#000')) {
                    r = g = b = 0;
                } else {
                    return 0.5; // 默认中等亮度
                }
                
                // 计算相对亮度（WCAG标准）
                const rs = r / 255, gs = g / 255, bs = b / 255;
                const rLin = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
                const gLin = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
                const bLin = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
                
                return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
            }
            
            // 提取所有颜色并计算平均亮度
            const colorMatches = [
                ...(bgColor.match(/#[0-9a-fA-F]{3,6}/g) || []),
                ...(bgColor.match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g) || [])
            ];
            
            let avgLuminance = 0.5;
            if (colorMatches.length > 0) {
                const luminances = colorMatches.map(parseColorAndGetLuminance);
                avgLuminance = luminances.reduce((sum, lum) => sum + lum, 0) / luminances.length;
            }
            
            // 根据亮度选择文字颜色，确保足够的对比度
            if (avgLuminance > 0.5) {
                return '#333333'; // 背景亮，使用深色文字
            } else {
                return '#ffffff'; // 背景暗，使用白色文字
            }
        }
        
        const optimalTextColor = statusTextColor === 'auto' ? getOptimalTextColor(statusBgColor) : statusTextColor;
        
        styleEl.textContent = `
            #al-status-bar {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 52px !important;
                background: ${statusBgColor} !important;
                color: ${optimalTextColor} !important;
                opacity: ${statusOpacity} !important;
                padding: 14px 24px !important;
                z-index: 2147483646 !important;
                font-family: 'Microsoft YaHei', Arial, sans-serif !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                box-shadow: 0 3px 8px rgba(0,0,0,0.4) !important;
                border-bottom: 2px solid rgba(255,255,255,0.1) !important;
                backdrop-filter: blur(8px) !important;
                -webkit-backdrop-filter: blur(8px) !important;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
                line-height: 1.4 !important;
            }
            
            #al-status-bar .al-status-left {
                display: flex !important;
                align-items: center !important;
                gap: 20px !important;
                flex: 1 !important;
            }
            
            #al-status-bar .al-status-right {
                display: flex !important;
                align-items: center !important;
                gap: 15px !important;
                flex-shrink: 0 !important;
            }
            
            #al-status-bar .al-status-item {
                display: inline-block !important;
                padding: 2px 8px !important;
                border-radius: 4px !important;
                background: rgba(255,255,255,0.1) !important;
                backdrop-filter: blur(4px) !important;
                -webkit-backdrop-filter: blur(4px) !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                font-weight: 500 !important;
                text-shadow: 0 1px 2px rgba(0,0,0,0.7) !important;
                white-space: nowrap !important;
            }
            
            #al-status-bar .al-status-item.highlight {
                background: rgba(255,255,255,0.2) !important;
                border: 1px solid rgba(255,255,255,0.3) !important;
                font-weight: 600 !important;
            }
            
            #al-status-bar .al-progress-bar {
                width: 120px !important;
                height: 4px !important;
                background: rgba(255,255,255,0.2) !important;
                border-radius: 2px !important;
                overflow: hidden !important;
                margin: 0 8px !important;
            }
            
            #al-status-bar .al-progress-fill {
                 height: 100% !important;
                 background: linear-gradient(90deg, #4CAF50, #8BC34A) !important;
                 border-radius: 2px !important;
                 transition: width 0.3s ease !important;
                 box-shadow: 0 0 4px rgba(76, 175, 80, 0.5) !important;
             }
             
             /* 不同状态的样式 */
             #al-status-bar.al-status-running {
                 border-left: 4px solid #4CAF50 !important;
             }
             
             #al-status-bar.al-status-running .al-progress-fill {
                 background: linear-gradient(90deg, #4CAF50, #8BC34A) !important;
                 box-shadow: 0 0 6px rgba(76, 175, 80, 0.6) !important;
             }
             
             #al-status-bar.al-status-paused {
                 border-left: 4px solid #FF9800 !important;
             }
             
             #al-status-bar.al-status-paused .al-progress-fill {
                 background: linear-gradient(90deg, #FF9800, #FFC107) !important;
                 box-shadow: 0 0 6px rgba(255, 152, 0, 0.6) !important;
             }
             
             #al-status-bar.al-status-ready {
                 border-left: 4px solid #2196F3 !important;
             }
             
             #al-status-bar.al-status-ready .al-progress-fill {
                 background: linear-gradient(90deg, #2196F3, #03A9F4) !important;
                 box-shadow: 0 0 6px rgba(33, 150, 243, 0.6) !important;
             }
             
             /* 状态指示动画 */
             #al-status-bar.al-status-running .al-status-item.highlight::after {
                 content: '' !important;
                 display: inline-block !important;
                 width: 8px !important;
                 height: 8px !important;
                 background: #4CAF50 !important;
                 border-radius: 50% !important;
                 margin-left: 8px !important;
                 animation: pulse 1.5s infinite !important;
             }
             
             #al-status-bar.al-status-paused .al-status-item.highlight::after {
                 content: '' !important;
                 display: inline-block !important;
                 width: 8px !important;
                 height: 8px !important;
                 background: #FF9800 !important;
                 border-radius: 50% !important;
                 margin-left: 8px !important;
             }
             
             @keyframes pulse {
                 0% { opacity: 1; transform: scale(1); }
                 50% { opacity: 0.5; transform: scale(1.2); }
                 100% { opacity: 1; transform: scale(1); }
             }
             
        `;
        
        try {
            document.head.appendChild(styleEl);
            console.log('[AL] 状态栏CSS样式已添加');
        } catch (e) {
            console.warn('[AL] 添加CSS样式失败:', e.message);
        }
        
        // 创建状态栏元素
        const statusBar = document.createElement('div');
        statusBar.id = 'al-status-bar';
        
        // 创建左侧内容
        const leftSection = document.createElement('div');
        leftSection.className = 'al-status-left';
        leftSection.innerHTML = `
            <span class="al-status-item">🚀 QZone点赞助手</span>
            <span class="al-status-item" id="al-status-text">就绪</span>
        `;
        
        // 创建右侧内容
        const rightSection = document.createElement('div');
        rightSection.className = 'al-status-right';
        rightSection.innerHTML = `
            <span class="al-status-item" id="al-current-time">${new Date().toLocaleTimeString()}</span>
            <span class="al-status-item" id="al-stats-display">0/0/0</span>
        `;
        
        statusBar.appendChild(leftSection);
        statusBar.appendChild(rightSection);
        
        // 更新时间显示
        timeUpdateInterval = setInterval(() => {
            const timeEl = document.getElementById('al-current-time');
            if (timeEl) {
                timeEl.textContent = new Date().toLocaleTimeString();
            }
        }, 1000);
        
        console.log('[AL] 状态栏元素已创建');
        
        // 安全的DOM插入，处理QQ空间的domain变化
        function safeAppendStatusBar() {
            try {
                if (document.body && !document.getElementById('al-status-bar')) {
                    document.body.appendChild(statusBar);
                    console.log('[AL] 状态栏已成功插入DOM');
                    return true;
                }
            } catch (e) {
                console.warn('[AL] DOM插入失败:', e.message);
                return false;
            }
            return false;
        }

        // 立即尝试插入
        if (!safeAppendStatusBar()) {
            // 兜底1：等待 DOMContentLoaded
            document.addEventListener('DOMContentLoaded', function () {
                if (!safeAppendStatusBar()) {
                    // 兜底2：延迟插入，处理QQ空间的异步加载
                    setTimeout(function() {
                        safeAppendStatusBar();
                    }, 1000);
                }
            });
            
            // 兜底3：监听body变化
            if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver(function(mutations) {
                    if (document.body && !document.getElementById('al-status-bar')) {
                        if (safeAppendStatusBar()) {
                            observer.disconnect();
                        }
                    }
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });
            }
        }

        // 点击展开/折叠显示更多信息（默认紧凑，仅展开时显示第二行）
        statusBar.addEventListener('click', function() {
            this.classList.toggle('expanded');
            updateStatusBar();
        });
        
        // 添加微交互
        addRippleEffect(statusBar);
        addHoverEffect(statusBar, '1.01');
        addClickFeedback(statusBar);

        statusUpdateInterval = setInterval(updateStatusBar, 1000);
        updateStatusBar();

        log('INFO', '状态栏加载完成');
    }

    // 更新状态栏（增强版：显示详细任务进度、可视化进度条、统计信息）
    function updateStatusBar(message) {
        resetDailyCount();
        duration = parseInt(getCookie('al-duration')) || duration;
        refreshDelay = parseInt(getCookie('al-refreshDelay')) || refreshDelay;
        likeDelay = parseInt(getCookie('al-likeDelay')) || likeDelay;
        scrollCount = parseInt(getCookie('al-scrollCount')) || scrollCount;

        let statusBar = document.getElementById('al-status-bar');
        if (!statusBar) {
            try {
                createStatusBar();
                statusBar = document.getElementById('al-status-bar');
            } catch (e) {
                log('ERROR', '状态栏重建失败: ' + e.message);
                return;
            }
        }

        message = message || '';

        if (message) {
            log('INFO', '状态栏更新: ' + message);
        }

        // 计算任务进度和倒计时
        let currentTaskDisplay = '';
        let taskCountdown = '';
        let progressPercent = 0;
        let statusClass = '';
        
        if (currentTask && taskStartTime && taskDuration > 0) {
            let elapsed = Math.floor((Date.now() - taskStartTime) / 1000);
            let remaining = Math.max(0, taskDuration - elapsed);
            progressPercent = Math.min(100, Math.floor((elapsed / taskDuration) * 100));
            
            currentTaskDisplay = `${currentTask}`;
            taskCountdown = `${remaining}s`;
            statusClass = 'running';
        } else if (isPaused) {
            currentTaskDisplay = '已暂停';
            taskCountdown = '等待恢复';
            progressPercent = 0;
            statusClass = 'paused';
        } else if (isRunning) {
            currentTaskDisplay = '执行中';
            taskCountdown = '处理中';
            progressPercent = 50; // 显示中等进度
            statusClass = 'running';
        } else {
            currentTaskDisplay = '就绪';
            let nextRefreshSeconds = Math.max(0, Math.ceil((nextTime - Date.now()) / 1000));
            taskCountdown = `${nextRefreshSeconds}s`;
            progressPercent = 0;
            statusClass = 'ready';
        }

        // 构建详细的状态信息
        const dailyProgress = dailyLimit > 0 ? `${dailyCount}/${dailyLimit}` : `${dailyCount}`;
        const accStatsForRate = stats[currentAccount] || { likes: 0, skips: 0, errors: 0 };
        const totalActions = accStatsForRate.likes + accStatsForRate.skips + accStatsForRate.errors;
        const successRate = totalActions > 0 ? Math.round(((accStatsForRate.likes + accStatsForRate.skips) / totalActions) * 100) : 100;
        
        // 计算任务倒计时信息
        let taskCountdownInfo = '';
        if (currentTask && taskStartTime && taskDuration > 0) {
            let elapsed = Math.floor((Date.now() - taskStartTime) / 1000);
            let remaining = Math.max(0, taskDuration - elapsed);
            taskCountdownInfo = `当前任务剩余: ${remaining}s`;
        } else if (isPaused) {
            taskCountdownInfo = '已暂停 - 等待恢复';
        } else if (isRunning) {
            taskCountdownInfo = '正在执行任务';
        } else {
            let nextRefreshSeconds = Math.max(0, Math.ceil((nextTime - Date.now()) / 1000));
            taskCountdownInfo = `下次执行: ${nextRefreshSeconds}s`;
        }
        
        // 更新左侧状态信息（主要状态）
        let leftSection = statusBar.querySelector('.al-status-left');
        if (leftSection) {
            let statusText = message || currentTaskDisplay;
            let progressBar = `
                <div class="al-progress-bar">
                    <div class="al-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            `;
            
            leftSection.innerHTML = `
                <span class="al-status-item highlight">QZone点赞助手</span>
                <span class="al-status-item">${statusText}</span>
                ${progressPercent > 0 ? progressBar : ''}
                <span class="al-status-item">${taskCountdownInfo}</span>
            `;
        }

        // 更新右侧统计信息（详细数据）
        let rightSection = statusBar.querySelector('.al-status-right');
        if (rightSection) {
            let nextTaskInfo = nextTask ? `下个: ${nextTask}` : '';
            let intervalInfo = `间隔: ${duration}s`;
            let dailyInfo = `今日: ${dailyProgress}`;
            let rateInfo = `成功率: ${successRate}%`;
            
            rightSection.innerHTML = `
                <span class="al-status-item">${taskCountdown}</span>
                <span class="al-status-item">${intervalInfo}</span>
                <span class="al-status-item">${dailyInfo}</span>
                <span class="al-status-item">${rateInfo}</span>
                ${nextTaskInfo ? `<span class="al-status-item">${nextTaskInfo}</span>` : ''}
            `;
        }

        // 根据状态更新样式
        statusBar.className = `al-status-${statusClass}`;
    }

    // 移除菜单元素
    function removeMeRelatedMenu() {
        let meTab = document.getElementById('tab_menu_me') || document.querySelector('li[type="me"]') || document.querySelector('#feed_tab_my');
        if (meTab) {
            meTab.style.display = 'none';
        }
    }

    // 检测页面
    function isInFriendFeedPage() {
        const hasLikeButtons = document.querySelectorAll('.qz_like_btn_v3').length > 0;
        return hasLikeButtons;
    }

    // 进入好友动态
    function goToFriendFeed() {
        try {
            log('INFO', '进入好友动态页面');
            currentTask = '切换到好友动态页面';
            taskStartTime = Date.now();
            taskDuration = 5;
            nextTask = '刷新页面并重试流程';
            updateStatusBar('切换到好友动态...');
            let friendTab = document.getElementById('tab_menu_friend') || document.querySelector('li[type="friend"] a') || document.querySelector('.feed-control-tab a:not(.item-on)');
            if (friendTab) {
                friendTab.click();
            } else if (uin) {
                location.href = 'https://user.qzone.qq.com/' + uin + '/infocenter';
            } else {
                refresh();
            }
        } catch (e) {
            log('ERROR', '进入好友动态异常: ' + e.message);
            updateStats('errors');
        }
    }

    // 安全点赞（扩展：关键词过滤、白名单、每日上限、随机延迟；修复：使用innerText提取内容，避免HTML干扰；点赞后添加延迟检查class更新，防止重复点击；优化：添加防重复触发）
    let likeDebounce = null;
    let lastLikeTime = 0;
    function safeLike() {
        try {
            const now = Date.now();
            if (isPaused || (now - lastLikeTime < 1000)) { // 防重复触发，1秒冷却
                log('INFO', 'safeLike 冷却中，跳过');
                return;
            }
            lastLikeTime = now;
            if (currentTask === '执行安全点赞') return;
            if (likeDebounce) clearTimeout(likeDebounce);
            likeDebounce = setTimeout(function() {
                if (!checkLoginStatus()) return; // 新增：登录检查
                currentTask = '执行安全点赞';
                taskStartTime = Date.now();
                const btns = document.querySelectorAll('.qz_like_btn_v3');
                const contents = document.querySelectorAll('.f-info');
                const users = document.querySelectorAll('.f-name');
                let toLike = [];
                let skipped = 0;

                Array.from(btns).forEach(function(btn, index) {
                    const contentElem = contents[index];
                    const content = contentElem ? contentElem.innerText : ''; // 改为innerText，避免HTML标签干扰关键词匹配
                    const user = users[index] && users[index].getAttribute('link') ? users[index].getAttribute('link').replace('nameCard_', '') : '';
                    
                    if (btn.classList.contains('item-on')) {
                        skipped++;
                        updateStats('skips');
                        log('INFO', '跳过已赞动态 ' + (index + 1));
                        return;
                    }

                    // 白名单优先
                    if (whiteList.includes(user)) {
                        toLike.push({btn: btn, content: content, index: index, priority: 'high'});
                        return;
                    }

                    // 黑名单检查（包括分组）
                    let isBlocked = blocked.includes(user);
                    Object.values(blockGroups).forEach(function(group) {
                        if (group.includes(user)) isBlocked = true;
                    });
                    if (isBlocked) {
                        skipped++;
                        updateStats('skips');
                        log('INFO', '跳过屏蔽用户动态 ' + (index + 1) + ', 用户: ' + user);
                        return;
                    }

                    // 游戏转发
                    let isGameForward = false;
                    if (select) {
                        for (let j = 0; j < dict.length; j++) {
                            if (content.includes(dict[j])) {
                                isGameForward = true;
                                break;
                            }
                        }
                    }
                    if (isGameForward) {
                        skipped++;
                        updateStats('skips');
                        log('INFO', '跳过游戏转发动态 ' + (index + 1));
                        return;
                    }

                    // 关键词过滤（加强日志）
                    let matchesKeyword = false;
                    filterKeywords.forEach(function(kw) {
                        try {
                            let regex = new RegExp(kw, 'i');
                            if (regex.test(content)) {
                                matchesKeyword = true;
                                log('INFO', '关键词匹配: ' + kw + ' 在动态 ' + (index + 1) + ' 中找到');
                            }
                        } catch (e) {
                            if (content.includes(kw)) {
                                matchesKeyword = true;
                                log('INFO', '关键词包含: ' + kw + ' 在动态 ' + (index + 1) + ' 中找到');
                            }
                        }
                    });
                    if ((filterMode === 'block' && matchesKeyword) || (filterMode === 'allow' && !matchesKeyword)) {
                        skipped++;
                        updateStats('skips');
                        log('INFO', '跳过关键词过滤动态 ' + (index + 1));
                        return;
                    }

                    // 每日上限
                    if (dailyLimit > 0 && dailyCount >= dailyLimit) {
                        updateStatusBar('达到每日上限，停止点赞');
                        sendNotification('每日上限', '已达到点赞上限: ' + dailyLimit);
                        return;
                    }

                    // 智能点赞模式下添加优先级
                    let priority = 'medium';
                    if (smartLikeMode !== 'normal') {
                        // 根据内容关键词判断优先级
                        for (const keyword of smartLikeKeywords.high) {
                            if (content.includes(keyword)) {
                                priority = 'high';
                                break;
                            }
                        }
                        
                        if (priority !== 'high') {
                            for (const keyword of smartLikeKeywords.low) {
                                if (content.includes(keyword)) {
                                    priority = 'low';
                                    break;
                                }
                            }
                        }
                        
                        // 在smart模式下，低优先级内容跳过
                        if (priority === 'low' && smartLikeMode === 'smart') {
                            skipped++;
                            updateStats('skips');
                            log('INFO', '智能模式跳过低优先级动态 ' + (index + 1));
                            return;
                        }
                    }
                    toLike.push({btn: btn, content: content, index: index, priority: priority});
                });

                let effectiveLikes = toLike.length;
                taskDuration = effectiveLikes * (likeDelay + (randomDelayMax - randomDelayMin) / 2) + 1;
                nextTask = '模拟滚动或等待刷新';
                nextTime = Math.max(nextTime, Date.now() + taskDuration * 1000 + 5000);
                updateStatusBar('开始点赞 (需赞: ' + effectiveLikes + ', 跳过: ' + skipped + ')');
                log('INFO', '开始点赞 (需赞: ' + effectiveLikes + ', 跳过: ' + skipped + ')');

                if (effectiveLikes === 0) {
                    currentTask = '';
                    taskDuration = 0;
                    updateStatusBar('所有动态跳过，等待刷新');
                    return;
                }

                // 如果是智能模式，按优先级排序
                if (smartLikeMode !== 'normal') {
                    toLike.sort((a, b) => {
                        const priorityOrder = {'high': 0, 'medium': 1, 'low': 2};
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                    });
                    log('INFO', '智能点赞模式：按优先级排序，高优先级先点赞');
                }
                
                let cumulativeDelay = 0;
                toLike.forEach(function(item, idx) {
                    let delay = likeDelay * 1000 + (randomDelayMin + Math.random() * (randomDelayMax - randomDelayMin)) * 1000;
                    cumulativeDelay += delay;
                    setTimeout(function() {
                        if (isPaused || (dailyLimit > 0 && dailyCount >= dailyLimit)) return;

                        // 双重检查已赞（防止延迟更新）
                        if (item.btn.classList.contains('item-on')) {
                            log('WARN', '动态 ' + (item.index + 1) + ' 已赞，跳过点击');
                            return;
                        }

                        item.btn.click();
                        dailyCount++;
                        setCookie('al-dailyCount', dailyCount, Number.MAX_SAFE_INTEGER);
                        updateStats('likes');
                        console.log('Liked: ' + item.content);
                        
                        // 在智能模式下显示优先级
                        let priorityInfo = smartLikeMode !== 'normal' ? ' [优先级:' + item.priority + ']' : '';
                        updateStatusBar('点赞动态 ' + (item.index + 1) + ' / ' + btns.length + priorityInfo);
                        log('INFO', '点赞动态 ' + (item.index + 1) + priorityInfo);

                        // 点赞后等待class更新
                        setTimeout(function() {
                            if (item.btn.classList.contains('item-on')) {
                                log('INFO', '动态 ' + (item.index + 1) + ' class更新为已赞');
                            } else {
                                log('WARN', '动态 ' + (item.index + 1) + ' class未及时更新');
                            }
                        }, 500);
                    }, cumulativeDelay - delay); // 累计前面的延迟
                });

                setTimeout(function() {
                    if (isPaused) return;
                    currentTask = '';
                    taskDuration = 0;
                    updateStatusBar('点赞完成，等待刷新');
                    log('INFO', '点赞完成');
                    sendNotification('点赞完成', '本次点赞: ' + effectiveLikes);
                }, cumulativeDelay + 1000); // 总延迟后加缓冲
            }, 500);
        } catch (e) {
            log('ERROR', '安全点赞异常: ' + e.message);
            updateStats('errors');
        }
    }

    // 模拟滚动（优化：支持无限滚动，动态检测底部）
    function simulateScroll() {
        try {
            if (isPaused) {
                updateStatusBar('脚本已暂停，跳过滚动');
                return;
            }
            currentTask = '模拟下滑动态';
            taskStartTime = Date.now();
            taskDuration = scrollCount * 3 + 3;
            nextTask = '回到顶部并等待';
            nextTime = Math.max(nextTime, Date.now() + taskDuration * 1000 + 5000);
            updateStatusBar('模拟下滑...');
            log('INFO', '模拟滚动开始');
            let scrollStep = window.innerHeight * scrollStepPercent;
            let scrolled = 0;
            let maxScrolls = scrollCount;

            function scrollLoop(i) {
                if (isPaused || i >= maxScrolls) {
                    smoothScrollTo(0, 1000);
                    updateStatusBar('回到顶部，等待刷新');
                    currentTask = '';
                    taskDuration = 0;
                    log('INFO', '滚动结束');
                    return;
                }
                smoothScrollTo((i + 1) * scrollStep, 500);
                window.dispatchEvent(new Event('scroll'));
                updateStatusBar('滚动到组 ' + (i + 1) + '/' + maxScrolls);
                log('INFO', '滚动到组 ' + (i + 1));
                let loadMoreBtn = document.querySelector('.load-more') || document.querySelector('a[title="加载更多"]');
                if (loadMoreBtn) {
                    loadMoreBtn.click();
                    maxScrolls++; // 动态增加如果有更多
                }
                // 检查是否到达底部
                if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100) {
                    maxScrolls = i + 1; // 停止如果到达底部
                }
                setTimeout(function() { scrollLoop(i + 1); }, 3000);
            }

            scrollLoop(0);
        } catch (e) {
            log('ERROR', '滚动异常: ' + e.message);
            updateStats('errors');
        }
    }

    // 平滑滚动
    function smoothScrollTo(targetY, duration) {
        let startY = window.scrollY;
        let distance = targetY - startY;
        let startTime = null;

        function animation(currentTime) {
            if (isPaused) return;
            if (!startTime) startTime = currentTime;
            let timeElapsed = currentTime - startTime;
            let progress = Math.min(timeElapsed / duration, 1);
            let ease = progress * (2 - progress);
            window.scrollTo(0, startY + distance * ease);
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                window.dispatchEvent(new Event('scroll'));
            }
        }

        requestAnimationFrame(animation);
    }

    // 刷新
    function refresh() {
        try {
            if (isPaused) return;
            log('INFO', '刷新触发');
            currentTask = '刷新页面';
            taskStartTime = Date.now();
            taskDuration = refreshDelay;
            nextTask = '执行工作流';
            lastRefresh = Date.now();
            setCookie('al-lastRefresh', lastRefresh, Number.MAX_SAFE_INTEGER);
            nextTime = Date.now() + duration * 1000;
            setCookie('al-justRefreshed', 'true', 60);
            location.reload();
        } catch (e) {
            log('ERROR', '刷新异常: ' + e.message);
            updateStats('errors');
        }
    }

    // 执行工作流
    function executeWorkflow() {
        if (isPaused) return;
        if (isRunning && !testMode) return;
        if (!checkLoginStatus()) return; // 新增：登录检查
        isRunning = true;
        currentTask = '执行工作流';
        taskStartTime = Date.now();
        taskDuration = 10;
        nextTask = '点赞或切换';
        updateStatusBar('开始工作流');
        log('INFO', '开始工作流');

        setTimeout(function() {
            try {
                if (isPaused) {
                    isRunning = false;
                    return;
                }
                if (isInFriendFeedPage()) {
                    updateStatusBar('直接执行点赞');
                    log('INFO', '直接点赞');
                    safeLike();
                    simulateScroll();
                } else {
                    updateStatusBar('切换并刷新');
                    retryCount++;
                    log('WARN', '重试: ' + retryCount);
                    if (retryCount > maxRetries) {
                        updateStatusBar('重试超限');
                        log('ERROR', '重试超限');
                        isRunning = false;
                        retryCount = 0;
                        updateStats('errors');
                        return;
                    }
                    goToFriendFeed();
                    refresh();
                    setTimeout(executeWorkflow, refreshDelay * 1000);
                }
                isRunning = false;
                currentTask = '';
                taskDuration = 0;
            } catch (e) {
                log('ERROR', '工作流异常: ' + e.message);
                isRunning = false;
                updateStats('errors');
            }
        }, initialDelay);
    }

    // 滚动事件
    let scrollDebounce = null;
    window.addEventListener('scroll', function() {
        if (isPaused) return;
        if (timeout) clearTimeout(timeout);
        isScrolling = true;
        updateStatusBar();
        if (scrollDebounce) clearTimeout(scrollDebounce);
        scrollDebounce = setTimeout(safeLike, 1000);
        timeout = setTimeout(function() {
            isScrolling = false;
            updateStatusBar();
        }, 1000);
    });

    // 主循环（新增：定期登录检查）
    let mainInterval = setInterval(function() {
        try {
            if (isPaused) {
                updateStatusBar('暂停中');
                return;
            }
            let time = Date.now();
            if (time >= nextTime || testMode) {
                refresh();
            } else if (isScrolling) {
                safeLike();
            }
            // 每分钟检查一次登录
            if (time % 60000 < 1000) {
                checkLoginStatus();
            }
        } catch (e) {
            log('ERROR', '主循环异常: ' + e.message);
            updateStats('errors');
        }
    }, 1000);

    // 清理定时器
    function clearAllTimeouts() {
        clearTimeout(timeout);
        clearTimeout(likeDebounce);
        clearTimeout(scrollDebounce);
        clearInterval(mainInterval);
        mainInterval = null;
    }

    // 初始化（兼容 Tampermonkey 隔离环境与不同页面加载时机）
    function __al_init() {
        if (window.__al_initialized) return;
        window.__al_initialized = true;
        
        console.log('[AL] 开始初始化脚本...');
        console.log('[AL] 当前页面URL:', location.href);
        console.log('[AL] document.domain:', document.domain);
        console.log('[AL] document.readyState:', document.readyState);
        
        try {
            // 检查QQ空间环境
            if (window.g_iframeUser || window.g_iframeDescend) {
                console.log('[AL] 检测到QQ空间iframe环境');
            }
            
            createMenu();
            createStatusBar();
            createFloatButton();
            applyDarkMode();

            removeMeRelatedMenu();

            if (getCookie('al-justRefreshed')) {
                setCookie('al-justRefreshed', '', -1);
                setTimeout(executeWorkflow, 3000);
            }

            // 加载当前账号配置
            loadAccountConfig(currentAccount);

            // 新增：启动MutationObserver
            setupMutationObserver();

            log('INFO', '脚本初始化完成');
            console.log('[AL] 脚本初始化成功完成');
        } catch (e) {
            log('ERROR', '初始化异常: ' + e.message);
            console.error('[AL] 初始化失败:', e);
            updateStats('errors');
            
            // 延迟重试初始化
            setTimeout(function() {
                console.log('[AL] 尝试重新初始化...');
                window.__al_initialized = false;
                __al_init();
            }, 2000);
        }
    }

    // 添加页面卸载时的清理逻辑
    function cleanup() {
        try {
            if (mutationObserver) {
                mutationObserver.disconnect();
                mutationObserver = null;
                log('INFO', '页面卸载：MutationObserver已清理');
            }
            if (typeof mainInterval !== 'undefined' && mainInterval) {
                clearInterval(mainInterval);
                log('INFO', '页面卸载：主定时器已清理');
            }
            if (typeof timeout !== 'undefined' && timeout) {
                clearTimeout(timeout);
            }
            if (typeof likeDebounce !== 'undefined' && likeDebounce) {
                clearTimeout(likeDebounce);
            }
            if (typeof scrollDebounce !== 'undefined' && scrollDebounce) {
                clearTimeout(scrollDebounce);
            }
            if (typeof timeUpdateInterval !== 'undefined' && timeUpdateInterval) {
                clearInterval(timeUpdateInterval);
                timeUpdateInterval = null;
            }
            if (typeof statusUpdateInterval !== 'undefined' && statusUpdateInterval) {
                clearInterval(statusUpdateInterval);
                statusUpdateInterval = null;
            }
        } catch (e) {
            console.error('[AL] 清理资源时出错:', e);
        }
    }

    // 注册页面卸载事件
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('unload', cleanup);

    // 在多种事件下触发初始化，避免 onload 被隔离环境忽略
    console.log('[AL] Auto Like Enhanced v2.8.9 开始启动...');
    console.log('[AL] 当前document.readyState:', document.readyState);
    
    // 立即尝试初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('[AL] 页面已就绪，立即初始化');
        __al_init();
    } else {
        console.log('[AL] 页面未就绪，注册事件监听器');
        window.addEventListener('load', function() {
            console.log('[AL] window load事件触发');
            __al_init();
        }, true);
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[AL] DOMContentLoaded事件触发');
            __al_init();
        }, true);
    }
    
    // 兜底机制：延迟启动，处理QQ空间的异步加载
    setTimeout(function() {
        if (!window.__al_initialized) {
            console.log('[AL] 兜底机制：延迟3秒后强制初始化');
            __al_init();
        }
    }, 3000);
    
    // 额外兜底：监听页面变化
    if (typeof MutationObserver !== 'undefined') {
        const startupObserver = new MutationObserver(function(mutations) {
            if (!window.__al_initialized && document.body) {
                console.log('[AL] 检测到body元素，尝试初始化');
                __al_init();
                if (window.__al_initialized) {
                    startupObserver.disconnect();
                }
            }
        });
        startupObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    console.log('[AL] Auto Like Enhanced v2.8.9 启动脚本已加载');
})();