// ==UserScript==
// @name         QZone Praise Automator
// @namespace    https://github.com/llulun/qzone-autopraise-pro
// @license      MIT
// @version      2.8.7
// @description  网页版QQ空间自动点赞工具（增强版：简化工作流，通过检测点赞元素判断是否在好友动态页面，有则直接执行点赞，无则切换到好友动态后刷新页面重走流程，移除菜单元素，添加延迟处理、安全点赞、菜单调整、状态栏美化、滚动模拟等功能。更新：状态栏更详细显示任务进度、剩余时间等，美化透明度与阴影；控制面板增大、居中、透明化；修复状态栏文字模糊与重叠问题，通过分行显示、调整字体与行高确保清晰；状态栏背景改为黑色渐变，添加透明阴影与底部圆角；扩展控制面板为左侧菜单栏式结构，添加更多参数调整如状态栏/控制面板透明度、颜色、屏蔽用户、过滤选项、重试次数、滚动步长、初始延迟等，所有可调参数均集成到面板中，支持动态应用变化；移除双击页面调用setConfig事件，所有设置统一通过控制面板；控制面板默认隐藏，通过点击浮动按钮打开；修复状态栏文字随背景透明问题，添加文字颜色与亮度设置；新增：暂停/恢复功能，允许用户暂停或恢复自动点赞流程，状态栏显示暂停状态；修复：状态栏第二行参数与等待时间显示错误，确保实时同步最新参数和正确时间；优化：修复状态栏多余分隔符逻辑，避免显示异常；兼容：将模板字符串改为字符串连接，提高旧浏览器兼容性，避免潜在语法报错。贡献更新（v2.4）：美化控制面板和状态栏的UI（添加过渡动画、圆角按钮、响应式布局）；修复潜在bug如滚动事件重复触发点赞、暂停时定时器未完全清理、cookie值解析边缘案例；优化性能（减少不必要的setInterval调用、批量DOM操作）；添加暗黑模式自动适配选项。贡献更新（v2.5）：修复bug：在点赞或滚动任务执行过程中，如果任务时间超过刷新间隔，导致倒计时重置的问题（通过在任务开始时推迟nextTime来避免中断）；美化状态栏：添加进度条表示当前任务进度、使用emoji图标增强视觉反馈、优化字体和间距以提高可读性。贡献更新（v2.6）：修复状态栏逻辑问题：防止safeLike重复调用导致nextTime多次推迟和倒计时跳动；优化点赞逻辑，仅调度实际需要点赞的动态，避免不必要延迟和卡在“跳过”步骤；如果所有动态被跳过，立即完成任务并更新状态栏为等待刷新，而不是等待无谓时间或显示跳过消息。贡献更新（v2.8）：UI美化升级（主题系统、响应式设计、微交互）；新增动态关键词过滤（屏蔽/允许模式，支持正则）；黑名单扩展（分组、白名单、导入/导出）；每日点赞上限；浏览器通知；性能监控（点赞成功率统计）；多账号支持（配置切换）。贡献更新（v2.8.1）：修复动态元素事件监听器添加问题，确保在tab内容加载后绑定事件，避免null错误；优化JSON解析错误处理；确保所有字符串连接正确，避免语法问题。贡献更新（v2.8.2）：修复关键词屏蔽不生效问题，将内容提取改为innerText以避免HTML标签干扰匹配；加强已赞动态检测，添加点赞后延迟检查class更新，防止手动滚动触发重复点赞导致取消；优化日志记录关键词匹配细节。贡献更新（v2.8.3）：新增自动登录检测与提醒（如果检测到登录过期，暂停脚本并通知用户）；优化滚动模拟以支持无限滚动页面（动态检测底部加载元素）；添加配置备份/恢复功能到控制面板；修复多账号切换时日志和统计不隔离的问题；增强暗黑模式兼容性，支持自定义主题色调调整。贡献更新（v2.8.4）：修复控制面板浮动按钮被状态栏遮挡的问题，提高浮动按钮z-index至10003，确保其显示在状态栏上方。贡献更新（v2.8.5）：增强存储功能，使用localStorage存储性能统计数据，确保网页刷新后不会清空。）新增：日志搜索功能，NaN 处理优化。贡献更新（v2.8.6）：UI优化，日志搜索增强。贡献更新（v2.8.7）：合并QZone Auto Login Helper，确保点赞不因登录过期中断；添加登录设置tab；浮动按钮移到右上角。
// @author       llulun (with contributions)
// @match        *://*.qzone.qq.com/*
// @match        https://i.qq.com/*
// @match        *://*.ptlogin2.qq.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// @grant        GM_notification
// ==/UserScript==

