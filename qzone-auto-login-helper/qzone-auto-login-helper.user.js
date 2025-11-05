// ==UserScript==
// @name         QZone Auto Login Helper
// @namespace    http://tampermonkey.net/
// @author       llulun
// @license      MIT
// @version      1.8
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
    // 登录方式：'autofill'（优先使用浏览器自动填充）或 'avatar'（优先点击头像快捷登录）
    let loginMethod = localStorage.getItem('lh-loginMethod') || 'autofill'; // 默认自动填充
    let checkInterval = parseInt(localStorage.getItem('lh-checkInterval')) || 60; // 默认60秒
    let autoTriggerThreshold = parseInt(localStorage.getItem('lh-autoTriggerThreshold')) || 3; // 默认3次检测失败后自动触发
    let disableFallback = localStorage.getItem('lh-disableFallback') === 'true'; // 是否禁用回退，默认false
    let statusBgColor = localStorage.getItem('lh-statusBgColor') || 'linear-gradient(to right, #333, #222)'; // 默认黑色渐变
    let menuBgColor = localStorage.getItem('lh-menuBgColor') || '#ffffff'; // 默认白色
    let statusTextColor = localStorage.getItem('lh-statusTextColor') || 'auto'; // 默认auto
    let menuTextColor = localStorage.getItem('lh-menuTextColor') || 'auto'; // 默认auto
    let standardizeNames = localStorage.getItem('lh-standardizeNames') !== 'false'; // 临时标准化 name 提升识别，默认开启
    let savedUsername = localStorage.getItem('lh-savedUsername') || '';
    let savedPassword = localStorage.getItem('lh-savedPassword') || '';
    let preferredLoginUrl = localStorage.getItem('lh-preferredLoginUrl') || '';
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
                <li><button id="lh-tab-core" style="width: 100%; text-align: left; padding: 5px; background: #e0e0e0; border: none; cursor: pointer; border-radius: 4px; margin-bottom: 5px;">🔐 登录</button></li>
                <li><button id="lh-tab-advanced" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; margin-bottom: 5px;">⚙️ 高级</button></li>
                <li><button id="lh-tab-ui" style="width: 100%; text-align: left; padding: 5px; background: none; border: none; cursor: pointer; border-radius: 4px; margin-bottom: 5px;">🎨 外观</button></li>
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
                    <h4>登录参数 <span style="font-size: 12px; color: #fff; background:#4CAF50; padding:2px 6px; border-radius:10px; margin-left:8px;">推荐：密码登录</span></h4>
                    <div style="padding: 10px; border-radius: 10px; background: linear-gradient(to right, #f7f7f7, #eaeaea); margin-bottom: 12px;">
                        <label style="display: block; margin-bottom: 10px;">登录方式: 
                            <select id="lh-loginMethod" style="width: 220px; margin-left: 10px;">
                                <option value="autofill" ${loginMethod === 'autofill' ? 'selected' : ''}>浏览器自动填充（已弃用）</option>
                                <option value="avatar" ${loginMethod === 'avatar' ? 'selected' : ''}>点击头像快捷登录</option>
                                <option value="saved" ${loginMethod === 'saved' ? 'selected' : ''}>使用保存的账户密码登录</option>
                            </select>
                        </label>
                        <div style="font-size:12px;color:#666;margin-left:4px;">说明：自动填充仅保留以兼容少数环境，优先使用“账户密码登录”。</div>
                    </div>
                    <div style="padding: 10px; border-radius: 10px; background: linear-gradient(to right, #f7f7f7, #eaeaea); margin-bottom: 12px;">
                        <label style="display: block; margin-bottom: 10px;"><input type="checkbox" id="lh-disableFallback" ${disableFallback ? 'checked' : ''}> 禁用回退（仅尝试所选方式）</label>
                        <div style="font-size:12px;color:#666;margin-left:22px;">若开启，将不自动切换头像登录或自动填充。</div>
                        <label style="display: block; margin: 10px 0;"><input type="checkbox" id="lh-standardizeNames" ${standardizeNames ? 'checked' : ''}> 辅助识别：临时标准化字段名</label>
                        <div style="font-size:12px;color:#666;margin-left:22px;">登录前临时将 name 设为 username/password，提交前自动还原。</div>
                        <label style="display: block; margin-top: 10px;">检测间隔 (秒): <input type="number" id="lh-checkInterval" value="${checkInterval}" min="10" style="width: 80px; margin-left: 10px;"></label>
                        <label style="display: block; margin-top: 6px;">自动触发阈值 (失败次数): <input type="number" id="lh-autoTriggerThreshold" value="${autoTriggerThreshold}" min="1" style="width: 80px; margin-left: 10px;"></label>
                    </div>
                    <div style="padding: 10px; border-radius: 10px; background: linear-gradient(to right, #eef6ff, #e3f0ff);">
                        <div style="font-weight: bold; margin-bottom: 6px;">保存账户密码（用于直接登录）：</div>
                        <label style="display: block; margin-bottom: 8px;">账号：<input type="text" id="lh-savedUsername" value="${savedUsername}" placeholder="请输入QQ账号" style="width: 240px; margin-left: 10px;"></label>
                        <label style="display: block; margin-bottom: 8px;">密码：<input type="password" id="lh-savedPassword" value="${savedPassword}" placeholder="请输入密码" style="width: 240px; margin-left: 10px;"></label>
                        <div style="font-size: 12px; color: #666; margin-bottom:8px;">提示：凭据保存在本地浏览器（localStorage）。请在私人设备使用。</div>
                        <button id="lh-clearCreds" style="background:#f44336;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">清除本地保存的账号与密码</button>
                    </div>
                `;
            } else if (tab === 'advanced') {
                content.innerHTML += `
                    <h4>高级设置</h4>
                    <div style="padding: 10px; border-radius: 10px; background: linear-gradient(to right, #f7f7f7, #eaeaea);">
                        <label style="display:block; margin-bottom:8px;">优先登录页 URL（可选）：
                            <input type="text" id="lh-preferredLoginUrl" value="${preferredLoginUrl}" placeholder="例如 https://xui.ptlogin2.qq.com/cgi-bin/xlogin?..." style="width: 320px; margin-left: 10px;">
                        </label>
                        <div style="font-size:12px;color:#666;">说明：当无法从页面自动获取登录框地址时，将跳转到此登录页再进行密码登录。</div>
                    </div>
                `;
            } else if (tab === 'ui') {
                content.innerHTML += `
                    <h4>外观设置</h4>
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
        const advancedTab = document.getElementById('lh-tab-advanced');
        const uiTab = document.getElementById('lh-tab-ui');

        coreTab.addEventListener('click', () => {
            showTab('core');
            coreTab.style.background = '#e0e0e0';
            coreTab.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            uiTab.style.background = 'none';
            uiTab.style.boxShadow = 'none';
        });

        advancedTab.addEventListener('click', () => {
            showTab('advanced');
            advancedTab.style.background = '#e0e0e0';
            advancedTab.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            coreTab.style.background = 'none';
            coreTab.style.boxShadow = 'none';
            uiTab.style.background = 'none';
            uiTab.style.boxShadow = 'none';
        });

        uiTab.addEventListener('click', () => {
            showTab('ui');
            uiTab.style.background = '#e0e0e0';
            uiTab.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            coreTab.style.background = 'none';
            coreTab.style.boxShadow = 'none';
            advancedTab.style.background = 'none';
            advancedTab.style.boxShadow = 'none';
        });

        // 保存按钮事件
        document.getElementById('lh-save').addEventListener('click', function() {
            // 登录参数
            loginMethod = document.getElementById('lh-loginMethod')?.value || 'autofill';
            disableFallback = !!document.getElementById('lh-disableFallback')?.checked;
            standardizeNames = !!document.getElementById('lh-standardizeNames')?.checked;
            checkInterval = parseInt(document.getElementById('lh-checkInterval')?.value) || 60;
            autoTriggerThreshold = parseInt(document.getElementById('lh-autoTriggerThreshold')?.value) || 3;
            savedUsername = document.getElementById('lh-savedUsername')?.value || '';
            savedPassword = document.getElementById('lh-savedPassword')?.value || '';
            preferredLoginUrl = document.getElementById('lh-preferredLoginUrl')?.value || '';

            // UI参数（简化，无透明度）
            statusBgColor = document.getElementById('lh-statusBgColor')?.value || 'linear-gradient(to right, #333, #222)';
            statusTextColor = document.getElementById('lh-statusTextColor')?.value || 'auto';
            menuBgColor = document.getElementById('lh-menuBgColor')?.value || '#ffffff';
            menuTextColor = document.getElementById('lh-menuTextColor')?.value || 'auto';

            // 保存到localStorage
            localStorage.setItem('lh-loginMethod', loginMethod);
            localStorage.setItem('lh-disableFallback', String(disableFallback));
            localStorage.setItem('lh-standardizeNames', String(standardizeNames));
            localStorage.setItem('lh-checkInterval', checkInterval);
            localStorage.setItem('lh-autoTriggerThreshold', autoTriggerThreshold);
            localStorage.setItem('lh-statusBgColor', statusBgColor);
            localStorage.setItem('lh-statusTextColor', statusTextColor);
            localStorage.setItem('lh-menuBgColor', menuBgColor);
            localStorage.setItem('lh-menuTextColor', menuTextColor);
            localStorage.setItem('lh-savedUsername', savedUsername);
            localStorage.setItem('lh-savedPassword', savedPassword);
            localStorage.setItem('lh-preferredLoginUrl', preferredLoginUrl);

            // 若已填写凭据，默认切换为“保存账户密码登录”以提升便捷性
            if (savedUsername && savedPassword) {
                localStorage.setItem('lh-loginMethod', 'saved');
                const lmSelect = document.getElementById('lh-loginMethod');
                if (lmSelect) lmSelect.value = 'saved';
            }

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
            const lm = document.getElementById('lh-loginMethod')?.value || loginMethod;
            const msg = lm === 'autofill' ? '测试触发：将尝试浏览器自动填充'
                        : (lm === 'saved' ? '测试触发：将尝试使用保存的账户密码登录' : '测试触发：将尝试头像快捷登录');
            updateStatusBar(msg + '（检查控制台日志以获取诊断信息）');
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

        // 根据登录方式自适应测试按钮文案
        const testBtn = document.getElementById('lh-test');
        const loginSelect = document.getElementById('lh-loginMethod');
        const updateTestLabel = () => {
            if (!testBtn || !loginSelect) return;
            testBtn.innerText = loginSelect.value === 'autofill' ? '测试自动填充' : (loginSelect.value === 'avatar' ? '测试头像登录' : '测试密码登录');
        };
        updateTestLabel();
        loginSelect?.addEventListener('change', updateTestLabel);
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

    // 工具函数：模拟真实点击与键盘事件（有助于触发浏览器自动填充）
    function simulateRealClick(el) {
        try { el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); } catch (_) {}
        try { el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true })); } catch (_) {}
        try { el.click(); } catch (e) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    }
    function simulateKey(el, key) {
        try {
            const opts = { bubbles: true, cancelable: true, key };
            el.dispatchEvent(new KeyboardEvent('keydown', opts));
            el.dispatchEvent(new KeyboardEvent('keyup', opts));
        } catch (_) {}
    }

    // 判断元素是否可见且可交互
    function isVisible(el) {
        try {
            const style = el.ownerDocument.defaultView.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
            const rect = el.getBoundingClientRect();
            if ((rect.width || 0) <= 0 || (rect.height || 0) <= 0) return false;
            if (el.hasAttribute('disabled')) return false;
            return el.offsetParent !== null;
        } catch (_) { return true; }
    }

    // 逐字符模拟键入，触发 keydown/keypress/input/keyup 事件
    async function simulateTyping(el, text) {
        try {
            el.focus();
            // 清空现有值
            el.value = '';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            for (const ch of String(text)) {
                el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: ch }));
                // 更新值
                el.value += ch;
                try {
                    el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: ch, inputType: 'insertText' }));
                } catch (_) {
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                }
                el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: ch }));
                await new Promise(r => setTimeout(r, 20));
            }
            el.dispatchEvent(new Event('change', { bubbles: true }));
            try { el.dispatchEvent(new Event('blur', { bubbles: true })); } catch (_) {}
        } catch (e) { console.warn('[LoginHelper] 模拟键入异常：', e); }
    }

    // 自动填充相关逻辑已弃用（但保留选项供少数环境自测）。提示与检测函数移除以简化代码。

    // 工具函数：尝试点击头像快捷登录
    function tryClickAvatar() {
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
                return true;
            }
        }
        return false;
    }

    // 工具函数：遍历所有iframe与主文档，尽力触发浏览器自动填充
    async function tryAutofillAcrossDocs(withUserGesture = false) {
        // 1. 先在所有可访问的 iframe 中尝试
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc && await tryTriggerBrowserAutofillInDocument(iframeDoc, withUserGesture)) {
                    return true;
                }
            } catch (e) { console.warn('[LoginHelper] iframe访问异常：', e); }
        }
        // 2. 再尝试主文档
        return await tryTriggerBrowserAutofillInDocument(document, withUserGesture);
    }

    // 基于保存的账户密码，填充并提交（遍历iframe与主文档）
    async function trySavedCredentialsAcrossDocs(username, password) {
        const iframes = document.querySelectorAll('iframe');
        let candidateLoginSrc = null;
        for (const iframe of iframes) {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc && await fillAndSubmitWithSavedCredsInDocument(iframeDoc, username, password)) {
                    return true;
                }
            } catch (e) {
                console.warn('[LoginHelper] iframe访问异常：', e);
                try {
                    const src = iframe.getAttribute('src') || '';
                    if (!candidateLoginSrc && /ptlogin2\.qq\.com|ui\.ptlogin2\.qq\.com|xui\.ptlogin2\.qq\.com/.test(src)) {
                        candidateLoginSrc = src;
                    }
                } catch (_) {}
            }
        }
        const ok = await fillAndSubmitWithSavedCredsInDocument(document, username, password);
        if (!ok && candidateLoginSrc && location.host.indexOf('ptlogin2.qq.com') === -1) {
            // 规范化URL，强制顶层跳转到登录页（同源后再填写）
            let target = candidateLoginSrc;
            if (/^\/\//.test(target)) target = 'https:' + target;
            updateStatusBar('检测到跨域登录框，正在跳转到登录页以填写…');
            console.log('[LoginHelper] 跨域登录iframe不可访问，跳转到登录页以直接填写 ->', target);
            try { window.top?.location?.assign(target); } catch (_) { try { location.assign(target); } catch (_) {} }
            return true;
        }
        // 若仍未找到且用户配置了优先登录页，则跳转尝试
        if (!ok && !candidateLoginSrc && preferredLoginUrl && location.host.indexOf('ptlogin2.qq.com') === -1) {
            updateStatusBar('使用优先登录页，准备跳转并进行密码登录…');
            console.log('[LoginHelper] 使用优先登录页跳转 ->', preferredLoginUrl);
            try { window.top?.location?.assign(preferredLoginUrl); } catch (_) { try { location.assign(preferredLoginUrl); } catch (_) {} }
            return true;
        }
        return ok;
    }

    // 主流程：根据登录方式优先级尝试登录（自动填充或点击头像），失败则回退到另一种
    async function attemptLoginFlow(isManualTest = false) {
        currentTask = '尝试登录流程';
        taskStartTime = Date.now();
        taskDuration = 5; // 预计5秒
        nextTask = '等待下次检测';
        updateStatusBar(
            loginMethod === 'autofill'
                ? '开始尝试自动填充...'
                : (loginMethod === 'saved' ? '开始尝试密码登录...' : '开始尝试头像快捷登录...')
        );
        try {
            if (loginMethod === 'saved') {
                if (!savedUsername || !savedPassword) {
                    updateStatusBar('未设置保存的账号或密码，请在控制面板填写');
                    currentTask = '';
                    taskDuration = 0;
                    return;
                }
                updateStatusBar('使用保存的账户密码登录...');
                const ok = await trySavedCredentialsAcrossDocs(savedUsername, savedPassword);
                if (ok) {
                    updateStatusBar('已填写保存的账号密码，正在提交...');
                    currentTask = '';
                    taskDuration = 0;
                    return;
                } else {
                    updateStatusBar('未找到可填写的登录表单，提交失败');
                }
            } else if (loginMethod === 'autofill') {
                const triggered = await tryAutofillAcrossDocs(isManualTest);
                if (triggered) {
                    updateStatusBar('已尝试触发浏览器自动填充，正在等待提交...');
                    currentTask = '';
                    taskDuration = 0;
                    return;
                }
                if (disableFallback) {
                    console.log('[LoginHelper] 自动填充失败，已禁用回退。');
                    updateStatusBar('自动填充失败（已禁用回退）');
                } else {
                    console.log('[LoginHelper] 自动填充失败，尝试点击头像快捷登录...');
                    if (tryClickAvatar()) {
                        currentTask = '';
                        taskDuration = 0;
                        return;
                    }
                    updateStatusBar('未能触发自动填充且未找到可点击头像（查看控制台）');
                }
            } else {
                // loginMethod === 'avatar'
                if (tryClickAvatar()) {
                    currentTask = '';
                    taskDuration = 0;
                    return;
                }
                if (disableFallback) {
                    console.log('[LoginHelper] 未找到头像元素，且已禁用回退。');
                    updateStatusBar('未找到可点击头像（已禁用回退）');
                } else {
                    console.log('[LoginHelper] 未找到头像元素，尝试触发浏览器自动填充...');
                    const triggered = await tryAutofillAcrossDocs(isManualTest);
                    if (triggered) {
                        updateStatusBar('已尝试触发浏览器自动填充，正在等待提交...');
                    } else {
                        updateStatusBar('未能触发自动填充或未找到可用表单（查看控制台获取详细信息）');
                    }
                }
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
    async function tryTriggerBrowserAutofillInDocument(doc, withUserGesture = false) {
        try {
            // 若存在“密码登录”切换按钮，先点击以显示账号密码表单
            try {
                const switcher = doc.querySelector('#switcher_plogin') ||
                    Array.from(doc.querySelectorAll('a, button')).find(el => /密码登录|帐号密码|账号密码/i.test((el.textContent || '').trim()));
                if (switcher) {
                    console.log('[LoginHelper] 检测到密码登录开关，尝试点击显示表单 ->', switcher);
                    try { switcher.click(); } catch (e) { switcher.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
                    await new Promise(r => setTimeout(r, 300)); // 等待界面切换
                }
            } catch (e) {
                console.warn('[LoginHelper] 切换密码登录开关异常：', e);
            }

            // 查找 username & password 输入（尽量多试几个常见选择器）
            const userSelectors = ['#u', 'input[name="u"]', 'input[name="acct"]', 'input[id*="u"]', 'input[name*="user"]', 'input[type="email"]', 'input[type="text"]'];
            const passSelectors = ['#p', 'input[name="p"]', 'input[name="pwd"]', 'input[type="password"]'];
            // 提交按钮选择器（移除非标准的 :contains 伪选择器），扩展常见 id/class
            const submitSelectors = [
                'input[type="submit"]', 'button[type="submit"]',
                '#go', '.btn', '.btn-login', '.login', '.submit', '#submit', '#login',
                'button[id*="login"]', 'button[class*="login"]', 'input[id*="login"]', 'input[class*="login"]',
                'button[id*="signin"]', 'button[class*="signin"]', 'input[id*="signin"]', 'input[class*="signin"]',
                'button[id*="submit"]', 'button[class*="submit"]', 'input[id*="submit"]', 'input[class*="submit"]'
            ];

            let uEl = null, pEl = null, submitEl = null;
            for (const s of userSelectors) { const e = doc.querySelector(s); if (e) { uEl = e; break; } }
            for (const s of passSelectors) { const e = doc.querySelector(s); if (e) { pEl = e; break; } }
            for (const s of submitSelectors) { const e = doc.querySelector(s); if (e) { submitEl = e; break; } }

            // 若未找到标准提交元素，尝试通过文本/值匹配“登录/Log in/Sign in”
            if (!submitEl) {
                const candidates = Array.from(doc.querySelectorAll('button, input[type="submit"], input[type="button"], a[role="button"], a.button, a.btn, a[href^="javascript:"]'));
                submitEl = candidates.find(el => {
                    const text = (el.textContent || '').trim();
                    const val = (el.value || '').trim();
                    const re = /登录|登陆|log\s*-?\s*in|login|sign\s*-?\s*in/i;
                    return re.test(text) || re.test(val);
                }) || null;
            }

            if (!uEl || !pEl) {
                console.log('[LoginHelper] 未找到用户名或密码输入字段，无法触发autofill');
                return false;
            }

            // 设置有助于Chrome识别的 autocomplete 提示
            try { uEl.setAttribute('autocomplete', 'username'); } catch (_) {}
            try { pEl.setAttribute('autocomplete', 'current-password'); } catch (_) {}

            // 临时调整name以提高密码管理器识别度（提交前还原）
            let originalNameU = null, originalNameP = null;
            if (standardizeNames) {
                originalNameU = uEl.getAttribute('name');
                originalNameP = pEl.getAttribute('name');
                try { uEl.setAttribute('name', 'username'); } catch (_) {}
                try { pEl.setAttribute('name', 'password'); } catch (_) {}
            }

            //（已弃用）触发浏览器autofill：保留基本焦点与输入事件，减少复杂动作
            try { uEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
            simulateRealClick(uEl);
            await new Promise(r => setTimeout(r, 150));
            uEl.focus();
            try { uEl.dispatchEvent(new FocusEvent('focus', { bubbles: true })); } catch (_) {}
            try { uEl.dispatchEvent(new Event('focusin', { bubbles: true })); } catch (_) {}
            uEl.dispatchEvent(new Event('input', { bubbles: true }));
            uEl.dispatchEvent(new Event('change', { bubbles: true }));
            await new Promise(r => setTimeout(r, 500)); // 等待autofill

            // 已弃用的检测逻辑移除：不再轮询或显示提示

            // 焦点到密码字段，类似
            try { pEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
            simulateRealClick(pEl);
            await new Promise(r => setTimeout(r, 120));
            pEl.focus();
            try { pEl.dispatchEvent(new FocusEvent('focus', { bubbles: true })); } catch (_) {}
            try { pEl.dispatchEvent(new Event('focusin', { bubbles: true })); } catch (_) {}
            pEl.dispatchEvent(new Event('input', { bubbles: true }));
            pEl.dispatchEvent(new Event('change', { bubbles: true }));
            await new Promise(r => setTimeout(r, 500));

            // 简化提交逻辑：若两个值已存在则尝试提交
            if (uEl.value && pEl.value) {
                // 提交前还原name，避免影响站点读取
                if (standardizeNames) {
                    try {
                        if (originalNameU !== null) uEl.setAttribute('name', originalNameU); else uEl.removeAttribute('name');
                        if (originalNameP !== null) pEl.setAttribute('name', originalNameP); else pEl.removeAttribute('name');
                    } catch (_) {}
                }
                if (submitEl) {
                    console.log('[LoginHelper] 检测到已有值，提交 ->', submitEl);
                    try { submitEl.click(); } catch (e) { console.warn(e); submitEl.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
                } else {
                    const form = pEl.closest('form');
                    if (form) {
                        console.log('[LoginHelper] 检测到已有值，提交表单');
                        form.submit();
                    }
                }
            }

            // 如果找到提交按钮，点击它
            if (submitEl) {
                // 提交前还原name，避免影响站点读取
                if (standardizeNames) {
                    try {
                        if (originalNameU !== null) uEl.setAttribute('name', originalNameU); else uEl.removeAttribute('name');
                        if (originalNameP !== null) pEl.setAttribute('name', originalNameP); else pEl.removeAttribute('name');
                    } catch (_) {}
                }
                console.log('[LoginHelper] 找到提交按钮，尝试点击 ->', submitEl);
                submitEl.click();
            } else {
                // 否则，尝试提交表单
                const form = pEl.closest('form');
                if (form) {
                    if (standardizeNames) {
                        try {
                            if (originalNameU !== null) uEl.setAttribute('name', originalNameU); else uEl.removeAttribute('name');
                            if (originalNameP !== null) pEl.setAttribute('name', originalNameP); else pEl.removeAttribute('name');
                        } catch (_) {}
                    }
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

    // 在指定 document（主文档或 iframe）中用保存的账户密码填充并提交
    async function fillAndSubmitWithSavedCredsInDocument(doc, username, password) {
        try {
            // 切到密码登录界面
            try {
                const switcher = doc.querySelector('#switcher_plogin') ||
                    Array.from(doc.querySelectorAll('a, button')).find(el => /密码登录|帐号密码|账号密码/i.test((el.textContent || '').trim()));
                if (switcher) { try { switcher.click(); } catch (e) { switcher.dispatchEvent(new MouseEvent('click', { bubbles: true })); } await new Promise(r => setTimeout(r, 250)); }
            } catch (_) {}

            const userSelectors = ['#u', 'input[name="u"]', 'input[id*="u"]', 'input[name*="user"]', 'input[type="email"]', 'input[type="text"]'];
            const passSelectors = ['#p', 'input[name="p"]', 'input[name="pwd"]', 'input[type="password"]'];

            let uEl = null, pEl = null;
            for (const s of userSelectors) { const e = doc.querySelector(s); if (e && isVisible(e)) { uEl = e; break; } }
            for (const s of passSelectors) { const e = doc.querySelector(s); if (e && isVisible(e)) { pEl = e; break; } }
            if (!uEl || !pEl) return false;

            // 临时标准化字段名以提高识别（提交前还原）
            let originalNameU = null, originalNameP = null;
            if (standardizeNames) {
                originalNameU = uEl.getAttribute('name');
                originalNameP = pEl.getAttribute('name');
                try { uEl.setAttribute('name', 'username'); } catch (_) {}
                try { pEl.setAttribute('name', 'password'); } catch (_) {}
            }

            // 填充值并派发事件
            try { uEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
            simulateRealClick(uEl);
            await new Promise(r => setTimeout(r, 120));
            uEl.focus();
            // 设置 autocomplete，帮助站点脚本识别
            try { uEl.setAttribute('autocomplete', 'username'); } catch (_) {}
            // 优先逐字符键入账号
            await simulateTyping(uEl, username);
            if (!uEl.value) {
                uEl.value = username;
                uEl.dispatchEvent(new Event('input', { bubbles: true }));
                uEl.dispatchEvent(new Event('change', { bubbles: true }));
            }
            // 隐藏提示标签
            const uTips = doc.querySelector('#uin_tips');
            if (uTips) { try { uTips.style.display = 'none'; } catch (_) {} }
            uEl.dispatchEvent(new Event('input', { bubbles: true }));
            uEl.dispatchEvent(new Event('change', { bubbles: true }));
            uEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'End' }));
            try { uEl.dispatchEvent(new Event('blur', { bubbles: true })); } catch (_) {}
            await new Promise(r => setTimeout(r, 150));

            try { pEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
            simulateRealClick(pEl);
            await new Promise(r => setTimeout(r, 120));
            pEl.focus();
            try { pEl.setAttribute('autocomplete', 'current-password'); } catch (_) {}
            // 优先逐字符键入密码
            await simulateTyping(pEl, password);
            if (!pEl.value) {
                pEl.value = password;
                pEl.dispatchEvent(new Event('input', { bubbles: true }));
                pEl.dispatchEvent(new Event('change', { bubbles: true }));
            }
            const pTips = doc.querySelector('#pwd_tips');
            if (pTips) { try { pTips.style.display = 'none'; } catch (_) {} }
            pEl.dispatchEvent(new Event('input', { bubbles: true }));
            pEl.dispatchEvent(new Event('change', { bubbles: true }));
            pEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter' }));
            try { pEl.dispatchEvent(new Event('blur', { bubbles: true })); } catch (_) {}
            await new Promise(r => setTimeout(r, 150));

            // 如果存在验证码区域且可见，提示用户
            try {
                const verifyArea = doc.querySelector('#verifyArea');
                if (verifyArea && (verifyArea.style.display !== 'none')) {
                    console.warn('[LoginHelper] 检测到验证码区域，可能需要手动处理验证码');
                }
            } catch (_) {}

            // 提交
            let submitEl = null;
            const submitSelectors = [
                'input[type="submit"]', 'button[type="submit"]',
                '#go', '.btn', '.btn-login', '.login', '.submit', '#submit', '#login',
                'button[id*="login"]', 'button[class*="login"]', 'input[id*="login"]', 'input[class*="login"]',
                'button[id*="signin"]', 'button[class*="signin"]', 'input[id*="signin"]', 'input[class*="signin"]',
                'button[id*="submit"]', 'button[class*="submit"]', 'input[id*="submit"]', 'input[class*="submit"]',
                'a[href^="javascript:"]'
            ];
            for (const s of submitSelectors) { const e = doc.querySelector(s); if (e) { submitEl = e; break; } }
            // 优先点击明确的登录按钮 id
            const loginBtn = doc.querySelector('#login_button');
            const loginAnchor = doc.querySelector('a.login_button');
            if (loginBtn) submitEl = loginBtn;
            if (!submitEl && loginAnchor) submitEl = loginAnchor;
            if (submitEl) {
                // 触发点击，并尽量触发表单的 onsubmit 处理
                try { submitEl.click(); } catch (e) { submitEl.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
                const form = doc.querySelector('#loginform') || pEl.closest('form');
                if (form) {
                    if (standardizeNames) {
                        try {
                            if (originalNameU !== null) uEl.setAttribute('name', originalNameU); else uEl.removeAttribute('name');
                            if (originalNameP !== null) pEl.setAttribute('name', originalNameP); else pEl.removeAttribute('name');
                        } catch (_) {}
                    }
                    try { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); } catch (_) {}
                }
                return true;
            } else {
                const form = doc.querySelector('#loginform') || pEl.closest('form');
                if (form) {
                    // 优先派发 submit 事件以触发站点逻辑（避免直接 form.submit 绕过 onsubmit）
                    try {
                        const ok = form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                        if (!ok) return true;
                    } catch (_) {}
                    if (standardizeNames) {
                        try {
                            if (originalNameU !== null) uEl.setAttribute('name', originalNameU); else uEl.removeAttribute('name');
                            if (originalNameP !== null) pEl.setAttribute('name', originalNameP); else pEl.removeAttribute('name');
                        } catch (_) {}
                    }
                    form.submit();
                    return true;
                }
            }
            return true;
        } catch (err) {
            console.error('[LoginHelper] 保存凭据填充异常：', err);
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

    // 登录成功与跳转检测（轻量监控）
    (function setupSuccessMonitor(){
        let lastHref = location.href;
        setInterval(() => {
            const href = location.href;
            if (href !== lastHref) {
                updateStatusBar('页面跳转中，正在确认登录状态…');
                lastHref = href;
            }
            const isQzone = /qzone\.qq\.com|user\.qzone\.qq\.com/i.test(location.hostname);
            const inLoginPage = /ptlogin2\.qq\.com|xui\.ptlogin2\.qq\.com|ui\.ptlogin2\.qq\.com/i.test(location.hostname);
            if (isQzone && !/登录/i.test(document.title)) {
                updateStatusBar('登录成功');
            } else if (!inLoginPage && /登录/i.test(document.title)) {
                // 保持原有逻辑由未登录检测驱动
            }
        }, 1500);
    })();

    // 初始触发
    setTimeout(attemptLoginFlow, 2000);
})();
        // 清除本地凭据按钮
        document.addEventListener('click', (ev) => {
            const t = ev.target;
            if (t && t.id === 'lh-clearCreds') {
                try {
                    localStorage.removeItem('lh-savedUsername');
                    localStorage.removeItem('lh-savedPassword');
                } catch (_) {}
                savedUsername = '';
                savedPassword = '';
                const uInput = document.getElementById('lh-savedUsername');
                const pInput = document.getElementById('lh-savedPassword');
                if (uInput) uInput.value = '';
                if (pInput) pInput.value = '';
                // 若当前登录方式为saved，改回头像登录以避免误触
                const lmSelect = document.getElementById('lh-loginMethod');
                if (lmSelect && lmSelect.value === 'saved') {
                    lmSelect.value = 'avatar';
                    localStorage.setItem('lh-loginMethod', 'avatar');
                }
                alert('已清除本地保存的账号与密码。');
            }
        });
