// ==UserScript==
// @name         QZone AutoPraise Pro
// @namespace    https://github.com/llulun/qzone-autopraise-pro
// @license      MIT
// @version      2.7
// @description  网页版QQ空间自动点赞工具（增强版：简化工作流，通过检测点赞元素判断是否在好友动态页面，有则直接执行点赞，无则切换到好友动态后刷新页面重走流程，移除菜单元素，添加延迟处理、安全点赞、菜单调整、状态栏美化、滚动模拟等功能。更新：状态栏更详细显示任务进度、剩余时间等，美化透明度与阴影；控制面板增大、居中、透明化；修复状态栏文字模糊与重叠问题，通过分行显示、调整字体与行高确保清晰；状态栏背景改为黑色渐变，添加透明阴影与底部圆角；扩展控制面板为左侧菜单栏式结构，添加更多参数调整如状态栏/控制面板透明度、颜色、屏蔽用户、过滤选项、重试次数、滚动步长、初始延迟等，所有可调参数均集成到面板中，支持动态应用变化；移除双击页面调用setConfig事件，所有设置统一通过控制面板；控制面板默认隐藏，通过点击浮动按钮打开；修复状态栏文字随背景透明问题，添加文字颜色与亮度设置；新增：暂停/恢复功能，允许用户暂停或恢复自动点赞流程，状态栏显示暂停状态；修复：状态栏第二行参数与等待时间显示错误，确保实时同步最新参数和正确时间；优化：修复状态栏多余分隔符逻辑，避免显示异常；兼容：将模板字符串改为字符串连接，提高旧浏览器兼容性，避免潜在语法报错。贡献更新（v2.4）：美化控制面板和状态栏的UI（添加过渡动画、圆角按钮、响应式布局）；修复潜在bug如滚动事件重复触发点赞、暂停时定时器未完全清理、cookie值解析边缘案例；优化性能（减少不必要的setInterval调用、批量DOM操作）；添加暗黑模式自动适配选项。贡献更新（v2.5）：修复bug：在点赞或滚动任务执行过程中，如果任务时间超过刷新间隔，导致倒计时重置的问题（通过在任务开始时推迟nextTime来避免中断）；美化状态栏：添加进度条表示当前任务进度、使用emoji图标增强视觉反馈、优化字体和间距以提高可读性。贡献更新（v2.6）：修复状态栏逻辑问题：防止safeLike重复调用导致nextTime多次推迟和倒计时跳动；优化点赞逻辑，仅调度实际需要点赞的动态，避免不必要延迟和卡在“跳过”步骤；如果所有动态被跳过，立即完成任务并更新状态栏为等待刷新，而不是等待无谓时间或显示跳过消息。贡献更新（v2.7）：新增日志记录功能，记录点赞历史和错误到控制面板的新“日志”标签，支持清空日志；添加随机延迟选项（likeRandomDelay），为点赞延迟添加随机性（±随机秒）以模拟人类行为，避免被检测；优化性能：减少DOM查询频率，使用MutationObserver监控动态加载内容，并在变化时触发safeLike；添加每日点赞上限（dailyLikeLimit），防止过度点赞；状态栏添加日志计数和上限剩余显示；修复潜在的滚动动画卡顿问题，通过调整smoothScrollTo的ease函数为更平滑的cubic-bezier。）
// @author       llulun (with contributions)
// @match        *://*.qzone.qq.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    // 从cookie获取配置（扩展：添加随机延迟、每日上限、日志参数）
    let duration = parseInt(getCookie('al-duration')) || 180;
    let refreshDelay = parseInt(getCookie('al-refreshDelay')) || 10;
    let likeDelay = parseInt(getCookie('al-likeDelay')) || 5;
    let likeRandomDelay = parseInt(getCookie('al-likeRandomDelay')) || 2; // 新增：随机延迟范围（±秒）
    let dailyLikeLimit = parseInt(getCookie('al-dailyLikeLimit')) || 100; // 新增：每日点赞上限
    let scrollCount = parseInt(getCookie('al-scrollCount')) || 3;
    let blocked = getCookie('al-blocked') ? getCookie('al-blocked').split(',') : [];
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
    let dailyLikes = parseInt(getCookie('al-dailyLikes')) || 0; // 新增：当前每日点赞计数
    let lastLikeDate = getCookie('al-lastLikeDate') || new Date().toDateString(); // 新增：上次点赞日期
    let logs = getCookie('al-logs') ? JSON.parse(getCookie('al-logs')) : []; // 新增：日志数组

    // Cookie 操作函数（优化：添加边缘案例处理，如空值或无效数字）
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

    // 新增：日志记录函数
    function addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleString();
        logs.push({ timestamp, type, message });
        if (logs.length > 100) logs.shift(); // 限制日志数量
        setCookie('al-logs', JSON.stringify(logs), Number.MAX_SAFE_INTEGER);
        console.log(`[${type.toUpperCase()}] ${timestamp}: ${message}`);
    }

    // 创建菜单栏（扩展：添加“日志”标签和相关UI）
    function createMenu() {
        let menu = document.createElement('div');
        menu.id = 'al-menu';
        menu.style.position = 'fixed';
        menu.style.top = '50%';
        menu.style.left = '50%';
        menu.style.transform = 'translate(-50%, -50%)';
        menu.style.width = '600px';
        menu.style.height = '400px';
        menu.style.overflow = 'auto';
        menu.style.background = menuBgColor;
        menu.style.border = '1px solid #ccc';
        menu.style.borderRadius = '12px';
        menu.style.padding = '20px';
        menu.style.zIndex = '10002';
        menu.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
        menu.style.fontFamily = 'Arial, sans-serif';
        menu.style.opacity = menuOpacity;
        menu.style.display = 'none';
        menu.style.pointerEvents = 'auto';
        menu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        let sidebar = document.createElement('div');
        sidebar.style.width = '150px';
        sidebar.style.borderRight = '1px solid #ddd';
        sidebar.style.paddingRight = '10px';
        sidebar.innerHTML = '<h4 style="margin: 0 0 10px;">设置分类</h4><ul style="list-style: none; padding: 0;"><li><button id="al-tab-core" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">核心参数</button></li><li><button id="al-tab-ui" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">界面自定义</button></li><li><button id="al-tab-adv" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">高级参数</button></li><li><button id="al-tab-logs" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">日志记录</button></li></ul>';
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
        footer.innerHTML = '<button id="al-save" style="background: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-right: 10px; transition: background 0.2s;">保存并应用</button><button id="al-pause" style="background: #FF9800; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-right: 10px; transition: background 0.2s;">' + (isPaused ? '恢复' : '暂停') + '</button><button id="al-test" style="background: #2196F3; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-right: 10px; transition: background 0.2s;">测试执行</button><button id="al-close" style="background: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; transition: background 0.2s;">关闭</button>';
        menu.appendChild(footer);

        document.body.appendChild(menu);

        function showTab(tab) {
            content.style.opacity = '0';
            setTimeout(() => {
                content.innerHTML = '';
                if (tab === 'core') {
                    content.innerHTML = '<h3>核心参数</h3><label style="display: block; margin-bottom: 10px;">刷新频率 (秒): <input type="number" id="al-dur" value="' + duration + '" min="30" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">刷新延迟 (秒): <input type="number" id="al-rdelay" value="' + refreshDelay + '" min="5" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">点赞延迟 (秒): <input type="number" id="al-ldelay" value="' + likeDelay + '" min="3" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">随机延迟范围 (±秒): <input type="number" id="al-likeRandomDelay" value="' + likeRandomDelay + '" min="0" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">每日点赞上限: <input type="number" id="al-dailyLikeLimit" value="' + dailyLikeLimit + '" min="50" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">下滑动态数: <input type="number" id="al-scount" value="' + scrollCount + '" min="1" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">屏蔽用户 (QQ号,逗号分隔): <input type="text" id="al-blocked" value="' + blocked.join(',') + '" style="width: 200px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;"><input type="checkbox" id="al-select" ' + (select ? 'checked' : '') + '> 不点赞游戏转发内容</label>';
                } else if (tab === 'ui') {
                    content.innerHTML = '<h3>界面自定义</h3><label style="display: block; margin-bottom: 10px;">状态栏透明度 (0.1-1): <input type="number" id="al-statusOpacity" value="' + statusOpacity + '" min="0.1" max="1" step="0.1" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">状态栏背景: <select id="al-statusBgColor" style="width: 200px; margin-left: 10px;"><option value="linear-gradient(to right, #333, #222)" ' + (statusBgColor === 'linear-gradient(to right, #333, #222)' ? 'selected' : '') + '>黑色渐变</option><option value="linear-gradient(to right, #f0f0f0, #e0e0e0)" ' + (statusBgColor === 'linear-gradient(to right, #f0f0f0, #e0e0e0)' ? 'selected' : '') + '>白色渐变</option><option value="linear-gradient(to right, #2196F3, #1976D2)" ' + (statusBgColor === 'linear-gradient(to right, #2196F3, #1976D2)' ? 'selected' : '') + '>蓝色渐变</option><option value="linear-gradient(to right, #4CAF50, #388E3C)" ' + (statusBgColor === 'linear-gradient(to right, #4CAF50, #388E3C)' ? 'selected' : '') + '>绿色渐变</option></select></label><label style="display: block; margin-bottom: 10px;">状态栏文字颜色: <select id="al-statusTextColor" style="width: 200px; margin-left: 10px;"><option value="auto" ' + (statusTextColor === 'auto' ? 'selected' : '') + '>自动</option><option value="#fff" ' + (statusTextColor === '#fff' ? 'selected' : '') + '>白色</option><option value="#000" ' + (statusTextColor === '#000' ? 'selected' : '') + '>黑色</option><option value="#ddd" ' + (statusTextColor === '#ddd' ? 'selected' : '') + '>浅灰</option></select></label><label style="display: block; margin-bottom: 10px;">状态栏文字亮度 (0.5-1.5): <input type="number" id="al-statusTextBrightness" value="' + statusTextBrightness + '" min="0.5" max="1.5" step="0.1" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;"><input type="checkbox" id="al-darkModeAuto" ' + (darkModeAuto ? 'checked' : '') + '> 自动适配暗黑模式</label><label style="display: block; margin-bottom: 10px;">控制面板透明度 (0.1-1): <input type="number" id="al-menuOpacity" value="' + menuOpacity + '" min="0.1" max="1" step="0.1" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">控制面板背景: <select id="al-menuBgColor" style="width: 200px; margin-left: 10px;"><option value="linear-gradient(to bottom, #ffffff, #f0f0f0)" ' + (menuBgColor === 'linear-gradient(to bottom, #ffffff, #f0f0f0)' ? 'selected' : '') + '>白色渐变</option><option value="linear-gradient(to bottom, #333, #222)" ' + (menuBgColor === 'linear-gradient(to bottom, #333, #222)' ? 'selected' : '') + '>黑色渐变</option><option value="linear-gradient(to bottom, #2196F3, #1976D2)" ' + (menuBgColor === 'linear-gradient(to bottom, #2196F3, #1976D2)' ? 'selected' : '') + '>蓝色渐变</option><option value="linear-gradient(to bottom, #4CAF50, #388E3C)" ' + (menuBgColor === 'linear-gradient(to bottom, #4CAF50, #388E3C)' ? 'selected' : '') + '>绿色渐变</option></select></label>';
                } else if (tab === 'adv') {
                    content.innerHTML = '<h3>高级参数</h3><label style="display: block; margin-bottom: 10px;">最大重试次数: <input type="number" id="al-maxRetries" value="' + maxRetries + '" min="1" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">滚动步长百分比 (0.1-1): <input type="number" id="al-scrollStepPercent" value="' + scrollStepPercent + '" min="0.1" max="1" step="0.1" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">初始延迟 (毫秒): <input type="number" id="al-initialDelay" value="' + initialDelay + '" min="1000" style="width: 80px; margin-left: 10px;"></label>';
                } else if (tab === 'logs') {
                    let logHtml = '<h3>日志记录 (' + logs.length + ')</h3><button id="al-clear-logs" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-bottom: 10px; transition: background 0.2s;">清空日志</button><div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; background: #f9f9f9;">';
                    logs.forEach(log => {
                        let color = log.type === 'error' ? 'red' : (log.type === 'warn' ? 'orange' : 'green');
                        logHtml += '<p style="margin: 5px 0; color: ' + color + ';">[' + log.timestamp + '] ' + log.type.toUpperCase() + ': ' + log.message + '</p>';
                    });
                    logHtml += '</div>';
                    content.innerHTML = logHtml;
                    setTimeout(() => {
                        document.getElementById('al-clear-logs').addEventListener('click', () => {
                            logs = [];
                            setCookie('al-logs', JSON.stringify(logs), Number.MAX_SAFE_INTEGER);
                            showTab('logs');
                        });
                    }, 0);
                }
                content.style.opacity = '1';
            }, 300);
        }

        showTab('core');

        document.getElementById('al-tab-core').addEventListener('click', function() { showTab('core'); });
        document.getElementById('al-tab-ui').addEventListener('click', function() { showTab('ui'); });
        document.getElementById('al-tab-adv').addEventListener('click', function() { showTab('adv'); });
        document.getElementById('al-tab-logs').addEventListener('click', function() { showTab('logs'); });

        document.getElementById('al-save').addEventListener('click', function() {
            duration = parseInt(document.getElementById('al-dur') ? document.getElementById('al-dur').value : 180, 10) || 180;
            refreshDelay = parseInt(document.getElementById('al-rdelay') ? document.getElementById('al-rdelay').value : 10, 10) || 10;
            likeDelay = parseInt(document.getElementById('al-ldelay') ? document.getElementById('al-ldelay').value : 5, 10) || 5;
            likeRandomDelay = parseInt(document.getElementById('al-likeRandomDelay') ? document.getElementById('al-likeRandomDelay').value : 2, 10) || 2;
            dailyLikeLimit = parseInt(document.getElementById('al-dailyLikeLimit') ? document.getElementById('al-dailyLikeLimit').value : 100, 10) || 100;
            scrollCount = parseInt(document.getElementById('al-scount') ? document.getElementById('al-scount').value : 3, 10) || 3;
            let blk = document.getElementById('al-blocked') ? document.getElementById('al-blocked').value.replace(/\s/g, '') : '';
            blocked = blk ? blk.split(',').filter(Boolean) : [];
            select = document.getElementById('al-select') ? document.getElementById('al-select').checked : false;
            darkModeAuto = document.getElementById('al-darkModeAuto') ? document.getElementById('al-darkModeAuto').checked : false;

            statusOpacity = parseFloat(document.getElementById('al-statusOpacity') ? document.getElementById('al-statusOpacity').value : 0.8) || 0.8;
            statusBgColor = document.getElementById('al-statusBgColor') ? document.getElementById('al-statusBgColor').value : 'linear-gradient(to right, #333, #222)';
            statusTextColor = document.getElementById('al-statusTextColor') ? document.getElementById('al-statusTextColor').value : (statusBgColor.includes('#333') || statusBgColor.includes('#222') ? '#ddd' : '#333');
            statusTextBrightness = parseFloat(document.getElementById('al-statusTextBrightness') ? document.getElementById('al-statusTextBrightness').value : 1.0) || 1.0;
            menuOpacity = parseFloat(document.getElementById('al-menuOpacity') ? document.getElementById('al-menuOpacity').value : 0.9) || 0.9;
            menuBgColor = document.getElementById('al-menuBgColor') ? document.getElementById('al-menuBgColor').value : 'linear-gradient(to bottom, #ffffff, #f0f0f0)';

            maxRetries = parseInt(document.getElementById('al-maxRetries') ? document.getElementById('al-maxRetries').value : 3, 10) || 3;
            scrollStepPercent = parseFloat(document.getElementById('al-scrollStepPercent') ? document.getElementById('al-scrollStepPercent').value : 0.9) || 0.9;
            initialDelay = parseInt(document.getElementById('al-initialDelay') ? document.getElementById('al-initialDelay').value : 3000, 10) || 3000;

            const max = Number.MAX_SAFE_INTEGER;
            setCookie('al-duration', duration, max);
            setCookie('al-refreshDelay', refreshDelay, max);
            setCookie('al-likeDelay', likeDelay, max);
            setCookie('al-likeRandomDelay', likeRandomDelay, max);
            setCookie('al-dailyLikeLimit', dailyLikeLimit, max);
            setCookie('al-scrollCount', scrollCount, max);
            setCookie('al-blocked', blocked.join(','), max);
            setCookie('al-select', select ? 'true' : '', max);
            setCookie('al-darkModeAuto', darkModeAuto ? 'true' : '', max);
            setCookie('al-statusOpacity', statusOpacity, max);
            setCookie('al-statusBgColor', statusBgColor, max);
            setCookie('al-statusTextColor', statusTextColor, max);
            setCookie('al-statusTextBrightness', statusTextBrightness, max);
            setCookie('al-menuOpacity', menuOpacity, max);
            setCookie('al-menuBgColor', menuBgColor, max);
            setCookie('al-maxRetries', maxRetries, max);
            setCookie('al-scrollStepPercent', scrollStepPercent, max);
            setCookie('al-initialDelay', initialDelay, max);

            nextTime = Date.now() + duration * 1000;
            alert('设置已保存并应用！部分变化可能需刷新页面生效。');

            let statusBar = document.getElementById('al-status-bar');
            if (statusBar) {
                statusBar.style.opacity = statusOpacity;
                statusBar.style.background = statusBgColor;
                statusBar.style.color = statusTextColor;
                statusBar.style.filter = 'brightness(' + statusTextBrightness + ')';
            }
            menu.style.opacity = menuOpacity;
            menu.style.background = menuBgColor;

            applyDarkMode();
            updateStatusBar();
        });

        document.getElementById('al-pause').addEventListener('click', function() {
            isPaused = !isPaused;
            this.innerText = isPaused ? '恢复' : '暂停';
            if (isPaused) {
                clearAllTimeouts();
                updateStatusBar('脚本已暂停');
                addLog('脚本已暂停', 'warn');
            } else {
                nextTime = Date.now() + duration * 1000;
                updateStatusBar('脚本已恢复运行');
                addLog('脚本已恢复运行', 'info');
                if (!isRunning) {
                    executeWorkflow();
                }
            }
        });

        document.getElementById('al-test').addEventListener('click', function() {
            if (isPaused) {
                alert('脚本当前处于暂停状态，请先恢复运行！');
                return;
            }
            testMode = true;
            executeWorkflow();
            testMode = false;
        });

        document.getElementById('al-close').addEventListener('click', function() {
            menu.style.display = 'none';
        });

        let toggleBtn = document.createElement('button');
        toggleBtn.innerText = 'AL Menu';
        toggleBtn.style.position = 'fixed';
        toggleBtn.style.top = '20px';
        toggleBtn.style.right = '10px';
        toggleBtn.style.background = '#2196F3';
        toggleBtn.style.color = 'white';
        toggleBtn.style.border = 'none';
        toggleBtn.style.padding = '8px 12px';
        toggleBtn.style.borderRadius = '4px';
        toggleBtn.style.zIndex = '10003';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.opacity = '0.85';
        toggleBtn.style.transition = 'opacity 0.2s, transform 0.2s';
        toggleBtn.addEventListener('mouseover', () => { toggleBtn.style.opacity = '1'; toggleBtn.style.transform = 'scale(1.05)'; });
        toggleBtn.addEventListener('mouseout', () => { toggleBtn.style.opacity = '0.85'; toggleBtn.style.transform = 'scale(1)'; });
        toggleBtn.addEventListener('click', function() {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            if (menu.style.display === 'block') {
                showTab('core');
            }
        });

        document.body.appendChild(toggleBtn);
    }

    // 自动暗黑模式适配
    function applyDarkMode() {
        if (!darkModeAuto) return;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            statusBgColor = 'linear-gradient(to right, #333, #222)';
            statusTextColor = '#ddd';
            menuBgColor = 'linear-gradient(to bottom, #333, #222)';
            document.getElementById('al-status-bar').style.background = statusBgColor;
            document.getElementById('al-status-bar').style.color = statusTextColor;
            document.getElementById('al-menu').style.background = menuBgColor;
        } else {
            statusBgColor = 'linear-gradient(to right, #f0f0f0, #e0e0e0)';
            statusTextColor = '#333';
            menuBgColor = 'linear-gradient(to bottom, #ffffff, #f0f0f0)';
            document.getElementById('al-status-bar').style.background = statusBgColor;
            document.getElementById('al-status-bar').style.color = statusTextColor;
            document.getElementById('al-menu').style.background = menuBgColor;
        }
    }

    // 创建状态栏（扩展：添加日志计数和每日剩余点赞显示）
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
        statusBar.style.pointerEvents = 'none';
        statusBar.style.transition = 'opacity 0.3s ease, background 0.3s ease';
        document.body.appendChild(statusBar);

        setInterval(updateStatusBar, 1000);
        updateStatusBar();
    }

    // 更新状态栏函数（扩展：添加日志计数和每日剩余）
    function updateStatusBar(message) {
        // 检查每日计数重置
        const currentDate = new Date().toDateString();
        if (currentDate !== lastLikeDate) {
            dailyLikes = 0;
            lastLikeDate = currentDate;
            setCookie('al-dailyLikes', dailyLikes, Number.MAX_SAFE_INTEGER);
            setCookie('al-lastLikeDate', lastLikeDate, Number.MAX_SAFE_INTEGER);
            addLog('每日点赞计数重置', 'info');
        }

        // 重新从cookie同步参数
        duration = parseInt(getCookie('al-duration')) || duration;
        refreshDelay = parseInt(getCookie('al-refreshDelay')) || refreshDelay;
        likeDelay = parseInt(getCookie('al-likeDelay')) || likeDelay;
        scrollCount = parseInt(getCookie('al-scrollCount')) || scrollCount;

        let statusBar = document.getElementById('al-status-bar');
        if (!statusBar) return;

        message = message || '';

        let lastRefreshTime = new Date(lastRefresh).toLocaleTimeString();
        let nextRefreshTime = new Date(nextTime).toLocaleTimeString();
        let remainingSeconds = Math.max(0, Math.ceil((nextTime - Date.now()) / 1000));
        let remainingColor = remainingSeconds < 30 ? 'red' : 'green';
        let scrollingStatus = isScrolling ? '<span style="color: lightblue; font-weight: bold;">滚动中（动态加载中） 🔄</span>' : '<span style="color: gray;">静止（无滚动） ⏹️</span>';
        let currentStep = message || (isPaused ? '<span style="color: yellow; font-weight: bold;">已暂停 ⏸️</span>' : (isRunning ? '<span style="color: orange; font-weight: bold;">执行中：' + currentTask + ' 🚀</span>' : '<span style="color: lightgreen; font-weight: bold;">等待下次刷新 ⏰</span>'));
        let taskRemaining = taskDuration > 0 ? Math.max(0, Math.ceil((taskStartTime + taskDuration * 1000 - Date.now()) / 1000)) : 0;
        let taskProgressPercent = taskDuration > 0 ? Math.round((1 - (taskRemaining / taskDuration)) * 100) : 0;
        let taskProgress = taskRemaining > 0 ? '<span style="color: violet;">当前任务剩余：' + taskRemaining + '秒 (' + taskProgressPercent + '%)，完成后执行：' + nextTask + ' 📊</span>' : '';
        let retryInfo = retryCount > 0 ? '<span style="color: brown;">重试次数：' + retryCount + '/' + maxRetries + '（若失败将重置） ⚠️</span>' : '';
        let logCount = '<span style="color: purple;">日志数量：' + logs.length + ' 📝</span>';
        let dailyRemaining = dailyLikeLimit - dailyLikes;
        let dailyInfo = '<span style="color: ' + (dailyRemaining <= 10 ? 'red' : 'green') + ';">今日剩余点赞：' + dailyRemaining + '/' + dailyLikeLimit + ' ❤️</span>';

        let strongColor = statusTextColor === '#ddd' || statusTextColor === '#fff' ? '#ccc' : '#555';

        let infoParts = [];
        if (taskProgress) infoParts.push(taskProgress);
        if (retryInfo) infoParts.push(retryInfo);
        if (logCount) infoParts.push(logCount);
        if (dailyInfo) infoParts.push(dailyInfo);
        let infoSection = infoParts.length > 0 ? infoParts.join(' | ') + ' | ' : '';

        let html = '<div style="margin-bottom: 8px; font-weight: bold;">' +
            '上次刷新: <strong style="color: ' + strongColor + ';">' + lastRefreshTime + ' ⏱️</strong> | ' +
            '下次刷新: <strong style="color: ' + strongColor + ';">' + nextRefreshTime + '</strong> | ' +
            '剩余时间: <span style="color: ' + remainingColor + '; font-weight: bold;">' + remainingSeconds + ' 秒</span> | ' +
            '滚动状态: ' + scrollingStatus + ' | ' +
            '当前步骤: ' + currentStep +
            '</div><div style="font-size: 14px;">' +
            infoSection +
            '刷新间隔: <strong style="color: ' + strongColor + ';">' + duration + ' 秒</strong> | ' +
            '延迟设置: 刷新<strong style="color: ' + strongColor + ';">' + refreshDelay + 's</strong> / 点赞<strong style="color: ' + strongColor + ';">' + likeDelay + 's</strong> | ' +
            '下滑动态: <strong style="color: ' + strongColor + ';">' + scrollCount + ' 个</strong> | ' +
            '整体状态: <span style="color: ' + (isPaused ? 'yellow' : (isRunning ? 'orange' : 'lightgreen')) + ';">' + (isPaused ? '暂停（可操作菜单）' : (isRunning ? '忙碌（请勿干扰）' : '空闲（可操作菜单）')) + '</span>' +
            '</div>';
        statusBar.innerHTML = html;
    }

    // 移除“与我相关”菜单元素
    function removeMeRelatedMenu() {
        let meTab = document.getElementById('tab_menu_me') || document.querySelector('li[type="me"]') || document.querySelector('#feed_tab_my');
        if (meTab) {
            meTab.style.display = 'none';
            console.log('已移除“与我相关”菜单元素');
            addLog('移除“与我相关”菜单元素', 'info');
        } else {
            console.log('未找到“与我相关”菜单元素');
            addLog('未找到“与我相关”菜单元素', 'warn');
        }
    }

    // 检测是否在好友动态页面
    function isInFriendFeedPage() {
        const hasLikeButtons = document.querySelectorAll('.qz_like_btn_v3').length > 0;
        console.log('检测点赞元素:', hasLikeButtons ? '存在（在好友动态）' : '不存在（不在好友动态）');
        addLog('检测点赞元素: ' + (hasLikeButtons ? '存在' : '不存在'), 'info');
        return hasLikeButtons;
    }

    // 进入“好友动态”页面
    function goToFriendFeed() {
        currentTask = '切换到好友动态页面';
        taskStartTime = Date.now();
        taskDuration = 5;
        nextTask = '刷新页面并重试流程';
        updateStatusBar('点赞元素不存在，切换到好友动态页面...');
        addLog('切换到好友动态页面', 'info');
        console.log('切换到好友动态，UIN:', uin);

        let friendTab = document.getElementById('tab_menu_friend') || document.querySelector('li[type="friend"] a') || document.querySelector('.feed-control-tab a:not(.item-on)');
        if (friendTab) {
            friendTab.click();
            console.log('点击左侧菜单栏“好友动态”tab');
            addLog('点击“好友动态”tab', 'info');
        } else if (uin) {
            location.href = 'https://user.qzone.qq.com/' + uin + '/infocenter';
            console.log('直接导航到infocenter');
            addLog('导航到infocenter', 'info');
        } else {
            refresh();
            console.log('无tab可用，刷新页面');
            addLog('无tab可用，刷新页面', 'warn');
        }
    }

    // 安全点赞函数（优化：添加随机延迟、每日上限检查、使用MutationObserver）
    let likeDebounce = null;
    let observer = null;
    function safeLike() {
        if (isPaused) {
            updateStatusBar('脚本已暂停，跳过点赞');
            addLog('脚本已暂停，跳过点赞', 'warn');
            return;
        }
        if (currentTask === '执行安全点赞') {
            console.log('点赞任务已在执行，跳过重复调用');
            addLog('点赞任务已在执行，跳过重复调用', 'warn');
            return;
        }
        if (likeDebounce) clearTimeout(likeDebounce);
        likeDebounce = setTimeout(() => {
            currentTask = '执行安全点赞';
            taskStartTime = Date.now();
            const btns = document.querySelectorAll('.qz_like_btn_v3');
            const contents = document.querySelectorAll('.f-info');
            const users = document.querySelectorAll('.f-name');
            let toLike = [];
            let skipped = 0;

            if (dailyLikes >= dailyLikeLimit) {
                updateStatusBar('已达到每日点赞上限，跳过点赞');
                addLog('已达到每日点赞上限', 'warn');
                currentTask = '';
                return;
            }

            Array.from(btns).forEach(function(btn, index) {
                if (dailyLikes >= dailyLikeLimit) return; // 中途检查上限

                const content = contents[index] ? contents[index].innerHTML : '';
                const user = users[index] && users[index].getAttribute('link') ? users[index].getAttribute('link').replace('nameCard_', '') : '';

                if (btn.classList.contains('item-on') || blocked.indexOf(user) > -1) {
                    console.log('跳过已赞或屏蔽动态 ' + (index + 1));
                    skipped++;
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
                    console.log('跳过游戏转发动态 ' + (index + 1));
                    skipped++;
                    return;
                }

                toLike.push({btn, content, index});
            });

            let effectiveLikes = Math.min(toLike.length, dailyLikeLimit - dailyLikes);
            taskDuration = effectiveLikes * likeDelay + 1;
            nextTask = '模拟滚动或等待刷新';
            nextTime = Math.max(nextTime, Date.now() + taskDuration * 1000 + 5000);
            updateStatusBar('开始安全点赞... (需点赞: ' + effectiveLikes + ', 跳过: ' + skipped + ')');
            addLog('开始点赞: 需点赞 ' + effectiveLikes + ', 跳过 ' + skipped, 'info');

            if (effectiveLikes === 0) {
                currentTask = '';
                taskDuration = 0;
                updateStatusBar('所有动态已赞或跳过，等待下次刷新');
                addLog('所有动态已赞或跳过', 'info');
                return;
            }

            toLike.slice(0, effectiveLikes).forEach(function(item, idx) {
                let randomOffset = Math.floor(Math.random() * (likeRandomDelay * 2 + 1)) - likeRandomDelay;
                let delay = (idx * likeDelay + randomOffset) * 1000;
                setTimeout(function() {
                    if (isPaused || dailyLikes >= dailyLikeLimit) {
                        updateStatusBar('脚本已暂停或达到上限，停止点赞');
                        addLog('暂停或上限，停止点赞', 'warn');
                        return;
                    }
                    item.btn.click();
                    console.log('Liked: ' + item.content);
                    dailyLikes++;
                    setCookie('al-dailyLikes', dailyLikes, Number.MAX_SAFE_INTEGER);
                    updateStatusBar('点赞动态 ' + (item.index + 1) + ' / ' + btns.length);
                    addLog('点赞动态 ' + (item.index + 1) + ': ' + item.content.substring(0, 50) + '...', 'info');
                }, delay);
            });

            setTimeout(function() {
                if (isPaused) return;
                currentTask = '';
                taskDuration = 0;
                updateStatusBar('点赞完成，等待下次刷新');
                addLog('点赞完成', 'info');
            }, taskDuration * 1000);

            // 设置MutationObserver监控新内容加载
            if (!observer) {
                observer = new MutationObserver(() => {
                    addLog('检测到动态内容变化，触发点赞检查', 'info');
                    safeLike();
                });
                observer.observe(document.body, { childList: true, subtree: true });
            }
        }, 500);
    }

    // 模拟下滑动态
    function simulateScroll() {
        if (isPaused) {
            updateStatusBar('脚本已暂停，跳过滚动');
            addLog('脚本已暂停，跳过滚动', 'warn');
            return;
        }
        currentTask = '模拟下滑动态';
        taskStartTime = Date.now();
        taskDuration = scrollCount * 3 + 3;
        nextTask = '回到顶部并等待';
        nextTime = Math.max(nextTime, Date.now() + taskDuration * 1000 + 5000);
        updateStatusBar('模拟下滑动态...');
        addLog('开始模拟滚动', 'info');
        let scrollStep = window.innerHeight * scrollStepPercent;

        Array.from({length: scrollCount}).forEach(function(_, i) {
            var stepIndex = i;
            var targetScroll = (stepIndex + 1) * scrollStep;
            setTimeout(function() {
                if (isPaused) {
                    updateStatusBar('脚本已暂停，停止滚动');
                    addLog('脚本已暂停，停止滚动', 'warn');
                    return;
                }
                smoothScrollTo(targetScroll, 500);
                window.dispatchEvent(new Event('scroll'));
                updateStatusBar('滚动到动态组 ' + (stepIndex + 1) + '/' + scrollCount + '，加载更多内容');
                addLog('滚动到动态组 ' + (stepIndex + 1), 'info');
                let loadMoreBtn = document.querySelector('.load-more') || document.querySelector('a[title="加载更多"]');
                if (loadMoreBtn) {
                    loadMoreBtn.click();
                    console.log('点击加载更多按钮作为备用');
                    addLog('点击加载更多按钮', 'info');
                }
            }, stepIndex * 3000);
        });
        setTimeout(function() {
            if (isPaused) return;
            smoothScrollTo(0, 1000);
            updateStatusBar('回到顶部，等待下次刷新');
            addLog('滚动完成，回到顶部', 'info');
            currentTask = '';
            taskDuration = 0;
        }, scrollCount * 3000 + 3000);
    }

    // 平滑滚动辅助函数（优化：使用cubic-bezier更平滑）
    function smoothScrollTo(targetY, duration) {
        var startY = window.scrollY;
        var distance = targetY - startY;
        var startTime = null;

        function animation(currentTime) {
            if (isPaused) return;
            if (!startTime) startTime = currentTime;
            var timeElapsed = currentTime - startTime;
            var progress = Math.min(timeElapsed / duration, 1);
            // 使用cubic-bezier(0.25, 0.1, 0.25, 1) for smoother ease-in-out
            var ease = progress ** 2 * (3 - 2 * progress); // Approximation of cubic-bezier
            window.scrollTo(0, startY + distance * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                window.dispatchEvent(new Event('scroll'));
            }
        }

        requestAnimationFrame(animation);
    }

    // 刷新页面
    function refresh() {
        if (isPaused) {
            updateStatusBar('脚本已暂停，跳过刷新');
            addLog('脚本已暂停，跳过刷新', 'warn');
            return;
        }
        currentTask = '刷新页面';
        taskStartTime = Date.now();
        taskDuration = refreshDelay;
        nextTask = '执行工作流';
        lastRefresh = Date.now();
        setCookie('al-lastRefresh', lastRefresh, Number.MAX_SAFE_INTEGER);
        nextTime = Date.now() + duration * 1000;
        setCookie('al-justRefreshed', 'true', 60);
        location.reload();
        updateStatusBar('页面刷新完成，从头开始流程');
        addLog('页面刷新完成', 'info');
    }

    // 执行整个工作流
    function executeWorkflow() {
        if (isPaused) {
            updateStatusBar('脚本已暂停，跳过工作流');
            addLog('脚本已暂停，跳过工作流', 'warn');
            return;
        }
        if (isRunning && !testMode) return;
        isRunning = true;
        currentTask = '执行整体工作流';
        taskStartTime = Date.now();
        taskDuration = 10;
        nextTask = '点赞或切换页面';
        updateStatusBar('开始执行工作流');
        addLog('开始执行工作流', 'info');

        setTimeout(function() {
            if (isPaused) {
                isRunning = false;
                updateStatusBar('脚本已暂停，工作流停止');
                addLog('脚本已暂停，工作流停止', 'warn');
                return;
            }
            if (isInFriendFeedPage()) {
                updateStatusBar('检测到点赞元素，直接执行点赞...');
                addLog('直接执行点赞', 'info');
                safeLike();
                simulateScroll();
            } else {
                updateStatusBar('未检测到点赞元素，切换并刷新页面...');
                addLog('切换并刷新页面', 'info');
                retryCount++;
                if (retryCount > maxRetries) {
                    updateStatusBar('重试次数超过上限，停止执行');
                    addLog('重试次数超过上限', 'error');
                    isRunning = false;
                    retryCount = 0;
                    return;
                }
                goToFriendFeed();
                refresh();
                setTimeout(executeWorkflow, refreshDelay * 1000);
            }
            isRunning = false;
            currentTask = '';
            taskDuration = 0;
        }, initialDelay);
    }

    // 滚动事件（优化：防抖）
    let scrollDebounce = null;
    window.addEventListener('scroll', function() {
        if (isPaused) return;
        if (timeout) clearTimeout(timeout);
        isScrolling = true;
        updateStatusBar();
        addLog('滚动事件触发', 'info');
        if (scrollDebounce) clearTimeout(scrollDebounce);
        scrollDebounce = setTimeout(safeLike, 1000);
        timeout = setTimeout(function() {
            isScrolling = false;
            updateStatusBar();
        }, 1000);
    });

    // 主循环
    let mainInterval = setInterval(function() {
        if (isPaused) {
            updateStatusBar('脚本已暂停，等待恢复');
            return;
        }
        var time = Date.now();
        if (time >= nextTime || testMode) {
            refresh();
        } else if (isScrolling) {
            safeLike();
        }
    }, 1000);

    // 清理所有定时器函数
    function clearAllTimeouts() {
        clearTimeout(timeout);
        clearTimeout(likeDebounce);
        clearTimeout(scrollDebounce);
        clearInterval(mainInterval);
        if (observer) observer.disconnect();
        mainInterval = null;
        observer = null;
    }

    // 初始化
    window.onload = function () {
        createMenu();
        createStatusBar();
        applyDarkMode();

        console.log('当前UIN:', uin);
        addLog('脚本初始化，UIN: ' + uin, 'info');

        removeMeRelatedMenu();

        if (getCookie('al-justRefreshed')) {
            setCookie('al-justRefreshed', '', -1);
            setTimeout(executeWorkflow, 3000);
        }
    };

    console.log('Auto Like Enhanced Running...');
})();