(function() {
    'use strict';

    // 从localStorage获取配置（统一存储，替换cookie；添加登录参数）
    let duration = parseInt(localStorage.getItem('al-duration')) || 180;
    let refreshDelay = parseInt(localStorage.getItem('al-refreshDelay')) || 10;
    let likeDelay = parseInt(localStorage.getItem('al-likeDelay')) || 5;
    let scrollCount = parseInt(localStorage.getItem('al-scrollCount')) || 3;
    let blocked = localStorage.getItem('al-blocked') ? localStorage.getItem('al-blocked').split(',') : [];
    let whiteList = localStorage.getItem('al-whiteList') ? localStorage.getItem('al-whiteList').split(',') : [];
    let blockGroups = safeJsonParse(localStorage.getItem('al-blockGroups')) || {};
    let filterKeywords = localStorage.getItem('al-filterKeywords') ? localStorage.getItem('al-filterKeywords').split(',') : [];
    let filterMode = localStorage.getItem('al-filterMode') || 'block';
    let dailyLimit = parseInt(localStorage.getItem('al-dailyLimit')) || 0;
    let dailyCount = parseInt(localStorage.getItem('al-dailyCount')) || 0;
    let lastDailyReset = parseInt(localStorage.getItem('al-lastDailyReset')) || Date.now();
    const dict = ['点赞', '转发', '评论'];
    let select = Boolean(localStorage.getItem('al-select'));
    let lastRefresh = parseInt(localStorage.getItem('al-lastRefresh')) || 0;
    let nextTime = Math.max(Date.now(), lastRefresh + duration * 1000);
    let isScrolling = false;
    let timeout = null;
    let isRunning = false;
    let isPaused = false;
    let testMode = false;
    let uin = unsafeWindow.g_iUin || unsafeWindow.g_iLoginUin || '';
    let retryCount = 0;
    let maxRetries = parseInt(localStorage.getItem('al-maxRetries')) || 3;
    let currentTask = '';
    let taskStartTime = 0;
    let taskDuration = 0;
    let nextTask = '';
    let statusOpacity = parseFloat(localStorage.getItem('al-statusOpacity')) || 0.8;
    let statusBgColor = localStorage.getItem('al-statusBgColor') || 'linear-gradient(to right, #333, #222)';
    let menuOpacity = parseFloat(localStorage.getItem('al-menuOpacity')) || 0.9;
    let menuBgColor = localStorage.getItem('al-menuBgColor') || 'linear-gradient(to bottom, #ffffff, #f0f0f0)';
    let scrollStepPercent = parseFloat(localStorage.getItem('al-scrollStepPercent')) || 0.9;
    let initialDelay = parseInt(localStorage.getItem('al-initialDelay')) || 3000;
    let statusTextColor = localStorage.getItem('al-statusTextColor') || (statusBgColor.includes('#333') || statusBgColor.includes('#222') ? '#ddd' : '#333');
    let statusTextBrightness = parseFloat(localStorage.getItem('al-statusTextBrightness')) || 1.0;
    let darkModeAuto = Boolean(localStorage.getItem('al-darkModeAuto'));
    let logLevel = localStorage.getItem('al-logLevel') || 'INFO';
    let logs = [];
    let theme = localStorage.getItem('al-theme') || 'default';
    let randomDelayMin = parseInt(localStorage.getItem('al-randomDelayMin')) || 1;
    let randomDelayMax = parseInt(localStorage.getItem('al-randomDelayMax')) || 3;
    let enableNotifications = Boolean(localStorage.getItem('al-enableNotifications'));
    let stats = safeJsonParse(localStorage.getItem('al-stats')) || {};
    let accounts = safeJsonParse(localStorage.getItem('al-accounts')) || {};
    let currentAccount = uin;
    let enableLoginCheck = Boolean(localStorage.getItem('al-enableLoginCheck')) || true;
    let themeHue = parseInt(localStorage.getItem('al-themeHue')) || 0;

    // 新增：登录参数（从登录脚本合并）
    let tryBrowserAutofill = localStorage.getItem('al-tryBrowserAutofill') !== 'false';
    let checkInterval = parseInt(localStorage.getItem('al-checkInterval')) || 60;
    let autoTriggerThreshold = parseInt(localStorage.getItem('al-autoTriggerThreshold')) || 3;
    let detectionCount = 0;

    // 新增：安全JSON解析
    function safeJsonParse(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            log('WARN', 'JSON解析失败: ' + e.message + ', 返回默认值');
            return null;
        }
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

            logs[currentAccount] = logs[currentAccount] || [];
            logs[currentAccount].push(fullMessage);
            if (logs[currentAccount].length > 500) {
                logs[currentAccount].shift();
            }
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
            localStorage.setItem('al-dailyCount', dailyCount);
            localStorage.setItem('al-lastDailyReset', lastDailyReset);
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

    // 更新统计
    function updateStats(key) {
        stats[currentAccount] = stats[currentAccount] || { likes: 0, skips: 0, errors: 0 };
        stats[currentAccount][key] = (stats[currentAccount][key] || 0) + 1;
        localStorage.setItem('al-stats', JSON.stringify(stats));
    }

    // 检测登录状态（增强：合并登录脚本逻辑，如果失效触发 autofill）
    async function checkLoginStatus() {
        if (!enableLoginCheck) return true;
        const isLoggedIn = !!uin && document.querySelector('.user-info') !== null;
        if (!isLoggedIn) {
            detectionCount++;
            log('WARN', '登录失效检测次数: ' + detectionCount);
            if (detectionCount >= autoTriggerThreshold) {
                isPaused = true;
                updateStatusBar('检测到登录过期，尝试自动登录');
                sendNotification('登录过期', 'QZone Praise Automator 检测到登录失效，正在尝试自动登录。');
                await attemptLoginFlow();
                detectionCount = 0;
            }
            return false;
        }
        detectionCount = 0;
        return true;
    }

    // 合并：尝试登录流程（从登录脚本）
    async function attemptLoginFlow() {
        currentTask = '尝试登录流程';
        taskStartTime = Date.now();
        taskDuration = 5;
        nextTask = '等待下次检测';
        updateStatusBar('开始尝试登录...');
        try {
            const avatarSelectors = [
                '#qlogin_list .uin', '.qlogin_face img', '.mod_login_user .head img',
                '.face, .qlogin_face_img, .qlogin_img', 'a[href*="ptlogin"] img', '.login-face img'
            ];
            for (const sel of avatarSelectors) {
                const el = document.querySelector(sel);
                if (el) {
                    log('INFO', '找到头像元素，尝试点击 -> ' + sel);
                    updateStatusBar('检测到头像，正在点击登录...');
                    el.click();
                    currentTask = '';
                    taskDuration = 0;
                    return;
                }
            }
            log('INFO', '未找到头像元素，尝试触发浏览器自动填充...');

            if (tryBrowserAutofill) {
                const iframes = document.querySelectorAll('iframe');
                let triggered = false;
                for (const iframe of iframes) {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        if (iframeDoc && await tryTriggerBrowserAutofillInDocument(iframeDoc)) {
                            triggered = true;
                            break;
                        }
                    } catch (e) { log('WARN', 'iframe访问异常: ' + e.message); }
                }
                if (!triggered) {
                    triggered = await tryTriggerBrowserAutofillInDocument(document);
                }
                if (triggered) {
                    updateStatusBar('已尝试触发浏览器自动填充，正在等待提交...');
                } else {
                    updateStatusBar('未能触发自动填充或未找到可用表单');
                }
            } else {
                updateStatusBar('已禁用浏览器 autofill 触发');
            }
            currentTask = '';
            taskDuration = 0;
        } catch (err) {
            log('ERROR', '尝试登录流程异常: ' + err.message);
            updateStatusBar('登录尝试异常');
            currentTask = '';
            taskDuration = 0;
        }
    }

    // 合并：触发 autofill（从登录脚本）
    async function tryTriggerBrowserAutofillInDocument(doc) {
        try {
            const userSelectors = ['input[name="u"]', 'input[name="acct"]', 'input[id*="u"]', 'input[name*="user"]', 'input[type="email"]', 'input[type="text"]'];
            const passSelectors = ['input[name="p"]', 'input[name="pwd"]', 'input[type="password"]'];
            const submitSelectors = ['input[type="submit"]', 'button[type="submit"]', '#go', '.btn', 'input[value*="登录"]', 'button:contains("登录")'];

            let uEl = null, pEl = null, submitEl = null;
            for (const s of userSelectors) { const e = doc.querySelector(s); if (e) { uEl = e; break; } }
            for (const s of passSelectors) { const e = doc.querySelector(s); if (e) { pEl = e; break; } }
            for (const s of submitSelectors) { const e = doc.querySelector(s); if (e) { submitEl = e; break; } }

            if (!uEl || !pEl) {
                log('INFO', '未找到用户名或密码输入字段，无法触发autofill');
                return false;
            }

            uEl.focus();
            uEl.dispatchEvent(new Event('input', { bubbles: true }));
            uEl.dispatchEvent(new Event('change', { bubbles: true }));
            await new Promise(r => setTimeout(r, 500));

            pEl.focus();
            pEl.dispatchEvent(new Event('input', { bubbles: true }));
            pEl.dispatchEvent(new Event('change', { bubbles: true }));
            await new Promise(r => setTimeout(r, 500));

            if (submitEl) {
                log('INFO', '找到提交按钮，尝试点击');
                submitEl.click();
            } else {
                const form = pEl.closest('form');
                if (form) {
                    log('INFO', '未找到提交按钮，尝试提交表单');
                    form.submit();
                } else {
                    log('INFO', '未找到表单，无法自动提交');
                }
            }

            return true;
        } catch (err) {
            log('ERROR', '触发autofill异常: ' + err.message);
            return false;
        }
    }

    // 创建菜单栏（新增：登录设置tab）
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
        if (window.innerWidth < 600) {
            menu.style.width = '95%';
            menu.style.padding = '10px';
        }

        let sidebar = document.createElement('div');
        sidebar.style.width = '150px';
        sidebar.style.borderRight = '1px solid #ddd';
        sidebar.style.paddingRight = '10px';
        sidebar.innerHTML = '<h4 style="margin: 0 0 10px;">设置分类</h4><ul style="list-style: none; padding: 0;"><li><button id="al-tab-core" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">核心参数</button></li><li><button id="al-tab-ui" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">界面自定义</button></li><li><button id="al-tab-filter" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">过滤规则</button></li><li><button id="al-tab-adv" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">高级参数</button></li><li><button id="al-tab-login" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">登录设置</button></li><li><button id="al-tab-logs" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">查看日志</button></li><li><button id="al-tab-stats" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">性能统计</button></li><li><button id="al-tab-accounts" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">账号管理</button></li></ul>';
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
                } else if (tab === 'ui') {
                    content.innerHTML = '<h3>界面自定义</h3><div class="al-card"><label>主题: <select id="al-theme"><option value="default" ' + (theme === 'default' ? 'selected' : '') + '>默认</option><option value="tech" ' + (theme === 'tech' ? 'selected' : '') + '>科技蓝</option><option value="eco" ' + (theme === 'eco' ? 'selected' : '') + '>环保绿</option></select></label></div><div class="al-card"><label>主题色调调整 (0-360): <input type="number" id="al-themeHue" value="' + themeHue + '" min="0" max="360" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>状态栏透明度 (0.1-1): <input type="number" id="al-statusOpacity" value="' + statusOpacity + '" min="0.1" max="1" step="0.1" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>状态栏背景: <select id="al-statusBgColor" style="width: 200px; margin-left: 10px;"><option value="linear-gradient(to right, #333, #222)" ' + (statusBgColor === 'linear-gradient(to right, #333, #222)' ? 'selected' : '') + '>黑色渐变</option><option value="linear-gradient(to right, #f0f0f0, #e0e0e0)" ' + (statusBgColor === 'linear-gradient(to right, #f0f0f0, #e0e0e0)' ? 'selected' : '') + '>白色渐变</option><option value="linear-gradient(to right, #2196F3, #1976D2)" ' + (statusBgColor === 'linear-gradient(to right, #2196F3, #1976D2)' ? 'selected' : '') + '>蓝色渐变</option><option value="linear-gradient(to right, #4CAF50, #388E3C)" ' + (statusBgColor === 'linear-gradient(to right, #4CAF50, #388E3C)' ? 'selected' : '') + '>绿色渐变</option></select></label></div><div class="al-card"><label>状态栏文字颜色: <select id="al-statusTextColor" style="width: 200px; margin-left: 10px;"><option value="auto" ' + (statusTextColor === 'auto' ? 'selected' : '') + '>自动</option><option value="#fff" ' + (statusTextColor === '#fff' ? 'selected' : '') + '>白色</option><option value="#000" ' + (statusTextColor === '#000' ? 'selected' : '') + '>黑色</option><option value="#ddd" ' + (statusTextColor === '#ddd' ? 'selected' : '') + '>浅灰</option></select></label></div><div class="al-card"><label>状态栏文字亮度 (0.5-1.5): <input type="number" id="al-statusTextBrightness" value="' + statusTextBrightness + '" min="0.5" max="1.5" step="0.1" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label><input type="checkbox" id="al-darkModeAuto" ' + (darkModeAuto ? 'checked' : '') + '> 自动适配暗黑模式</label></div><div class="al-card"><label>控制面板透明度 (0.1-1): <input type="number" id="al-menuOpacity" value="' + menuOpacity + '" min="0.1" max="1" step="0.1" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>控制面板背景: <select id="al-menuBgColor" style="width: 200px; margin-left: 10px;"><option value="linear-gradient(to bottom, #ffffff, #f0f0f0)" ' + (menuBgColor === 'linear-gradient(to bottom, #ffffff, #f0f0f0)' ? 'selected' : '') + '>白色渐变</option><option value="linear-gradient(to bottom, #333, #222)" ' + (menuBgColor === 'linear-gradient(to bottom, #333, #222)' ? 'selected' : '') + '>黑色渐变</option><option value="linear-gradient(to bottom, #2196F3, #1976D2)" ' + (menuBgColor === 'linear-gradient(to bottom, #2196F3, #1976D2)' ? 'selected' : '') + '>蓝色渐变</option><option value="linear-gradient(to bottom, #4CAF50, #388E3C)" ' + (menuBgColor === 'linear-gradient(to bottom, #4CAF50, #388E3C)' ? 'selected' : '') + '>绿色渐变</option></select></label></div>';
                } else if (tab === 'filter') {
                    content.innerHTML = '<h3>过滤规则</h3><div class="al-card"><label>屏蔽用户 (QQ号,逗号分隔): <textarea id="al-blocked" style="width: 200px; height: 50px; margin-left: 10px;">' + blocked.join(',') + '</textarea></label></div><div class="al-card"><label>白名单用户 (QQ号,逗号分隔): <textarea id="al-whiteList" style="width: 200px; height: 50px; margin-left: 10px;">' + whiteList.join(',') + '</textarea></label></div><div class="al-card"><label>黑名单分组 (JSON): <textarea id="al-blockGroups" style="width: 200px; height: 100px; margin-left: 10px;">' + JSON.stringify(blockGroups) + '</textarea></label></div><div class="al-card"><label>动态关键词 (逗号分隔,支持正则): <textarea id="al-filterKeywords" style="width: 200px; height: 50px; margin-left: 10px;">' + filterKeywords.join(',') + '</textarea></label></div><div class="al-card"><label>过滤模式: <select id="al-filterMode"><option value="block" ' + (filterMode === 'block' ? 'selected' : '') + '>屏蔽关键词</option><option value="allow" ' + (filterMode === 'allow' ? 'selected' : '') + '>仅允许关键词</option></select></label></div><div class="al-card"><button id="al-import-block" style="background: #2196F3; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">导入黑名单</button> <input type="file" id="al-file-input" style="display:none;"><button id="al-export-block" style="background: #673AB7; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">导出黑名单</button></div>';
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
                } else if (tab === 'login') {
                    content.innerHTML = '<h3>登录设置</h3><div class="al-card"><label><input type="checkbox" id="al-tryBrowserAutofill" ' + (tryBrowserAutofill ? 'checked' : '') + '> 启用浏览器自动填充触发</label></div><div class="al-card"><label>检测间隔 (秒): <input type="number" id="al-checkInterval" value="' + checkInterval + '" min="10" style="width: 80px; margin-left: 10px;"></label></div><div class="al-card"><label>自动触发阈值 (失败次数): <input type="number" id="al-autoTriggerThreshold" value="' + autoTriggerThreshold + '" min="1" style="width: 80px; margin-left: 10px;"></label></div>';
                } else if (tab === 'logs') {
                    content.innerHTML = '<h3>系统日志</h3><input type="text" id="al-log-search" placeholder="搜索日志..." style="width: 100%; margin-bottom: 10px;" oninput="filterLogs()"><div id="al-log-list" style="max-height: 300px; overflow-y: auto; background: #f9f9f9; padding: 10px; border: 1px solid #ddd;">' + (logs[currentAccount] || []).join('<br>') + '</div><button id="al-clear-logs" style="margin-top: 10px;">清除日志</button>';
                    document.getElementById('al-clear-logs').addEventListener('click', function() {
                        logs[currentAccount] = [];
                        document.getElementById('al-log-list').innerHTML = '';
                    });
                } else if (tab === 'stats') {
                    let accountStats = stats[currentAccount] || { likes: 0, skips: 0, errors: 0 };
                    let total = accountStats.likes + accountStats.skips + accountStats.errors;
                    let successRate = total > 0 ? Math.round((accountStats.likes / total) * 100) : 0;
                    content.innerHTML = '<h3>性能统计</h3><div>点赞: ' + accountStats.likes + '</div><div>跳过: ' + accountStats.skips + '</div><div>错误: ' + accountStats.errors + '</div><div>成功率: ' + successRate + '%</div><button id="al-clear-stats" style="margin-top: 10px;">清除统计</button>';
                    document.getElementById('al-clear-stats').addEventListener('click', function() {
                        stats[currentAccount] = { likes: 0, skips: 0, errors: 0 };
                        localStorage.setItem('al-stats', JSON.stringify(stats));
                        showTab('stats');
                    });
                } else if (tab === 'accounts') {
                    let accountList = Object.keys(accounts).join(',');
                    content.innerHTML = '<h3>账号管理</h3><div class="al-card"><label>当前账号: ' + currentAccount + '</label></div><div class="al-card"><label>切换账号 (QQ号): <input type="text" id="al-switch-account" placeholder="输入QQ号" style="width: 150px; margin-left: 10px;"></label><button id="al-switch-btn" style="margin-left: 10px;">切换</button></div><div class="al-card">已保存账号: ' + accountList + '</div>';
                    document.getElementById('al-switch-btn').addEventListener('click', function() {
                        let newAcc = document.getElementById('al-switch-account').value.trim();
                        if (newAcc) {
                            loadAccountConfig(newAcc);
                            saveAccountConfig();
                            showTab('accounts');
                            updateStatusBar('切换到账号: ' + newAcc);
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
        document.getElementById('al-tab-login').addEventListener('click', function() { showTab('login'); });
        document.getElementById('al-tab-logs').addEventListener('click', function() { showTab('logs'); });
        document.getElementById('al-tab-stats').addEventListener('click', function() { showTab('stats'); });
        document.getElementById('al-tab-accounts').addEventListener('click', function() { showTab('accounts'); });

        // 保存按钮事件
        document.getElementById('al-save').addEventListener('click', function() {
            duration = parseInt(document.getElementById('al-dur').value) || duration;
            refreshDelay = parseInt(document.getElementById('al-rdelay').value) || refreshDelay;
            likeDelay = parseInt(document.getElementById('al-ldelay').value) || likeDelay;
            scrollCount = parseInt(document.getElementById('al-scount').value) || scrollCount;
            blocked = document.getElementById('al-blocked').value.split(',').map(s => s.trim()) || blocked;
            whiteList = document.getElementById('al-whiteList').value.split(',').map(s => s.trim()) || whiteList;
            blockGroups = safeJsonParse(document.getElementById('al-blockGroups').value) || blockGroups;
            filterKeywords = document.getElementById('al-filterKeywords').value.split(',').map(s => s.trim()) || filterKeywords;
            filterMode = document.getElementById('al-filterMode').value || filterMode;
            dailyLimit = parseInt(document.getElementById('al-dailyLimit').value) || dailyLimit;
            select = document.getElementById('al-select').checked;
            statusOpacity = parseFloat(document.getElementById('al-statusOpacity').value) || statusOpacity;
            statusBgColor = document.getElementById('al-statusBgColor').value || statusBgColor;
            statusTextColor = document.getElementById('al-statusTextColor').value || statusTextColor;
            statusTextBrightness = parseFloat(document.getElementById('al-statusTextBrightness').value) || statusTextBrightness;
            menuOpacity = parseFloat(document.getElementById('al-menuOpacity').value) || menuOpacity;
            menuBgColor = document.getElementById('al-menuBgColor').value || menuBgColor;
            maxRetries = parseInt(document.getElementById('al-maxRetries').value) || maxRetries;
            scrollStepPercent = parseFloat(document.getElementById('al-scrollStepPercent').value) || scrollStepPercent;
            initialDelay = parseInt(document.getElementById('al-initialDelay').value) || initialDelay;
            randomDelayMin = parseInt(document.getElementById('al-randomDelayMin').value) || randomDelayMin;
            randomDelayMax = parseInt(document.getElementById('al-randomDelayMax').value) || randomDelayMax;
            logLevel = document.getElementById('al-logLevel').value || logLevel;
            theme = document.getElementById('al-theme').value || theme;
            themeHue = parseInt(document.getElementById('al-themeHue').value) || themeHue;
            darkModeAuto = document.getElementById('al-darkModeAuto').checked;
            enableNotifications = document.getElementById('al-enableNotifications').checked;
            enableLoginCheck = document.getElementById('al-enableLoginCheck').checked;
            tryBrowserAutofill = document.getElementById('al-tryBrowserAutofill').checked;
            checkInterval = parseInt(document.getElementById('al-checkInterval').value) || 60;
            autoTriggerThreshold = parseInt(document.getElementById('al-autoTriggerThreshold').value) || 3;

            // 保存到localStorage
            localStorage.setItem('al-duration', duration);
            localStorage.setItem('al-refreshDelay', refreshDelay);
            localStorage.setItem('al-likeDelay', likeDelay);
            localStorage.setItem('al-scrollCount', scrollCount);
            localStorage.setItem('al-blocked', blocked.join(','));
            localStorage.setItem('al-whiteList', whiteList.join(','));
            localStorage.setItem('al-blockGroups', JSON.stringify(blockGroups));
            localStorage.setItem('al-filterKeywords', filterKeywords.join(','));
            localStorage.setItem('al-filterMode', filterMode);
            localStorage.setItem('al-dailyLimit', dailyLimit);
            localStorage.setItem('al-select', select ? 'true' : '');
            localStorage.setItem('al-statusOpacity', statusOpacity);
            localStorage.setItem('al-statusBgColor', statusBgColor);
            localStorage.setItem('al-statusTextColor', statusTextColor);
            localStorage.setItem('al-statusTextBrightness', statusTextBrightness);
            localStorage.setItem('al-menuOpacity', menuOpacity);
            localStorage.setItem('al-menuBgColor', menuBgColor);
            localStorage.setItem('al-maxRetries', maxRetries);
            localStorage.setItem('al-scrollStepPercent', scrollStepPercent);
            localStorage.setItem('al-initialDelay', initialDelay);
            localStorage.setItem('al-randomDelayMin', randomDelayMin);
            localStorage.setItem('al-randomDelayMax', randomDelayMax);
            localStorage.setItem('al-logLevel', logLevel);
            localStorage.setItem('al-theme', theme);
            localStorage.setItem('al-themeHue', themeHue);
            localStorage.setItem('al-darkModeAuto', darkModeAuto ? 'true' : '');
            localStorage.setItem('al-enableNotifications', enableNotifications ? 'true' : '');
            localStorage.setItem('al-enableLoginCheck', enableLoginCheck ? 'true' : '');
            localStorage.setItem('al-tryBrowserAutofill', tryBrowserAutofill ? 'true' : 'false');
            localStorage.setItem('al-checkInterval', checkInterval);
            localStorage.setItem('al-autoTriggerThreshold', autoTriggerThreshold);

            // 应用变化
            let statusBar = document.getElementById('al-status-bar');
            if (statusBar) {
                statusBar.style.opacity = statusOpacity;
                statusBar.style.background = statusBgColor;
                statusBar.style.color = statusTextColor;
                statusBar.style.filter = 'brightness(' + statusTextBrightness + ')';
            }
            menu.style.opacity = menuOpacity;
            menu.style.background = menuBgColor;
            menu.style.filter = 'hue-rotate(' + themeHue + 'deg)';
            applyDarkMode();

            saveAccountConfig();
            updateStatusBar('设置已保存');
            log('INFO', '设置保存成功');
        });

        document.getElementById('al-pause').addEventListener('click', function() {
            isPaused = !isPaused;
            this.innerText = isPaused ? '恢复' : '暂停';
            updateStatusBar(isPaused ? '已暂停' : '已恢复');
            log('INFO', isPaused ? '脚本暂停' : '脚本恢复');
            if (!isPaused) executeWorkflow();
        });

        document.getElementById('al-test').addEventListener('click', function() {
            testMode = true;
            executeWorkflow();
            testMode = false;
        });

        document.getElementById('al-reset').addEventListener('click', function() {
            // 重置默认值
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
            statusOpacity = 0.8;
            statusBgColor = 'linear-gradient(to right, #333, #222)';
            statusTextColor = '#ddd';
            statusTextBrightness = 1.0;
            menuOpacity = 0.9;
            menuBgColor = 'linear-gradient(to bottom, #ffffff, #f0f0f0)';
            maxRetries = 3;
            scrollStepPercent = 0.9;
            initialDelay = 3000;
            randomDelayMin = 1;
            randomDelayMax = 3;
            logLevel = 'INFO';
            theme = 'default';
            themeHue = 0;
            darkModeAuto = true;
            enableNotifications = false;
            enableLoginCheck = true;
            tryBrowserAutofill = true;
            checkInterval = 60;
            autoTriggerThreshold = 3;

            // 清空localStorage相关项
            localStorage.removeItem('al-duration');
            localStorage.removeItem('al-refreshDelay');
            // ... 清空所有

            showTab('core'); // 刷新
            updateStatusBar('设置已重置');
            log('INFO', '设置重置默认');
        });

        document.getElementById('al-export').addEventListener('click', function() {
            let config = {
                duration: duration, refreshDelay: refreshDelay, likeDelay: likeDelay, scrollCount: scrollCount, blocked: blocked, whiteList: whiteList, blockGroups: blockGroups, filterKeywords: filterKeywords, filterMode: filterMode, dailyLimit: dailyLimit, select: select, statusOpacity: statusOpacity, statusBgColor: statusBgColor, statusTextColor: statusTextColor, statusTextBrightness: statusTextBrightness, menuOpacity: menuOpacity, menuBgColor: menuBgColor, maxRetries: maxRetries, scrollStepPercent: scrollStepPercent, initialDelay: initialDelay, randomDelayMin: randomDelayMin, randomDelayMax: randomDelayMax, logLevel: logLevel, theme: theme, themeHue: themeHue, darkModeAuto: darkModeAuto, enableNotifications: enableNotifications, enableLoginCheck: enableLoginCheck, tryBrowserAutofill: tryBrowserAutofill, checkInterval: checkInterval, autoTriggerThreshold: autoTriggerThreshold
            };
            download('config.json', JSON.stringify(config));
        });

        document.getElementById('al-backup').addEventListener('click', function() {
            let config = { ...accounts[currentAccount] };
            download('backup_' + currentAccount + '.json', JSON.stringify(config));
        });

        document.getElementById('al-restore').addEventListener('click', function() {
            let input = document.createElement('input');
            input.type = 'file';
            input.onchange = function(e) {
                let file = e.target.files[0];
                if (file) {
                    let reader = new FileReader();
                    reader.onload = function(ev) {
                        try {
                            let config = JSON.parse(ev.target.result);
                            duration = config.duration || duration;
                            // ... 应用所有
                            saveAccountConfig();
                            updateStatusBar('配置已恢复');
                            log('INFO', '配置恢复成功');
                        } catch (err) {
                            alert('恢复失败: ' + err.message);
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        });

        document.getElementById('al-close').addEventListener('click', function() {
            menu.style.display = 'none';
        });

        showTab('core');
    }

    // 下载文件
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
    function createFloatingButton() {
        let button = document.createElement('div');
        button.id = 'al-float-btn';
        button.style.position = 'fixed';
        button.style.top = '20px';
        button.style.right = '20px';
        button.style.width = '50px';
        button.style.height = '50px';
        button.style.background = '#2196F3';
        button.style.borderRadius = '50%';
        button.style.color = 'white';
        button.style.textAlign = 'center';
        button.style.lineHeight = '50px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        button.style.zIndex = '10003';
        button.innerText = 'AL';
        document.body.appendChild(button);

        button.addEventListener('click', function() {
            let menu = document.getElementById('al-menu');
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });
    }

    // 加载账号配置
    function loadAccountConfig(acc) {
        if (accounts[acc]) {
            let config = accounts[acc];
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
            statusOpacity = config.statusOpacity;
            statusBgColor = config.statusBgColor;
            statusTextColor = config.statusTextColor;
            statusTextBrightness = config.statusTextBrightness;
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
            tryBrowserAutofill = config.tryBrowserAutofill;
            checkInterval = config.checkInterval;
            autoTriggerThreshold = config.autoTriggerThreshold;
            stats[acc] = config.stats || { likes: 0, skips: 0, errors: 0 };
            logs[acc] = config.logs || [];
            currentAccount = acc;
            updateStatusBar();
        } else {
            accounts[acc] = { duration: 180, refreshDelay: 10, likeDelay: 5, scrollCount: 3, blocked: [], whiteList: [], blockGroups: {}, filterKeywords: [], filterMode: 'block', dailyLimit: 0, select: false, theme: 'default', themeHue: 0, darkModeAuto: true, statusOpacity: 0.8, statusBgColor: 'linear-gradient(to right, #333, #222)', statusTextColor: '#ddd', statusTextBrightness: 1.0, menuOpacity: 0.9, menuBgColor: 'linear-gradient(to bottom, #ffffff, #f0f0f0)', maxRetries: 3, scrollStepPercent: 0.9, initialDelay: 3000, randomDelayMin: 1, randomDelayMax: 3, logLevel: 'INFO', enableNotifications: false, enableLoginCheck: true, tryBrowserAutofill: true, checkInterval: 60, autoTriggerThreshold: 3, stats: { likes: 0, skips: 0, errors: 0 }, logs: [] };
            currentAccount = acc;
        }
    }

    function saveAccountConfig() {
        accounts[currentAccount] = {
            duration: duration, refreshDelay: refreshDelay, likeDelay: likeDelay, scrollCount: scrollCount, blocked: blocked, whiteList: whiteList, blockGroups: blockGroups, filterKeywords: filterKeywords, filterMode: filterMode, dailyLimit: dailyLimit, select: select, theme: theme, themeHue: themeHue, darkModeAuto: darkModeAuto, statusOpacity: statusOpacity, statusBgColor: statusBgColor, statusTextColor: statusTextColor, statusTextBrightness: statusTextBrightness, menuOpacity: menuOpacity, menuBgColor: menuBgColor, maxRetries: maxRetries, scrollStepPercent: scrollStepPercent, initialDelay: initialDelay, randomDelayMin: randomDelayMin, randomDelayMax: randomDelayMax, logLevel: logLevel, enableNotifications: enableNotifications, enableLoginCheck: enableLoginCheck, tryBrowserAutofill: tryBrowserAutofill, checkInterval: checkInterval, autoTriggerThreshold: autoTriggerThreshold, stats: stats[currentAccount], logs: logs[currentAccount]
        };
        localStorage.setItem('al-accounts', JSON.stringify(accounts));
    }

    // 自动暗黑模式
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
        let menu = document.getElementById('al-menu');
        if (menu) {
            menu.style.background = menuBgColor;
        }
    }

    // 创建状态栏
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
        statusBar.style.filter = 'brightness(' + statusTextBrightness + ')';
        statusBar.style.pointerEvents = 'auto';
        statusBar.style.cursor = 'pointer';
        statusBar.style.display = 'grid';
        statusBar.style.gridTemplateColumns = '1fr 2fr 1fr';
        statusBar.style.transition = 'opacity 0.3s ease, background 0.3s ease';
        document.body.appendChild(statusBar);

        statusBar.addEventListener('click', function() {
            this.style.height = this.style.height === 'auto' ? '' : 'auto';
        });

        setInterval(updateStatusBar, 1000);
        updateStatusBar();
    }

    // 更新状态栏
    function updateStatusBar(message) {
        resetDailyCount();
        duration = parseInt(localStorage.getItem('al-duration')) || duration;
        refreshDelay = parseInt(localStorage.getItem('al-refreshDelay')) || refreshDelay;
        likeDelay = parseInt(localStorage.getItem('al-likeDelay')) || likeDelay;
        scrollCount = parseInt(localStorage.getItem('al-scrollCount')) || scrollCount;

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

    // 安全点赞
    let likeDebounce = null;
    function safeLike() {
        try {
            if (isPaused) {
                updateStatusBar('脚本已暂停，跳过点赞');
                return;
            }
            if (currentTask === '执行安全点赞') return;
            if (likeDebounce) clearTimeout(likeDebounce);
            likeDebounce = setTimeout(function() {
                if (!checkLoginStatus()) return;
                currentTask = '执行安全点赞';
                taskStartTime = Date.now();
                const btns = document.querySelectorAll('.qz_like_btn_v3');
                const contents = document.querySelectorAll('.f-info');
                const users = document.querySelectorAll('.f-name');
                let toLike = [];
                let skipped = 0;

                Array.from(btns).forEach(function(btn, index) {
                    const contentElem = contents[index];
                    const content = contentElem ? contentElem.innerText : '';
                    const user = users[index] && users[index].getAttribute('link') ? users[index].getAttribute('link').replace('nameCard_', '') : '';

                    if (btn.classList.contains('item-on')) {
                        skipped++;
                        updateStats('skips');
                        log('INFO', '跳过已赞动态 ' + (index + 1));
                        return;
                    }

                    if (whiteList.includes(user)) {
                        toLike.push({btn: btn, content: content, index: index});
                        return;
                    }

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

                        if (item.btn.classList.contains('item-on')) {
                            log('WARN', '动态 ' + (item.index + 1) + ' 已赞，跳过点击');
                            return;
                        }

                        item.btn.click();
                        dailyCount++;
                        localStorage.setItem('al-dailyCount', dailyCount);
                        updateStats('likes');
                        console.log('Liked: ' + item.content);
                        updateStatusBar('点赞动态 ' + (item.index + 1) + ' / ' + btns.length);
                        log('INFO', '点赞动态 ' + (item.index + 1));

                        setTimeout(function() {
                            if (item.btn.classList.contains('item-on')) {
                                log('INFO', '动态 ' + (item.index + 1) + ' class更新为已赞');
                            } else {
                                log('WARN', '动态 ' + (item.index + 1) + ' class未及时更新');
                            }
                        }, 500);
                    }, cumulativeDelay - delay);
                });

                setTimeout(function() {
                    if (isPaused) return;
                    currentTask = '';
                    taskDuration = 0;
                    updateStatusBar('点赞完成，等待刷新');
                    log('INFO', '点赞完成');
                    sendNotification('点赞完成', '本次点赞: ' + effectiveLikes);
                }, cumulativeDelay + 1000);
            }, 500);
        } catch (e) {
            log('ERROR', '安全点赞异常: ' + e.message);
            updateStats('errors');
        }
    }

    // 模拟滚动
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
                    maxScrolls++;
                }
                if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100) {
                    maxScrolls = i + 1;
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
            localStorage.setItem('al-lastRefresh', lastRefresh);
            nextTime = Date.now() + duration * 1000;
            localStorage.setItem('al-justRefreshed', 'true');
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
        if (!checkLoginStatus()) return;
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

    // 主循环（合并登录检测）
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
            if (time % (checkInterval * 1000) < 1000) {
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
            createFloatingButton();
            createStatusBar();
            applyDarkMode();

            removeMeRelatedMenu();

            if (localStorage.getItem('al-justRefreshed')) {
                localStorage.removeItem('al-justRefreshed');
                setTimeout(executeWorkflow, 3000);
            }

            loadAccountConfig(currentAccount);

            // 初始登录检查
            setTimeout(() => checkLoginStatus(), 2000);

            log('INFO', '脚本初始化完成');
        } catch (e) {
            log('ERROR', '初始化异常: ' + e.message);
            updateStats('errors');
        }
    };

    // 新函数：过滤日志
    window.filterLogs = function() {
        let search = document.getElementById('al-log-search').value.toLowerCase();
        let filtered = (logs[currentAccount] || []).filter(log => log.toLowerCase().includes(search));
        document.getElementById('al-log-list').innerHTML = filtered.join('<br>');
    };

    console.log('Auto Like Enhanced v2.8.7 Running...');
})();
