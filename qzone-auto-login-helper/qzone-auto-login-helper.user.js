// ==UserScript==
// @name         QZone Auto Login Helper
// @namespace    http://tampermonkey.net/
// @author       llulun
// @license      MIT
// @version      1.5
// @description  这个脚本是QZone自动点赞脚本的辅助脚本，也可以单独使用。主要功能是自动保持登录状态：当登录失效或离线后，脚本会自动检测并触发浏览器密码自动填充（优先点击头像快捷登录，如果失败则尝试浏览器autofill），确保QZone自动点赞工作流不会因登录问题而停止。脚本不保存任何密码，仅依赖浏览器内置的密码管理器。包含控制面板（通过浮动按钮打开）用于自定义设置，如检测间隔、自动触发阈值等。状态栏显示当前步骤和日志。
// @match        *://*.qzone.qq.com/*
// @match        https://i.qq.com/*
// @match        *://*.ptlogin2.qq.com/*
// @grant        none
// ==/UserScript==

/*
 * 注意：这个脚本设计为QZone自动点赞脚本的辅助工具，用于处理登录相关问题。
 * - 它可以独立运行，但最佳效果是与自动点赞脚本结合使用。
 * - 核心功能：周期性检测登录状态，如果失效（离线或未登录），自动尝试登录（不存储密码）。
 * - 这可以防止自动点赞流程因登录过期而中断。
 * - 如果您有自动点赞脚本，请将其安装在同一个浏览器环境中。
 */

