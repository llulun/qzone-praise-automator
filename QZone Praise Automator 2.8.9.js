// ==UserScript==
// @name         QZone Praise Automator
// @namespace    https://github.com/llulun/qzone-autopraise-pro
// @license      MIT
// @version      2.8.9
// @description  网页版QQ空间自动点赞工具（增强版：简化工作流，通过检测点赞元素判断是否在好友动态页面，有则直接执行点赞，无则切换到好友动态后刷新页面重走流程，移除菜单元素，添加延迟处理、安全点赞、菜单调整、状态栏美化、滚动模拟等功能。更新：状态栏更详细显示任务进度、剩余时间等，美化透明度与阴影；控制面板增大、居中、透明化；修复状态栏文字模糊与重叠问题，通过分行显示、调整字体与行高确保清晰；状态栏背景改为黑色渐变，添加透明阴影与底部圆角；扩展控制面板为左侧菜单栏式结构，添加更多参数调整如状态栏/控制面板透明度、颜色、屏蔽用户、过滤选项、重试次数、滚动步长、初始延迟等，所有可调参数均集成到面板中，支持动态应用变化；移除双击页面调用setConfig事件，所有设置统一通过控制面板；控制面板默认隐藏，通过点击浮动按钮打开；修复状态栏文字随背景透明问题，添加文字颜色与亮度设置；新增：暂停/恢复功能，允许用户暂停或恢复自动点赞流程，状态栏显示暂停状态；修复：状态栏第二行参数与等待时间显示错误，确保实时同步最新参数和正确时间；优化：修复状态栏多余分隔符逻辑，避免显示异常；兼容：将模板字符串改为字符串连接，提高旧浏览器兼容性，避免潜在语法报错。贡献更新（v2.4）：美化控制面板和状态栏的UI（添加过渡动画、圆角按钮、响应式布局）；修复潜在bug如滚动事件重复触发点赞、暂停时定时器未完全清理、cookie值解析边缘案例；优化性能（减少不必要的setInterval调用、批量DOM操作）；添加暗黑模式自动适配选项。贡献更新（v2.5）：修复bug：在点赞或滚动任务执行过程中，如果任务时间超过刷新间隔，导致倒计时重置的问题（通过在任务开始时推迟nextTime来避免中断）；美化状态栏：添加进度条表示当前任务进度、使用emoji图标增强视觉反馈、优化字体和间距以提高可读性。贡献更新（v2.6）：修复状态栏逻辑问题：防止safeLike重复调用导致nextTime多次推迟和倒计时跳动；优化点赞逻辑，仅调度实际需要点赞的动态，避免不必要延迟和卡在“跳过”步骤；如果所有动态被跳过，立即完成任务并更新状态栏为等待刷新，而不是等待无谓时间或显示跳过消息。贡献更新（v2.8）：UI美化升级（主题系统、响应式设计、微交互）；新增动态关键词过滤（屏蔽/允许模式，支持正则）；黑名单扩展（分组、白名单、导入/导出）；每日点赞上限；浏览器通知；性能监控（点赞成功率统计）；多账号支持（配置切换）。贡献更新（v2.8.1）：修复动态元素事件监听器添加问题，确保在tab内容加载后绑定事件，避免null错误；优化JSON解析错误处理；确保所有字符串连接正确，避免语法问题。贡献更新（v2.8.2）：修复关键词屏蔽不生效问题，将内容提取改为innerText以避免HTML标签干扰匹配；加强已赞动态检测，添加点赞后延迟检查class更新，防止手动滚动触发重复点赞导致取消；优化日志记录关键词匹配细节。贡献更新（v2.8.3）：新增自动登录检测与提醒（如果检测到登录过期，暂停脚本并通知用户）；优化滚动模拟以支持无限滚动页面（动态检测底部加载元素）；添加配置备份/恢复功能到控制面板；修复多账号切换时日志和统计不隔离的问题；增强暗黑模式兼容性，支持自定义主题色调调整。贡献更新（v2.8.4）：修复控制面板浮动按钮被状态栏遮挡的问题，提高浮动按钮z-index至10003，确保其显示在状态栏上方。贡献更新（v2.8.5）：增强存储功能，使用localStorage存储性能统计数据，确保网页刷新后不会清空。）贡献更新（v2.8.6）：增强登录检测：添加自动重登录选项，如果检测到过期，可选重定向到登录页，避免手动干预；添加冷却机制防循环。贡献更新（v2.8.7）：添加MutationObserver以监控动态内容加载，提高脚本对QQ空间无限滚动的响应性和稳定性；优化safeLike以避免重复触发。贡献更新（v2.8.8）：使日志存储持久化，使用localStorage存储日志，避免页面刷新后丢失。贡献更新（v2.8.9）：在控制面板的日志标签添加导出日志按钮，允许用户下载日志为JSON文件，便于调试和分享。
// @author       llulun (with contributions)
// @match        *://*.qzone.qq.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// @grant        GM_notification
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
    let enableLoginCheck = Boolean(getCookie('al-enableLoginCheck')) || true; // 新增：登录检测
    let themeHue = parseInt(getCookie('al-themeHue')) || 0; // 新增：主题色调调整
    let enableAutoRelogin = Boolean(getCookie('al-enableAutoRelogin')) || false; // 新增：自动重登录

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

    // 日志函数
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

            // 新增：持久化日志到localStorage
            localStorage.setItem('al-logs', JSON.stringify(logs));
        } catch (e) {}
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

    // 创建菜单栏（新增：配置备份/恢复、登录检测开关、色调调整）
    function createMenu() {
        let menu = document.createElement('div');
        menu.id = 'al-menu';
        menu.style.position = 'fixed';
        menu.style.top = '50%';
        menu.style.left = '50%';
        menu.style.transform = 'translate(-50%, -50%)';
        menu.style.width = '80%';
        menu.style.maxWidth = '800px';
        menu.style.height = 'auto';
        menu.style.maxHeight = '80vh';
        menu.style.overflow = 'auto';
        menu.style.background = menuBgColor;
        menu.style.border = '1px solid #ccc';
        menu.style.borderRadius = '12px';
        menu.style.padding = '20px';
        menu.style.zIndex = '10002';
        menu.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
        menu.style.fontFamily = "Arial, sans-serif";
        menu.style.opacity = menuOpacity;
        menu.style.display = 'none';
        menu.style.pointerEvents = 'auto';
        menu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        menu.style.filter = 'hue-rotate(' + themeHue + 'deg)';
        // 响应式
        if (window.innerWidth < 600) {
            menu.style.width = '95%';
            menu.style.padding = '10px';
        }

        let sidebar = document.createElement('div');
        sidebar.style.width = '150px';
        sidebar.style.borderRight = '1px solid #ddd';
        sidebar.style.paddingRight = '10px';
        sidebar.innerHTML = '<h4 style="margin: 0 0 10px;">设置分类</h4><ul style="list-style: none; padding: 0;"><li><button id="al-tab-core" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">核心参数</button></li><li><button id="al-tab-ui" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">界面自定义</button></li><li><button id="al-tab-filter" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">过滤规则</button></li><li><button id="al-tab-adv" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">高级参数</button></li><li><button id="al-tab-logs" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">查看日志</button></li><li><button id="al-tab-stats" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">性能统计</button></li><li><button id="al-tab-accounts" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">账号管理</button></li></ul>';
        menu.appendChild(sidebar);

        let content = document.createElement('div');
        content.id = 'al-content';
        content.style.flex = '1';
        content.style.paddingLeft = '20px';
        content.style.transition = 'opacity 0.3s ease';
        menu.appendChild(content);

        let footer = document.createElement('div');
        footer.style.marginTop = '20px';
        footer.style.textAlign = 'center';
        footer.innerHTML = '<button id="al-save" style="background: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-right: 10px; transition: background 0.2s;">保存并应用</button><button id="al-pause" style="background: #FF9800; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-right: 10px; transition: background 0.2s;">' + (isPaused ? '恢复' : '暂停') + '</button><button id="al-test" style="background: #2196F3; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-right: 10px; transition: background 0.2s;">测试执行</button><button id="al-reset" style="background: #9E9E9E; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-right: 10px; transition: background 0.2s;">重置默认</button><button id="al-export" style="background: #673AB7; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-right: 10px; transition: background 0.2s;">导出配置</button><button id="al-backup" style="background: #795548; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-right: 10px; transition: background 0.2s;">备份配置</button><button id="al-restore" style="background: #607D8B; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-right: 10px; transition: background 0.2s;">恢复配置</button><button id="al-close" style="background: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; transition: background 0.2s;">关闭</button>';
        menu.appendChild(footer);

        document.body.appendChild(menu);

        function showTab(tab) {
            content.style.opacity = '0';
            setTimeout(function() {
                content.innerHTML = '';
                if (tab === 'core') {
                    content.innerHTML = '<h3>核心参数</h3><div class="al-card"><label>刷新频率 (秒): <input type="number" id="al-dur" value="' + duration + '" min="30" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>刷新延迟 (秒): <input type="number" id="al-rdelay" value="' + refreshDelay + '" min="5" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>点赞延迟 (秒): <input type="number" id="al-ldelay" value="' + likeDelay + '" min="3" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>下滑动态数: <input type="number" id="al-scount" value="' + scrollCount + '" min="1" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>每日点赞上限 (0无限): <input type="number" id="al-dailyLimit" value="' + dailyLimit + '" min="0" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label><input type="checkbox" id="al-select" ' + (select ? 'checked' : '') + '> 不点赞游戏转发内容</label></div><div class="al-card"><label><input type="checkbox" id="al-enableLoginCheck" ' + (enableLoginCheck ? 'checked' : '') + '> 启用登录状态检测</label></div>';
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
                                    let data = JSON.parse(ev.target.result);
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
                    let successRate = total > 0 ? Math.round((accStats.likes / total) * 100) + '%' : 'N/A';
                    content.innerHTML = '<h3>性能统计</h3><div class="al-card">点赞: ' + accStats.likes + ' | 跳过: ' + accStats.skips + ' | 错误: ' + accStats.errors + ' | 成功率: ' + successRate + '</div><button id="al-clear-stats" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">清除统计</button>';
                    document.getElementById('al-clear-stats').addEventListener('click', function() {
                        stats[currentAccount] = { likes: 0, skips: 0, errors: 0 };
                        localStorage.setItem('al-stats', JSON.stringify(stats));
                        showTab('stats');
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
            if (document.getElementById('al-dur')) duration = parseInt(document.getElementById('al-dur').value);
            if (document.getElementById('al-rdelay')) refreshDelay = parseInt(document.getElementById('al-rdelay').value);
            if (document.getElementById('al-ldelay')) likeDelay = parseInt(document.getElementById('al-ldelay').value);
            if (document.getElementById('al-scount')) scrollCount = parseInt(document.getElementById('al-scount').value);
            if (document.getElementById('al-dailyLimit')) dailyLimit = parseInt(document.getElementById('al-dailyLimit').value);
            if (document.getElementById('al-select')) select = document.getElementById('al-select').checked;
            if (document.getElementById('al-theme')) theme = document.getElementById('al-theme').value;
            if (document.getElementById('al-themeHue')) themeHue = parseInt(document.getElementById('al-themeHue').value);
            if (document.getElementById('al-statusOpacity')) statusOpacity = parseFloat(document.getElementById('al-statusOpacity').value);
            if (document.getElementById('al-statusBgColor')) statusBgColor = document.getElementById('al-statusBgColor').value;
            if (document.getElementById('al-statusTextColor')) statusTextColor = document.getElementById('al-statusTextColor').value;
            if (document.getElementById('al-statusTextBrightness')) statusTextBrightness = parseFloat(document.getElementById('al-statusTextBrightness').value);
            if (document.getElementById('al-darkModeAuto')) darkModeAuto = document.getElementById('al-darkModeAuto').checked;
            if (document.getElementById('al-menuOpacity')) menuOpacity = parseFloat(document.getElementById('al-menuOpacity').value);
            if (document.getElementById('al-menuBgColor')) menuBgColor = document.getElementById('al-menuBgColor').value;
            if (document.getElementById('al-blocked')) blocked = document.getElementById('al-blocked').value.split(',').map(s => s.trim());
            if (document.getElementById('al-whiteList')) whiteList = document.getElementById('al-whiteList').value.split(',').map(s => s.trim());
            if (document.getElementById('al-blockGroups')) blockGroups = safeJsonParse(document.getElementById('al-blockGroups').value) || {};
            if (document.getElementById('al-filterKeywords')) filterKeywords = document.getElementById('al-filterKeywords').value.split(',').map(s => s.trim());
            if (document.getElementById('al-filterMode')) filterMode = document.getElementById('al-filterMode').value;
            if (document.getElementById('al-maxRetries')) maxRetries = parseInt(document.getElementById('al-maxRetries').value);
            if (document.getElementById('al-scrollStepPercent')) scrollStepPercent = parseFloat(document.getElementById('al-scrollStepPercent').value);
            if (document.getElementById('al-initialDelay')) initialDelay = parseInt(document.getElementById('al-initialDelay').value);
            if (document.getElementById('al-randomDelayMin')) randomDelayMin = parseInt(document.getElementById('al-randomDelayMin').value);
            if (document.getElementById('al-randomDelayMax')) randomDelayMax = parseInt(document.getElementById('al-randomDelayMax').value);
            if (document.getElementById('al-logLevel')) logLevel = document.getElementById('al-logLevel').value;
            if (document.getElementById('al-enableNotifications')) enableNotifications = document.getElementById('al-enableNotifications').checked;
            if (document.getElementById('al-enableLoginCheck')) enableLoginCheck = document.getElementById('al-enableLoginCheck').checked;
            if (document.getElementById('al-enableAutoRelogin')) enableAutoRelogin = document.getElementById('al-enableAutoRelogin').checked; // 新增

            setCookie('al-duration', duration, Number.MAX_SAFE_INTEGER);
            setCookie('al-refreshDelay', refreshDelay, Number.MAX_SAFE_INTEGER);
            setCookie('al-likeDelay', likeDelay, Number.MAX_SAFE_INTEGER);
            setCookie('al-scrollCount', scrollCount, Number.MAX_SAFE_INTEGER);
            setCookie('al-blocked', blocked.join(','), Number.MAX_SAFE_INTEGER);
            setCookie('al-whiteList', whiteList.join(','), Number.MAX_SAFE_INTEGER);
            setCookie('al-blockGroups', JSON.stringify(blockGroups), Number.MAX_SAFE_INTEGER);
            setCookie('al-filterKeywords', filterKeywords.join(','), Number.MAX_SAFE_INTEGER);
            setCookie('al-filterMode', filterMode, Number.MAX_SAFE_INTEGER);
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
            setCookie('al-enableAutoRelogin', enableAutoRelogin ? 'true' : '', Number.MAX_SAFE_INTEGER); // 新增

            // 应用变化
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
            applyDarkMode();
            updateStatusBar('设置已保存');
            saveAccountConfig();
        });

        // 暂停/恢复
        document.getElementById('al-pause').addEventListener('click', function() {
            isPaused = !isPaused;
            this.innerText = isPaused ? '恢复' : '暂停';
            updateStatusBar(isPaused ? '已暂停' : '已恢复');
            if (!isPaused) executeWorkflow();
            clearAllTimeouts();
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
            menu.style.display = 'none';
            document.getElementById('al-float-btn').style.display = 'block';
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
        btn.style.zIndex = '10003'; // 高于状态栏
        btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        btn.style.transition = 'background 0.2s';
        btn.innerText = 'AL Menu';
        document.body.appendChild(btn);

        btn.addEventListener('click', function() {
            let menu = document.getElementById('al-menu');
            menu.style.display = 'block';
            this.style.display = 'none';
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

    // 创建状态栏（改进：网格布局、进度条、交互）
    function createStatusBar() {
        let statusBar = document.createElement('div');
        statusBar.id = 'al-status-bar';
        statusBar.style.position = 'fixed';
        statusBar.style.top = '0';
        statusBar.style.left = '0';
        statusBar.style.width = '100%';
        statusBar.style.background = statusBgColor;
        statusBar.style.padding = '12px 24px';
        statusBar.style.zIndex = '10001';
        statusBar.style.fontSize = '15px';
        statusBar.style.lineHeight = '1.6';
        statusBar.style.textAlign = 'center';
        statusBar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
        statusBar.style.borderRadius = '0 0 10px 10px';
        statusBar.style.fontFamily = 'Arial, sans-serif';
        statusBar.style.color = statusTextColor;
        statusBar.style.opacity = statusOpacity;
        statusBar.style.filter = 'brightness(' + statusTextBrightness + ') hue-rotate(' + themeHue + 'deg)';
        statusBar.style.pointerEvents = 'auto'; // 允许交互
        statusBar.style.cursor = 'pointer';
        statusBar.style.display = 'grid';
        statusBar.style.gridTemplateColumns = '1fr 2fr 1fr';
        statusBar.style.transition = 'opacity 0.3s ease, background 0.3s ease';
        document.body.appendChild(statusBar);

        statusBar.addEventListener('click', function() {
            this.style.height = this.style.height === 'auto' ? '' : 'auto'; // 展开/折叠
        });

        setInterval(updateStatusBar, 1000);
        updateStatusBar();

        log('INFO', '状态栏加载完成');
    }

    // 更新状态栏（改进：进度条、今日点赞）
    function updateStatusBar(message) {
        resetDailyCount();
        duration = parseInt(getCookie('al-duration')) || duration;
        refreshDelay = parseInt(getCookie('al-refreshDelay')) || refreshDelay;
        likeDelay = parseInt(getCookie('al-likeDelay')) || likeDelay;
        scrollCount = parseInt(getCookie('al-scrollCount')) || scrollCount;

        let statusBar = document.getElementById('al-status-bar');
        if (!statusBar) return;

        message = message || '';

        if (message) {
            log('INFO', '状态栏更新: ' + message);
        }

        let lastRefreshTime = new Date(lastRefresh).toLocaleTimeString();
        let remainingSeconds = Math.max(0, Math.ceil((nextTime - Date.now()) / 1000));
        let remainingColor = remainingSeconds < 30 ? 'red' : 'green';
        let scrollingStatus = isScrolling ? '<span style="color: lightblue; font-weight: bold;">滚动中 🔄</span>' : '<span style="color: gray;">静止 ⏹️</span>';
        let currentStep = message || (isPaused ? '<span style="color: yellow; font-weight: bold;">已暂停 ⏸️</span>' : (isRunning ? '<span style="color: orange; font-weight: bold;">执行中：' + currentTask + ' 🚀</span>' : '<span style="color: lightgreen; font-weight: bold;">等待下次刷新 ⏰</span>'));
        let taskRemaining = taskDuration > 0 ? Math.max(0, Math.ceil((taskStartTime + taskDuration * 1000 - Date.now()) / 1000)) : 0;
        let taskProgressPercent = taskDuration > 0 ? Math.round((1 - (taskRemaining / taskDuration)) * 100) : 0;
        let progressBar = '<div style="background: #ddd; height: 5px; width: 100%;"><div style="background: #4CAF50; height: 5px; width: ' + taskProgressPercent + '%;"></div></div>';
        let taskProgress = taskRemaining > 0 ? '<span style="color: violet;">任务进度: ' + taskProgressPercent + '% 📊</span>' : '';
        let retryInfo = retryCount > 0 ? '<span style="color: brown;">重试: ' + retryCount + '/' + maxRetries + ' ⚠️</span>' : '';
        let dailyInfo = dailyLimit > 0 ? '<span style="color: purple;">今日点赞: ' + dailyCount + '/' + dailyLimit + ' ❤️</span>' : '';

        let strongColor = statusTextColor === '#ddd' || statusTextColor === '#fff' ? '#ccc' : '#555';

        let infoParts = [taskProgress, retryInfo, dailyInfo].filter(Boolean);
        let infoSection = infoParts.length > 0 ? infoParts.join(' | ') + ' | ' : '';

        let html = progressBar + '<div style="grid-column: 1;">上次: <strong style="color: ' + strongColor + ';">' + lastRefreshTime + ' ⏱️</strong> | 剩余: <span style="color: ' + remainingColor + ';">' + remainingSeconds + 's</span></div><div style="grid-column: 2;">' + currentStep + ' | ' + scrollingStatus + '</div><div style="grid-column: 3;">间隔: <strong>' + duration + 's</strong> | 延迟: <strong>' + likeDelay + 's</strong></div><div style="grid-column: 1 / 4; font-size: 14px;">' + infoSection + '状态: <span style="color: ' + (isPaused ? 'yellow' : (isRunning ? 'orange' : 'lightgreen')) + ';">' + (isPaused ? '暂停' : (isRunning ? '忙碌' : '空闲')) + '</span></div>';
        statusBar.innerHTML = html;
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
                        toLike.push({btn: btn, content: content, index: index});
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

                    toLike.push({btn: btn, content: content, index: index});
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

                let cumulativeDelay = 0;
                toLike.forEach(function(item, idx) {
                    let delay = likeDelay * 1000 + Math.random() * (randomDelayMax - randomDelayMin) * 1000;
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
                        updateStatusBar('点赞动态 ' + (item.index + 1) + ' / ' + btns.length);
                        log('INFO', '点赞动态 ' + (item.index + 1));

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

    // 初始化
    window.onload = function () {
        try {
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
        } catch (e) {
            log('ERROR', '初始化异常: ' + e.message);
            updateStats('errors');
        }
    };

    console.log('Auto Like Enhanced v2.8.9 Running...');
})();
