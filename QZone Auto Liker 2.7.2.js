// ==UserScript==
// @name         QZone Auto Liker
// @namespace    https://github.com/llulun/qzone-autopraise-pro
// @license      MIT
// @version      2.7.2
// @description  网页版QQ空间自动点赞工具（增强版：简化工作流，通过检测点赞元素判断是否在好友动态页面，有则直接执行点赞，无则切换到好友动态后刷新页面重走流程，移除菜单元素，添加延迟处理、安全点赞、菜单调整、状态栏美化、滚动模拟等功能。更新：状态栏更详细显示任务进度、剩余时间等，美化透明度与阴影；控制面板增大、居中、透明化；修复状态栏文字模糊与重叠问题，通过分行显示、调整字体与行高确保清晰；状态栏背景改为黑色渐变，添加透明阴影与底部圆角；扩展控制面板为左侧菜单栏式结构，添加更多参数调整如状态栏/控制面板透明度、颜色、屏蔽用户、过滤选项、重试次数、滚动步长、初始延迟等，所有可调参数均集成到面板中，支持动态应用变化；移除双击页面调用setConfig事件，所有设置统一通过控制面板；控制面板默认隐藏，通过点击浮动按钮打开；修复状态栏文字随背景透明问题，添加文字颜色与亮度设置；新增：暂停/恢复功能，允许用户暂停或恢复自动点赞流程，状态栏显示暂停状态；修复：状态栏第二行参数与等待时间显示错误，确保实时同步最新参数和正确时间；优化：修复状态栏多余分隔符逻辑，避免显示异常；兼容：将模板字符串改为字符串连接，提高旧浏览器兼容性，避免潜在语法报错。贡献更新（v2.4）：美化控制面板和状态栏的UI（添加过渡动画、圆角按钮、响应式布局）；修复潜在bug如滚动事件重复触发点赞、暂停时定时器未完全清理、cookie值解析边缘案例；优化性能（减少不必要的setInterval调用、批量DOM操作）；添加暗黑模式自动适配选项。贡献更新（v2.5）：修复bug：在点赞或滚动任务执行过程中，如果任务时间超过刷新间隔，导致倒计时重置的问题（通过在任务开始时推迟nextTime来避免中断）；美化状态栏：添加进度条表示当前任务进度、使用emoji图标增强视觉反馈、优化字体和间距以提高可读性。贡献更新（v2.6）：修复状态栏逻辑问题：防止safeLike重复调用导致nextTime多次推迟和倒计时跳动；优化点赞逻辑，仅调度实际需要点赞的动态，避免不必要延迟和卡在“跳过”步骤；如果所有动态被跳过，立即完成任务并更新状态栏为等待刷新，而不是等待无谓时间或显示跳过消息。）
// @author       llulun (with contributions)
// @match        *://*.qzone.qq.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    // 从cookie获取配置（扩展：添加文字颜色与亮度参数，新增暗黑模式选项）
    let duration = parseInt(getCookie('al-duration')) || 180;
    let refreshDelay = parseInt(getCookie('al-refreshDelay')) || 10;
    let likeDelay = parseInt(getCookie('al-likeDelay')) || 5;
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
    let darkModeAuto = Boolean(getCookie('al-darkModeAuto')); // 新增：自动暗黑模式
    let logLevel = getCookie('al-logLevel') || 'INFO'; // 新增：日志级别，默认 INFO
    let logs = []; // 新增：存储日志的数组，最大500条

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

    // 新增：日志函数（修改：同时存储到logs数组，并输出到控制台）
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

            // 存储到logs数组，限制最大500条
            logs.push(fullMessage);
            if (logs.length > 500) {
                logs.shift();
            }
        } catch (e) {
            // 静默失败，避免日志影响主流程
        }
    }

    // 新增：判断是否应输出日志（基于当前级别）
    function shouldLog(level) {
        const levels = { 'INFO': 0, 'WARN': 1, 'ERROR': 2 };
        return levels[logLevel] <= levels[level];
    }

    // 创建菜单栏（美化：添加过渡动画、圆角按钮、响应式布局；新增暗黑模式选项；新增日志查看标签）
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
        menu.style.transition = 'opacity 0.3s ease, transform 0.3s ease'; // 新增过渡动画

        let sidebar = document.createElement('div');
        sidebar.style.width = '150px';
        sidebar.style.borderRight = '1px solid #ddd';
        sidebar.style.paddingRight = '10px';
        sidebar.innerHTML = '<h4 style="margin: 0 0 10px;">设置分类</h4><ul style="list-style: none; padding: 0;"><li><button id="al-tab-core" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">核心参数</button></li><li><button id="al-tab-ui" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">界面自定义</button></li><li><button id="al-tab-adv" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">高级参数</button></li><li><button id="al-tab-logs" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; transition: background 0.2s;">查看日志</button></li></ul>'; // 新增：查看日志标签
        menu.appendChild(sidebar);

        let content = document.createElement('div');
        content.id = 'al-content';
        content.style.flex = '1';
        content.style.paddingLeft = '20px';
        content.style.transition = 'opacity 0.3s ease'; // 新增过渡
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
                    content.innerHTML = '<h3>核心参数</h3><label style="display: block; margin-bottom: 10px;">刷新频率 (秒): <input type="number" id="al-dur" value="' + duration + '" min="30" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">刷新延迟 (秒): <input type="number" id="al-rdelay" value="' + refreshDelay + '" min="5" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">点赞延迟 (秒): <input type="number" id="al-ldelay" value="' + likeDelay + '" min="3" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">下滑动态数: <input type="number" id="al-scount" value="' + scrollCount + '" min="1" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">屏蔽用户 (QQ号,逗号分隔): <input type="text" id="al-blocked" value="' + blocked.join(',') + '" style="width: 200px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;"><input type="checkbox" id="al-select" ' + (select ? 'checked' : '') + '> 不点赞游戏转发内容</label>';
                } else if (tab === 'ui') {
                    content.innerHTML = '<h3>界面自定义</h3><label style="display: block; margin-bottom: 10px;">状态栏透明度 (0.1-1): <input type="number" id="al-statusOpacity" value="' + statusOpacity + '" min="0.1" max="1" step="0.1" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">状态栏背景: <select id="al-statusBgColor" style="width: 200px; margin-left: 10px;"><option value="linear-gradient(to right, #333, #222)" ' + (statusBgColor === 'linear-gradient(to right, #333, #222)' ? 'selected' : '') + '>黑色渐变</option><option value="linear-gradient(to right, #f0f0f0, #e0e0e0)" ' + (statusBgColor === 'linear-gradient(to right, #f0f0f0, #e0e0e0)' ? 'selected' : '') + '>白色渐变</option><option value="linear-gradient(to right, #2196F3, #1976D2)" ' + (statusBgColor === 'linear-gradient(to right, #2196F3, #1976D2)' ? 'selected' : '') + '>蓝色渐变</option><option value="linear-gradient(to right, #4CAF50, #388E3C)" ' + (statusBgColor === 'linear-gradient(to right, #4CAF50, #388E3C)' ? 'selected' : '') + '>绿色渐变</option></select></label><label style="display: block; margin-bottom: 10px;">状态栏文字颜色: <select id="al-statusTextColor" style="width: 200px; margin-left: 10px;"><option value="auto" ' + (statusTextColor === 'auto' ? 'selected' : '') + '>自动</option><option value="#fff" ' + (statusTextColor === '#fff' ? 'selected' : '') + '>白色</option><option value="#000" ' + (statusTextColor === '#000' ? 'selected' : '') + '>黑色</option><option value="#ddd" ' + (statusTextColor === '#ddd' ? 'selected' : '') + '>浅灰</option></select></label><label style="display: block; margin-bottom: 10px;">状态栏文字亮度 (0.5-1.5): <input type="number" id="al-statusTextBrightness" value="' + statusTextBrightness + '" min="0.5" max="1.5" step="0.1" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;"><input type="checkbox" id="al-darkModeAuto" ' + (darkModeAuto ? 'checked' : '') + '> 自动适配暗黑模式</label><label style="display: block; margin-bottom: 10px;">控制面板透明度 (0.1-1): <input type="number" id="al-menuOpacity" value="' + menuOpacity + '" min="0.1" max="1" step="0.1" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">控制面板背景: <select id="al-menuBgColor" style="width: 200px; margin-left: 10px;"><option value="linear-gradient(to bottom, #ffffff, #f0f0f0)" ' + (menuBgColor === 'linear-gradient(to bottom, #ffffff, #f0f0f0)' ? 'selected' : '') + '>白色渐变</option><option value="linear-gradient(to bottom, #333, #222)" ' + (menuBgColor === 'linear-gradient(to bottom, #333, #222)' ? 'selected' : '') + '>黑色渐变</option><option value="linear-gradient(to bottom, #2196F3, #1976D2)" ' + (menuBgColor === 'linear-gradient(to bottom, #2196F3, #1976D2)' ? 'selected' : '') + '>蓝色渐变</option><option value="linear-gradient(to bottom, #4CAF50, #388E3C)" ' + (menuBgColor === 'linear-gradient(to bottom, #4CAF50, #388E3C)' ? 'selected' : '') + '>绿色渐变</option></select></label>';
                } else if (tab === 'adv') {
                    content.innerHTML = '<h3>高级参数</h3><label style="display: block; margin-bottom: 10px;">最大重试次数: <input type="number" id="al-maxRetries" value="' + maxRetries + '" min="1" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">滚动步长百分比 (0.1-1): <input type="number" id="al-scrollStepPercent" value="' + scrollStepPercent + '" min="0.1" max="1" step="0.1" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">初始延迟 (毫秒): <input type="number" id="al-initialDelay" value="' + initialDelay + '" min="1000" style="width: 80px; margin-left: 10px;"></label><label style="display: block; margin-bottom: 10px;">日志级别: <select id="al-logLevel" style="width: 100px; margin-left: 10px;"><option value="INFO" ' + (logLevel === 'INFO' ? 'selected' : '') + '>INFO</option><option value="WARN" ' + (logLevel === 'WARN' ? 'selected' : '') + '>WARN</option><option value="ERROR" ' + (logLevel === 'ERROR' ? 'selected' : '') + '>ERROR</option></select></label>'; // 新增：日志级别选项
                } else if (tab === 'logs') { // 新增：日志查看标签
                    content.innerHTML = '<h3>系统日志</h3><div id="al-log-viewer" style="height: 300px; overflow-y: scroll; background: #f8f8f8; border: 1px solid #ddd; padding: 10px; font-family: monospace; font-size: 12px; white-space: pre-wrap;">' + logs.join('<br>') + '</div><button id="al-clear-logs" style="margin-top: 10px; background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">清除日志</button>';
                    document.getElementById('al-clear-logs').addEventListener('click', function() {
                        logs = [];
                        showTab('logs'); // 刷新日志视图
                    });
                }
                content.style.opacity = '1';
            }, 300);
        }

        showTab('core');

        document.getElementById('al-tab-core').addEventListener('click', function() { showTab('core'); });
        document.getElementById('al-tab-ui').addEventListener('click', function() { showTab('ui'); });
        document.getElementById('al-tab-adv').addEventListener('click', function() { showTab('adv'); });
        document.getElementById('al-tab-logs').addEventListener('click', function() { showTab('logs'); }); // 新增：日志标签事件

        document.getElementById('al-save').addEventListener('click', function() {
            duration = parseInt(document.getElementById('al-dur') ? document.getElementById('al-dur').value : 180, 10) || 180;
            refreshDelay = parseInt(document.getElementById('al-rdelay') ? document.getElementById('al-rdelay').value : 10, 10) || 10;
            likeDelay = parseInt(document.getElementById('al-ldelay') ? document.getElementById('al-ldelay').value : 5, 10) || 5;
            scrollCount = parseInt(document.getElementById('al-scount') ? document.getElementById('al-scount').value : 3, 10) || 3;
            let blk = document.getElementById('al-blocked') ? document.getElementById('al-blocked').value.replace(/\s/g, '') : '';
            blocked = blk ? blk.split(',').filter(Boolean) : []; // 优化：过滤空值
            select = document.getElementById('al-select') ? document.getElementById('al-select').checked : false;
            darkModeAuto = document.getElementById('al-darkModeAuto') ? document.getElementById('al-darkModeAuto').checked : false; // 新增

            statusOpacity = parseFloat(document.getElementById('al-statusOpacity') ? document.getElementById('al-statusOpacity').value : 0.8) || 0.8;
            statusBgColor = document.getElementById('al-statusBgColor') ? document.getElementById('al-statusBgColor').value : 'linear-gradient(to right, #333, #222)';
            statusTextColor = document.getElementById('al-statusTextColor') ? document.getElementById('al-statusTextColor').value : (statusBgColor.includes('#333') || statusBgColor.includes('#222') ? '#ddd' : '#333');
            statusTextBrightness = parseFloat(document.getElementById('al-statusTextBrightness') ? document.getElementById('al-statusTextBrightness').value : 1.0) || 1.0;
            menuOpacity = parseFloat(document.getElementById('al-menuOpacity') ? document.getElementById('al-menuOpacity').value : 0.9) || 0.9;
            menuBgColor = document.getElementById('al-menuBgColor') ? document.getElementById('al-menuBgColor').value : 'linear-gradient(to bottom, #ffffff, #f0f0f0)';

            maxRetries = parseInt(document.getElementById('al-maxRetries') ? document.getElementById('al-maxRetries').value : 3, 10) || 3;
            scrollStepPercent = parseFloat(document.getElementById('al-scrollStepPercent') ? document.getElementById('al-scrollStepPercent').value : 0.9) || 0.9;
            initialDelay = parseInt(document.getElementById('al-initialDelay') ? document.getElementById('al-initialDelay').value : 3000, 10) || 3000;
            logLevel = document.getElementById('al-logLevel') ? document.getElementById('al-logLevel').value : 'INFO'; // 新增：保存日志级别

            const max = Number.MAX_SAFE_INTEGER;
            setCookie('al-duration', duration, max);
            setCookie('al-refreshDelay', refreshDelay, max);
            setCookie('al-likeDelay', likeDelay, max);
            setCookie('al-scrollCount', scrollCount, max);
            setCookie('al-blocked', blocked.join(','), max);
            setCookie('al-select', select ? 'true' : '', max);
            setCookie('al-darkModeAuto', darkModeAuto ? 'true' : '', max); // 新增
            setCookie('al-statusOpacity', statusOpacity, max);
            setCookie('al-statusBgColor', statusBgColor, max);
            setCookie('al-statusTextColor', statusTextColor, max);
            setCookie('al-statusTextBrightness', statusTextBrightness, max);
            setCookie('al-menuOpacity', menuOpacity, max);
            setCookie('al-menuBgColor', menuBgColor, max);
            setCookie('al-maxRetries', maxRetries, max);
            setCookie('al-scrollStepPercent', scrollStepPercent, max);
            setCookie('al-initialDelay', initialDelay, max);
            setCookie('al-logLevel', logLevel, max); // 新增：保存日志级别到 cookie

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

            applyDarkMode(); // 新增：应用暗黑模式
            updateStatusBar();
        });

        document.getElementById('al-pause').addEventListener('click', function() {
            isPaused = !isPaused;
            this.innerText = isPaused ? '恢复' : '暂停';
            if (isPaused) {
                clearAllTimeouts(); // 修复：暂停时清理所有定时器
                updateStatusBar('脚本已暂停');
                log('INFO', '脚本暂停/恢复: 暂停'); // 新增日志
            } else {
                nextTime = Date.now() + duration * 1000; // 重置下次刷新时间
                updateStatusBar('脚本已恢复运行');
                if (!isRunning) {
                    executeWorkflow();
                }
                log('INFO', '脚本暂停/恢复: 恢复'); // 新增日志
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
        toggleBtn.style.transition = 'opacity 0.2s, transform 0.2s'; // 新增过渡
        toggleBtn.addEventListener('mouseover', () => { toggleBtn.style.opacity = '1'; toggleBtn.style.transform = 'scale(1.05)'; });
        toggleBtn.addEventListener('mouseout', () => { toggleBtn.style.opacity = '0.85'; toggleBtn.style.transform = 'scale(1)'; });
        toggleBtn.addEventListener('click', function() {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none'; // 改为block以兼容响应式
            if (menu.style.display === 'block') {
                showTab('core');
            }
        });

        document.body.appendChild(toggleBtn);

        log('INFO', '菜单面板加载完成'); // 新增日志
    }

    // 新增：自动暗黑模式适配
    function applyDarkMode() {
        if (!darkModeAuto) return;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            statusBgColor = 'linear-gradient(to right, #333, #222)';
            statusTextColor = '#ddd';
            menuBgColor = 'linear-gradient(to bottom, #333, #222)';
            // 更新DOM
            document.getElementById('al-status-bar').style.background = statusBgColor;
            document.getElementById('al-status-bar').style.color = statusTextColor;
            document.getElementById('al-menu').style.background = menuBgColor;
        } else {
            statusBgColor = 'linear-gradient(to right, #f0f0f0, #e0e0e0)';
            statusTextColor = '#333';
            menuBgColor = 'linear-gradient(to bottom, #ffffff, #f0f0f0)';
            // 更新DOM
            document.getElementById('al-status-bar').style.background = statusBgColor;
            document.getElementById('al-status-bar').style.color = statusTextColor;
            document.getElementById('al-menu').style.background = menuBgColor;
        }
    }

    // 创建状态栏（美化：添加过渡动画，优化字体）
    function createStatusBar() {
        let statusBar = document.createElement('div');
        statusBar.id = 'al-status-bar';
        statusBar.style.position = 'fixed';
        statusBar.style.top = '0';
        statusBar.style.left = '0';
        statusBar.style.width = '100%';
        statusBar.style.background = statusBgColor;
        statusBar.style.padding = '12px 24px'; // 增加padding提高可读性
        statusBar.style.zIndex = '10001';
        statusBar.style.fontSize = '15px'; // 稍大字体
        statusBar.style.lineHeight = '1.6'; // 增加行高
        statusBar.style.textAlign = 'center';
        statusBar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
        statusBar.style.borderRadius = '0 0 10px 10px';
        statusBar.style.fontFamily = 'Arial, sans-serif';
        statusBar.style.color = statusTextColor;
        statusBar.style.opacity = statusOpacity;
        statusBar.style.filter = 'brightness(' + statusTextBrightness + ')';
        statusBar.style.pointerEvents = 'none';
        statusBar.style.transition = 'opacity 0.3s ease, background 0.3s ease'; // 新增过渡
        document.body.appendChild(statusBar);

        setInterval(updateStatusBar, 1000);
        updateStatusBar();

        log('INFO', '状态栏加载完成'); // 新增日志
    }

    // 更新状态栏函数（优化：批量DOM更新，减少重绘；美化：添加emoji图标和简单进度条）
    function updateStatusBar(message) {
        // 重新从cookie同步参数，确保显示最新值
        duration = parseInt(getCookie('al-duration')) || duration;
        refreshDelay = parseInt(getCookie('al-refreshDelay')) || refreshDelay;
        likeDelay = parseInt(getCookie('al-likeDelay')) || likeDelay;
        scrollCount = parseInt(getCookie('al-scrollCount')) || scrollCount;

        let statusBar = document.getElementById('al-status-bar');
        if (!statusBar) return;

        message = message || '';

        if (message) {
            log('INFO', '状态栏更新: ' + message); // 新增日志，仅当有消息时
        }

        let lastRefreshTime = new Date(lastRefresh).toLocaleTimeString();
        let nextRefreshTime = new Date(nextTime).toLocaleTimeString();
        let remainingSeconds = Math.max(0, Math.ceil((nextTime - Date.now()) / 1000));
        let remainingColor = remainingSeconds < 30 ? 'red' : 'green';
        let scrollingStatus = isScrolling ? '<span style="color: lightblue; font-weight: bold;">滚动中（动态加载中） 🔄</span>' : '<span style="color: gray;">静止（无滚动） ⏹️</span>'; // 添加emoji
        let currentStep = message || (isPaused ? '<span style="color: yellow; font-weight: bold;">已暂停 ⏸️</span>' : (isRunning ? '<span style="color: orange; font-weight: bold;">执行中：' + currentTask + ' 🚀</span>' : '<span style="color: lightgreen; font-weight: bold;">等待下次刷新 ⏰</span>'));
        let taskRemaining = taskDuration > 0 ? Math.max(0, Math.ceil((taskStartTime + taskDuration * 1000 - Date.now()) / 1000)) : 0;
        let taskProgressPercent = taskDuration > 0 ? Math.round((1 - (taskRemaining / taskDuration)) * 100) : 0;
        let taskProgress = taskRemaining > 0 ? '<span style="color: violet;">当前任务剩余：' + taskRemaining + '秒 (' + taskProgressPercent + '%)，完成后执行：' + nextTask + ' 📊</span>' : ''; // 添加百分比进度
        let retryInfo = retryCount > 0 ? '<span style="color: brown;">重试次数：' + retryCount + '/' + maxRetries + '（若失败将重置） ⚠️</span>' : '';

        let strongColor = statusTextColor === '#ddd' || statusTextColor === '#fff' ? '#ccc' : '#555';

        // 优化第二行前部：过滤空值，join以 | 分隔，若不空则末尾添加 |
        let infoParts = [];
        if (taskProgress) infoParts.push(taskProgress);
        if (retryInfo) infoParts.push(retryInfo);
        let infoSection = infoParts.length > 0 ? infoParts.join(' | ') + ' | ' : '';

        // 批量构建HTML，美化间距
        let html = '<div style="margin-bottom: 8px; font-weight: bold;">' + // 增加margin
            '上次刷新: <strong style="color: ' + strongColor + ';">' + lastRefreshTime + ' ⏱️</strong> | ' +
            '下次刷新: <strong style="color: ' + strongColor + ';">' + nextRefreshTime + '</strong> | ' +
            '剩余时间: <span style="color: ' + remainingColor + '; font-weight: bold;">' + remainingSeconds + ' 秒</span> | ' +
            '滚动状态: ' + scrollingStatus + ' | ' +
            '当前步骤: ' + currentStep +
            '</div><div style="font-size: 14px;">' + // 第二行稍小字体
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
        } else {
            console.log('未找到“与我相关”菜单元素');
        }
    }

    // 检测是否在好友动态页面
    function isInFriendFeedPage() {
        const hasLikeButtons = document.querySelectorAll('.qz_like_btn_v3').length > 0;
        console.log('检测点赞元素:', hasLikeButtons ? '存在（在好友动态）' : '不存在（不在好友动态）');
        return hasLikeButtons;
    }

    // 进入“好友动态”页面
    function goToFriendFeed() {
        try {
            log('INFO', '进入好友动态页面'); // 新增日志
            currentTask = '切换到好友动态页面';
            taskStartTime = Date.now();
            taskDuration = 5;
            nextTask = '刷新页面并重试流程';
            updateStatusBar('点赞元素不存在，切换到好友动态页面...');
            console.log('切换到好友动态，UIN:', uin);

            let friendTab = document.getElementById('tab_menu_friend') || document.querySelector('li[type="friend"] a') || document.querySelector('.feed-control-tab a:not(.item-on)');
            if (friendTab) {
                friendTab.click();
                console.log('点击左侧菜单栏“好友动态”tab');
            } else if (uin) {
                location.href = 'https://user.qzone.qq.com/' + uin + '/infocenter';
                console.log('直接导航到infocenter');
            } else {
                refresh();
                console.log('无tab可用，刷新页面');
            }
        } catch (e) {
            log('ERROR', '进入好友动态页面异常: ' + e.message); // 新增异常捕获
        }
    }

    // 安全点赞函数（优化：仅调度实际点赞，防止重复调用）
    let likeDebounce = null;
    function safeLike() {
        try {
            if (isPaused) {
                updateStatusBar('脚本已暂停，跳过点赞');
                return;
            }
            if (currentTask === '执行安全点赞') {
                console.log('点赞任务已在执行，跳过重复调用');
                return; // 防止重复
            }
            if (likeDebounce) clearTimeout(likeDebounce);
            likeDebounce = setTimeout(() => {
                currentTask = '执行安全点赞';
                taskStartTime = Date.now();
                const btns = document.querySelectorAll('.qz_like_btn_v3');
                const contents = document.querySelectorAll('.f-info');
                const users = document.querySelectorAll('.f-name');
                let toLike = []; // 收集需要点赞的btns和index
                let skipped = 0;

                Array.from(btns).forEach(function(btn, index) {
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

                let effectiveLikes = toLike.length;
                taskDuration = effectiveLikes * likeDelay + 1; // 最小1s
                nextTask = '模拟滚动或等待刷新';
                // 推迟nextTime，只一次
                nextTime = Math.max(nextTime, Date.now() + taskDuration * 1000 + 5000);
                updateStatusBar('开始安全点赞... (需点赞: ' + effectiveLikes + ', 跳过: ' + skipped + ')');
                log('INFO', '开始安全点赞 (需点赞: ' + effectiveLikes + ', 跳过: ' + skipped + ')'); // 新增日志

                if (effectiveLikes === 0) {
                    // 如果所有跳过，立即完成
                    currentTask = '';
                    taskDuration = 0;
                    updateStatusBar('所有动态已赞或跳过，等待下次刷新');
                    return;
                }

                toLike.forEach(function(item, idx) {
                    setTimeout(function() {
                        if (isPaused) {
                            updateStatusBar('脚本已暂停，停止点赞');
                            return;
                        }
                        item.btn.click();
                        console.log('Liked: ' + item.content);
                        updateStatusBar('点赞动态 ' + (item.index + 1) + ' / ' + btns.length);
                        log('INFO', '点赞动态 ' + (item.index + 1)); // 新增日志：每次点赞
                    }, idx * likeDelay * 1000);
                });

                // 完成重置
                setTimeout(function() {
                    if (isPaused) return;
                    currentTask = '';
                    taskDuration = 0;
                    updateStatusBar('点赞完成，等待下次刷新');
                    log('INFO', '点赞完成'); // 新增日志
                }, taskDuration * 1000);
            }, 500); // 防抖500ms
        } catch (e) {
            log('ERROR', '安全点赞异常: ' + e.message); // 新增异常捕获
        }
    }

    // 模拟下滑动态（移除safeLike调用，让scroll event处理）
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
            // 推迟nextTime
            nextTime = Math.max(nextTime, Date.now() + taskDuration * 1000 + 5000);
            updateStatusBar('模拟下滑动态...');
            log('INFO', '模拟滚动开始'); // 新增日志
            let scrollStep = window.innerHeight * scrollStepPercent;

            Array.from({length: scrollCount}).forEach(function(_, i) {
                var stepIndex = i;
                var targetScroll = (stepIndex + 1) * scrollStep;
                setTimeout(function() {
                    if (isPaused) {
                        updateStatusBar('脚本已暂停，停止滚动');
                        return;
                    }
                    smoothScrollTo(targetScroll, 500);
                    window.dispatchEvent(new Event('scroll')); // 触发scroll event，debounce后调用safeLike
                    updateStatusBar('滚动到动态组 ' + (stepIndex + 1) + '/' + scrollCount + '，加载更多内容');
                    log('INFO', '滚动到动态组 ' + (stepIndex + 1) + '/' + scrollCount); // 新增日志
                    let loadMoreBtn = document.querySelector('.load-more') || document.querySelector('a[title="加载更多"]');
                    if (loadMoreBtn) {
                        loadMoreBtn.click();
                        console.log('点击加载更多按钮作为备用');
                    }
                }, stepIndex * 3000);
            });
            setTimeout(function() {
                if (isPaused) return;
                smoothScrollTo(0, 1000);
                updateStatusBar('回到顶部，等待下次刷新');
                currentTask = '';
                taskDuration = 0;
                log('INFO', '模拟滚动结束，回到顶部'); // 新增日志
            }, scrollCount * 3000 + 3000);
        } catch (e) {
            log('ERROR', '模拟滚动异常: ' + e.message); // 新增异常捕获
        }
    }

    // 平滑滚动辅助函数
    function smoothScrollTo(targetY, duration) {
        var startY = window.scrollY;
        var distance = targetY - startY;
        var startTime = null;

        function animation(currentTime) {
            if (isPaused) return;
            if (!startTime) startTime = currentTime;
            var timeElapsed = currentTime - startTime;
            var progress = Math.min(timeElapsed / duration, 1);
            var ease = progress * (2 - progress);
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
        try {
            if (isPaused) {
                updateStatusBar('脚本已暂停，跳过刷新');
                return;
            }
            log('INFO', '刷新页面触发'); // 新增日志
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
        } catch (e) {
            log('ERROR', '刷新页面异常: ' + e.message); // 新增异常捕获
        }
    }

    // 执行整个工作流
    function executeWorkflow() {
        if (isPaused) {
            updateStatusBar('脚本已暂停，跳过工作流');
            return;
        }
        if (isRunning && !testMode) return;
        isRunning = true;
        currentTask = '执行整体工作流';
        taskStartTime = Date.now();
        taskDuration = 10;
        nextTask = '点赞或切换页面';
        updateStatusBar('开始执行工作流');
        log('INFO', '开始执行工作流'); // 新增日志

        setTimeout(function() {
            try {
                if (isPaused) {
                    isRunning = false;
                    updateStatusBar('脚本已暂停，工作流停止');
                    return;
                }
                if (isInFriendFeedPage()) {
                    updateStatusBar('检测到点赞元素，直接执行点赞...');
                    log('INFO', '检测到好友动态页面，直接执行点赞'); // 新增日志
                    safeLike();
                    simulateScroll();
                } else {
                    updateStatusBar('未检测到点赞元素，切换并刷新页面...');
                    retryCount++;
                    log('WARN', '重试切换页面，当前重试次数: ' + retryCount); // 新增日志
                    if (retryCount > maxRetries) {
                        updateStatusBar('重试次数超过上限，停止执行');
                        log('ERROR', '重试次数超过上限'); // 新增日志
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
            } catch (e) {
                log('ERROR', '执行工作流异常: ' + e.message); // 新增异常捕获
                isRunning = false;
            }
        }, initialDelay);
    }

    // 滚动事件（优化：防抖，减少点赞重复触发）
    let scrollDebounce = null;
    window.addEventListener('scroll', function() {
        if (isPaused) return;
        if (timeout) clearTimeout(timeout);
        isScrolling = true;
        updateStatusBar();
        if (scrollDebounce) clearTimeout(scrollDebounce);
        scrollDebounce = setTimeout(safeLike, 1000); // 防抖1s后触发点赞
        timeout = setTimeout(function() {
            isScrolling = false;
            updateStatusBar();
        }, 1000);
    });

    // 主循环（优化：间隔调整为更高效的1000ms，减少CPU占用）
    let mainInterval = setInterval(function() {
        try {
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
        } catch (e) {
            log('ERROR', '主循环异常: ' + e.message); // 新增异常捕获
        }
    }, 1000);

    // 新增：清理所有定时器函数（用于暂停时）
    function clearAllTimeouts() {
        clearTimeout(timeout);
        clearTimeout(likeDebounce);
        clearTimeout(scrollDebounce);
        clearInterval(mainInterval);
        // 重置主循环
        mainInterval = null;
    }

    // 初始化
    window.onload = function () {
        try {
            createMenu();
            createStatusBar();
            applyDarkMode(); // 新增

            console.log('当前UIN:', uin);

            removeMeRelatedMenu();

            if (getCookie('al-justRefreshed')) {
                setCookie('al-justRefreshed', '', -1);
                setTimeout(executeWorkflow, 3000);
            }

            log('INFO', '脚本初始化完成'); // 新增日志
        } catch (e) {
            log('ERROR', '脚本初始化异常: ' + e.message); // 新增异常捕获
        }
    };

    console.log('Auto Like Enhanced Running...');
})();