(function(){
    'use strict';

    // 从localStorage获取配置（专注于登录相关参数，包括文字颜色）
    let tryBrowserAutofill = localStorage.getItem('lh-tryBrowserAutofill') !== 'false'; // 默认true
    let checkInterval = parseInt(localStorage.getItem('lh-checkInterval')) || 60; // 默认60秒
    let autoTriggerThreshold = parseInt(localStorage.getItem('lh-autoTriggerThreshold')) || 3; // 默认3次检测失败后自动触发
    let statusBgColor = localStorage.getItem('lh-statusBgColor') || 'linear-gradient(to right, #333, #222)'; // 默认黑色渐变
    let menuBgColor = localStorage.getItem('lh-menuBgColor') || '#ffffff'; // 默认白色
    let statusTextColor = localStorage.getItem('lh-statusTextColor') || 'auto'; // 默认auto
    let menuTextColor = localStorage.getItem('lh-menuTextColor') || 'auto'; // 默认auto
    let currentTask = ''; // 当前任务名称
    let taskStartTime = 0; // 当前任务开始时间
    let taskDuration = 0; // 当前任务预计时长
    let nextTask = ''; // 下一个任务提示
    let detectionCount = 0; // 检测失败计数

    // 函数：将gradient字符串转换为带透明度的版本（状态栏保留部分透明）
    function getTransparentBackground(gradientStr, opacity) {
        return gradientStr.replace(/#([0-9a-f]{3,6})/gi, (match, hex) => {
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            let r = parseInt(hex.slice(0, 2), 16);
            let g = parseInt(hex.slice(2, 4), 16);
            let b = parseInt(hex.slice(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        });
    }

    // 创建菜单栏（更新：标题改为“Login Helper Control Panel”，专注于登录相关参数；背景固定白色不透明，圆润有阴影；修复排版：flex row布局）
    function createMenu() {
        let menu = document.createElement('div');
        menu.id = 'lh-menu';
        menu.style.position = 'fixed';
        menu.style.top = '50%';
        menu.style.left = '50%';
        menu.style.transform = 'translate(-50%, -50%)';
        menu.style.width = '500px';
        menu.style.height = '300px';
        menu.style.overflow = 'auto';
        menu.style.background = '#ffffff'; // 固定白色
        menu.style.border = '1px solid #ccc';
        menu.style.borderRadius = '12px';
        menu.style.padding = '20px';
        menu.style.zIndex = '10002';
        menu.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
        menu.style.fontFamily = 'Arial, sans-serif';
        menu.style.display = 'none'; // 默认隐藏
        menu.style.pointerEvents = 'auto';
        menu.style.flexDirection = 'row'; // 修复：并排布局（左侧菜单，右侧内容）

        if (menuTextColor !== 'auto') {
            menu.style.color = menuTextColor;
        } else {
            menu.style.color = '#333'; // 默认黑色文字匹配白色背景
        }

        // 左侧菜单栏（添加边框、阴影；按钮添加高亮效果以显示折叠菜单）
        let sidebar = document.createElement('div');
        sidebar.style.width = '150px';
        sidebar.style.borderRight = '1px solid #ddd';
        sidebar.style.paddingRight = '10px';
        sidebar.style.boxShadow = 'inset 0 0 5px rgba(0,0,0,0.1)'; // 添加内部阴影
        sidebar.style.border = '1px solid #eee'; // 添加边框
        sidebar.style.borderRadius = '8px'; // 圆润边角
        sidebar.style.background = '#f9f9f9'; // 浅灰背景以区分
        sidebar.innerHTML = `
            <h4 style="margin: 0 0 10px;">设置分类</h4>
            <ul style="list-style: none; padding: 0;">
                <li><button id="lh-tab-core" style="width: 100%; text-align: left; padding: 5px; background: #e0e0e0; border: none; cursor: pointer; border-radius: 4px; margin-bottom: 5px;">登录参数</button></li>
                <li><button id="lh-tab-ui" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; margin-bottom: 5px;">界面自定义</button></li>
            </ul>
        `;
        menu.appendChild(sidebar);

        // 右侧内容区
        let content = document.createElement('div');
        content.id = 'lh-content';
        content.style.flex = '1';
        content.style.paddingLeft = '20px';
        content.innerHTML = '<h3>Login Helper Control Panel</h3>'; // 面板标题
        menu.appendChild(content);

        // 底部按钮
        let footer = document.createElement('div');
        footer.style.marginTop = '20px';
        footer.style.textAlign = 'center';
        footer.innerHTML = `
            <button id="lh-save" style="background: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-right: 10px;">保存并应用</button>
            <button id="lh-test" style="background: #2196F3; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; margin-right: 10px;">测试执行</button>
            <button id="lh-close" style="background: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer;">关闭</button>
        `;
        menu.appendChild(footer);

        document.body.appendChild(menu);

        // tab内容函数（专注于登录相关参数，UI tab简化：移除透明度调整）
        function showTab(tab) {
            content.innerHTML = '<h3>Login Helper Control Panel</h3>'; // 每次切换保持标题
            if (tab === 'core') {
                content.innerHTML += `
                    <h4>登录参数</h4>
                    <label style="display: block; margin-bottom: 10px;"><input type="checkbox" id="lh-tryBrowserAutofill" ${tryBrowserAutofill ? 'checked' : ''}> 启用浏览器自动填充触发</label>
                    <label style="display: block; margin-bottom: 10px;">检测间隔 (秒): <input type="number" id="lh-checkInterval" value="${checkInterval}" min="10" style="width: 80px; margin-left: 10px;"></label>
                    <label style="display: block; margin-bottom: 10px;">自动触发阈值 (失败次数): <input type="number" id="lh-autoTriggerThreshold" value="${autoTriggerThreshold}" min="1" style="width: 80px; margin-left: 10px;"></label>
                `;
            } else if (tab === 'ui') {
                content.innerHTML += `
                    <h4>界面自定义</h4>
                    <label style="display: block; margin-bottom: 10px;">状态栏背景: <select id="lh-statusBgColor" style="width: 200px; margin-left: 10px;">
                        <option value="linear-gradient(to right, #333, #222)" ${statusBgColor === 'linear-gradient(to right, #333, #222)' ? 'selected' : ''}>黑色渐变</option>
                        <option value="linear-gradient(to right, #f0f0f0, #e0e0e0)" ${statusBgColor === 'linear-gradient(to right, #f0f0f0, #e0e0e0)' ? 'selected' : ''}>白色渐变</option>
                        <option value="linear-gradient(to right, #2196F3, #1976D2)" ${statusBgColor === 'linear-gradient(to right, #2196F3, #1976D2)' ? 'selected' : ''}>蓝色渐变</option>
                        <option value="linear-gradient(to right, #4CAF50, #388E3C)" ${statusBgColor === 'linear-gradient(to right, #4CAF50, #388E3C)' ? 'selected' : ''}>绿色渐变</option>
                    </select></label>
                    <label style="display: block; margin-bottom: 10px;">状态栏文字颜色: <select id="lh-statusTextColor" style="width: 200px; margin-left: 10px;">
                        <option value="auto" ${statusTextColor === 'auto' ? 'selected' : ''}>自动</option>
                        <option value="#fff" ${statusTextColor === '#fff' ? 'selected' : ''}>白色</option>
                        <option value="#333" ${statusTextColor === '#333' ? 'selected' : ''}>黑色</option>
                        <option value="#ddd" ${statusTextColor === '#ddd' ? 'selected' : ''}>浅灰</option>
                    </select></label>
                    <label style="display: block; margin-bottom: 10px;">控制面板背景: <select id="lh-menuBgColor" style="width: 200px; margin-left: 10px;">
                        <option value="#ffffff" ${menuBgColor === '#ffffff' ? 'selected' : ''}>白色</option>
                        <option value="#333" ${menuBgColor === '#333' ? 'selected' : ''}>黑色</option>
                        <option value="#2196F3" ${menuBgColor === '#2196F3' ? 'selected' : ''}>蓝色</option>
                        <option value="#4CAF50" ${menuBgColor === '#4CAF50' ? 'selected' : ''}>绿色</option>
                    </select></label>
                    <label style="display: block; margin-bottom: 10px;">控制面板文字颜色: <select id="lh-menuTextColor" style="width: 200px; margin-left: 10px;">
                        <option value="auto" ${menuTextColor === 'auto' ? 'selected' : ''}>自动</option>
                        <option value="#fff" ${menuTextColor === '#fff' ? 'selected' : ''}>白色</option>
                        <option value="#333" ${menuTextColor === '#333' ? 'selected' : ''}>黑色</option>
                        <option value="#ddd" ${menuTextColor === '#ddd' ? 'selected' : ''}>浅灰</option>
                    </select></label>
                `;
            }
        }

        // 默认显示登录参数tab
        showTab('core');

        // tab切换事件（添加活跃高亮：不同背景色、阴影）
        const coreTab = document.getElementById('lh-tab-core');
        const uiTab = document.getElementById('lh-tab-ui');

        coreTab.addEventListener('click', () => {
            showTab('core');
            coreTab.style.background = '#e0e0e0';
            coreTab.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            uiTab.style.background = 'none';
            uiTab.style.boxShadow = 'none';
        });

        uiTab.addEventListener('click', () => {
            showTab('ui');
            uiTab.style.background = '#e0e0e0';
            uiTab.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            coreTab.style.background = 'none';
            coreTab.style.boxShadow = 'none';
        });

        // 保存按钮事件
        document.getElementById('lh-save').addEventListener('click', function() {
            // 登录参数
            tryBrowserAutofill = document.getElementById('lh-tryBrowserAutofill')?.checked || false;
            checkInterval = parseInt(document.getElementById('lh-checkInterval')?.value) || 60;
            autoTriggerThreshold = parseInt(document.getElementById('lh-autoTriggerThreshold')?.value) || 3;

            // UI参数（简化，无透明度）
            statusBgColor = document.getElementById('lh-statusBgColor')?.value || 'linear-gradient(to right, #333, #222)';
            statusTextColor = document.getElementById('lh-statusTextColor')?.value || 'auto';
            menuBgColor = document.getElementById('lh-menuBgColor')?.value || '#ffffff';
            menuTextColor = document.getElementById('lh-menuTextColor')?.value || 'auto';

            // 保存到localStorage
            localStorage.setItem('lh-tryBrowserAutofill', tryBrowserAutofill);
            localStorage.setItem('lh-checkInterval', checkInterval);
            localStorage.setItem('lh-autoTriggerThreshold', autoTriggerThreshold);
            localStorage.setItem('lh-statusBgColor', statusBgColor);
            localStorage.setItem('lh-statusTextColor', statusTextColor);
            localStorage.setItem('lh-menuBgColor', menuBgColor);
            localStorage.setItem('lh-menuTextColor', menuTextColor);

            alert('设置已保存并应用！部分变化可能需刷新页面生效。');

            // 动态应用UI变化
            let statusBar = document.getElementById('lh-status-bar');
            if (statusBar) {
                statusBar.style.background = getTransparentBackground(statusBgColor, 0.8); // 固定状态栏透明度0.8
                if (statusTextColor === 'auto') {
                    statusBar.style.color = statusBgColor.includes('#333') || statusBgColor.includes('#222') ? '#fff' : '#333';
                } else {
                    statusBar.style.color = statusTextColor;
                }
            }
            menu.style.background = menuBgColor;
            if (menuTextColor === 'auto') {
                menu.style.color = menuBgColor.includes('#fff') || menuBgColor === '#ffffff' ? '#333' : '#fff';
            } else {
                menu.style.color = menuTextColor;
            }

            updateStatusBar();
        });

        // 测试按钮：立即触发登录尝试
        document.getElementById('lh-test').addEventListener('click', function() {
            updateStatusBar('测试触发：将尝试头像或触发浏览器自动填充（检查控制台日志以获取诊断信息）');
            setTimeout(() => attemptLoginFlow(true), 200);
        });

        // 关闭按钮
        document.getElementById('lh-close').addEventListener('click', function() {
            menu.style.display = 'none';
        });

        // 浮动按钮显示菜单（按钮名为“控制面板”以明确指示）
        let toggleBtn = document.createElement('button');
        toggleBtn.innerText = '控制面板';
        toggleBtn.style.position = 'fixed';
        toggleBtn.style.bottom = '20px';
        toggleBtn.style.right = '20px';
        toggleBtn.style.background = '#2196F3';
        toggleBtn.style.color = 'white';
        toggleBtn.style.border = 'none';
        toggleBtn.style.padding = '8px 12px';
        toggleBtn.style.borderRadius = '4px';
        toggleBtn.style.zIndex = '10003';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.opacity = '0.85';
        toggleBtn.addEventListener('click', function() {
            menu.style.display = menu.style.display === 'none' ? 'flex' : 'none'; // 切换显示
            if (menu.style.display === 'flex') {
                showTab('core');
            }
        });

        document.body.appendChild(toggleBtn);
    }

    // 创建状态栏（更新：缩小尺寸，简化显示，只显示当前步骤和日志；透明背景，文字不透明）
    function createStatusBar() {
        let statusBar = document.createElement('div');
        statusBar.id = 'lh-status-bar';
        statusBar.style.position = 'fixed';
        statusBar.style.bottom = '0';
        statusBar.style.left = '0';
        statusBar.style.width = '100%';
        statusBar.style.background = getTransparentBackground(statusBgColor, 0.8); // 固定透明度0.8
        statusBar.style.padding = '5px 10px'; // 缩小padding
        statusBar.style.zIndex = '10001';
        statusBar.style.fontSize = '12px'; // 缩小字体
        statusBar.style.lineHeight = '1.2'; // 调整行高
        statusBar.style.textAlign = 'center';
        statusBar.style.boxShadow = '0 -2px 6px rgba(0,0,0,0.3)'; // 缩小阴影
        statusBar.style.borderRadius = '6px 6px 0 0'; // 缩小圆角
        statusBar.style.fontFamily = 'Arial, sans-serif';
        if (statusTextColor === 'auto') {
            statusBar.style.color = statusBgColor.includes('#333') || statusBgColor.includes('#222') ? '#fff' : '#333';
        } else {
            statusBar.style.color = statusTextColor;
        }
        statusBar.style.pointerEvents = 'none';
        document.body.appendChild(statusBar);

        // 每秒更新状态栏
        setInterval(updateStatusBar, 1000);
        updateStatusBar();
    }

    // 更新状态栏函数（简化：只显示当前步骤和简单日志）
    function updateStatusBar(message = '') {
        let statusBar = document.getElementById('lh-status-bar');
        if (!statusBar) return;

        let currentStep = message || (currentTask ? '<span style="color: orange; font-weight: bold;">执行中：' + currentTask + '</span>' : '<span style="color: lightgreen; font-weight: bold;">等待下次检测</span>');

        let strongColor;
        if (statusTextColor === 'auto') {
            strongColor = statusBar.style.color === '#fff' ? '#eee' : '#555';
        } else {
            strongColor = statusBar.style.color;
        }

        statusBar.innerHTML = `
            当前步骤: ${currentStep}
        `;
    }

    // 主流程：尝试头像 -> 触发浏览器自动填充并提交
    async function attemptLoginFlow(isManualTest = false) {
        currentTask = '尝试登录流程';
        taskStartTime = Date.now();
        taskDuration = 5; // 预计5秒
        nextTask = '等待下次检测';
        updateStatusBar('开始尝试登录...');
        try {
            // 1. 尝试点击头像快捷登录
            const avatarSelectors = [
                '#qlogin_list .uin', '.qlogin_face img', '.mod_login_user .head img',
                '.face, .qlogin_face_img, .qlogin_img', 'a[href*="ptlogin"] img', '.login-face img'
            ];
            for (const sel of avatarSelectors) {
                const el = document.querySelector(sel);
                if (el) {
                    console.log('[LoginHelper] 找到头像元素，尝试点击 ->', sel, el);
                    updateStatusBar('检测到头像，正在点击登录...');
                    try { el.click(); } catch (e) { console.warn(e); el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
                    currentTask = '';
                    taskDuration = 0;
                    return;
                }
            }
            console.log('[LoginHelper] 未找到头像元素，尝试触发浏览器自动填充...');

            if (tryBrowserAutofill) {
                // 2. 查找所有iframe（包括嵌套），尝试在每个中触发autofill
                const iframes = document.querySelectorAll('iframe');
                let triggered = false;
                for (const iframe of iframes) {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        if (iframeDoc && await tryTriggerBrowserAutofillInDocument(iframeDoc)) {
                            triggered = true;
                            break;
                        }
                    } catch (e) { console.warn('[LoginHelper] iframe访问异常：', e); }
                }

                // 3. 如果iframe中未触发，再尝试主文档
                if (!triggered) {
                    triggered = await tryTriggerBrowserAutofillInDocument(document);
                }

                if (triggered) {
                    updateStatusBar('已尝试触发浏览器自动填充，正在等待提交...');
                } else {
                    updateStatusBar('未能触发自动填充或未找到可用表单（查看控制台获取详细信息）');
                }
            } else {
                updateStatusBar('已禁用浏览器 autofill 触发。若需要请在设置中开启。');
            }

            currentTask = '';
            taskDuration = 0;
        } catch (err) {
            console.error('[LoginHelper] 尝试流程异常：', err);
            updateStatusBar('脚本异常，查看控制台');
            currentTask = '';
            taskDuration = 0;
        }
    }

    // 在指定 document（主文档或 iframe document）中尽力触发浏览器 autofill 并提交
    async function tryTriggerBrowserAutofillInDocument(doc) {
        try {
            // 查找 username & password 输入（尽量多试几个常见选择器）
            const userSelectors = ['input[name="u"]', 'input[name="acct"]', 'input[id*="u"]', 'input[name*="user"]', 'input[type="email"]', 'input[type="text"]'];
            const passSelectors = ['input[name="p"]', 'input[name="pwd"]', 'input[type="password"]'];
            const submitSelectors = ['input[type="submit"]', 'button[type="submit"]', '#go', '.btn', 'input[value*="登录"]', 'button:contains("登录")'];

            let uEl = null, pEl = null, submitEl = null;
            for (const s of userSelectors) { const e = doc.querySelector(s); if (e) { uEl = e; break; } }
            for (const s of passSelectors) { const e = doc.querySelector(s); if (e) { pEl = e; break; } }
            for (const s of submitSelectors) { const e = doc.querySelector(s); if (e) { submitEl = e; break; } }

            if (!uEl || !pEl) {
                console.log('[LoginHelper] 未找到用户名或密码输入字段，无法触发autofill');
                return false;
            }

            // 触发浏览器autofill：焦点到用户名字段，模拟输入事件
            uEl.focus();
            uEl.dispatchEvent(new Event('input', { bubbles: true }));
            uEl.dispatchEvent(new Event('change', { bubbles: true }));
            await new Promise(r => setTimeout(r, 500)); // 等待autofill

            // 焦点到密码字段，类似
            pEl.focus();
            pEl.dispatchEvent(new Event('input', { bubbles: true }));
            pEl.dispatchEvent(new Event('change', { bubbles: true }));
            await new Promise(r => setTimeout(r, 500));

            // 如果找到提交按钮，点击它
            if (submitEl) {
                console.log('[LoginHelper] 找到提交按钮，尝试点击 ->', submitEl);
                submitEl.click();
            } else {
                // 否则，尝试提交表单
                const form = pEl.closest('form');
                if (form) {
                    console.log('[LoginHelper] 未找到提交按钮，尝试提交表单');
                    form.submit();
                } else {
                    console.log('[LoginHelper] 未找到表单，无法自动提交');
                }
            }

            return true;
        } catch (err) {
            console.error('[LoginHelper] 触发autofill异常：', err);
            return false;
        }
    }

    // 初始化（确保面板默认隐藏）
    createMenu();
    createStatusBar();

    // 周期性检测（如果未登录）
    setInterval(() => {
        if (!document.querySelector('.logged-in-indicator') || document.title.includes('登录')) { // 假设检测登录状态
            detectionCount++;
            updateStatusBar(`检测到未登录，失败次数：${detectionCount}`);
            if (detectionCount >= autoTriggerThreshold) {
                attemptLoginFlow();
                detectionCount = 0;
            }
        } else {
            detectionCount = 0;
        }
    }, checkInterval * 1000);

    // 初始触发
    setTimeout(attemptLoginFlow, 2000);
})();
