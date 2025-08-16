// ==UserScript==
// @name         QZone AutoPraise 精简稳定版
// @namespace    https://github.com/llulun/qzone-autopraise-pro
// @version      2.0
// @description  QQ空间自动点赞工具 - 精简稳定版
// @author       llulun
// @match        *://*.qzone.qq.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ========== 基础配置 ==========
    let blockQQNumbers = getCookie('al-blockQQNumbers') ? getCookie('al-blockQQNumbers').split(',') : [];
    let filterGameForward = getCookie('al-filterGameForward') === 'true';
    let duration = parseInt(getCookie('al-duration')) || 180;
    let refreshDelay = parseInt(getCookie('al-refreshDelay')) || 10;
    let likeDelay = parseInt(getCookie('al-likeDelay')) || 5;
    let scrollCount = parseInt(getCookie('al-scrollCount')) || 3;
    let scrollStep = parseInt(getCookie('al-scrollStep')) || 500;
    let initialDelay = parseInt(getCookie('al-initialDelay')) || 3000;
    let maxRetries = parseInt(getCookie('al-maxRetries')) || 3;

    // 状态变量
    let lastRefresh = parseInt(getCookie('al-lastRefresh')) || Date.now();
    let nextTime = lastRefresh + duration * 1000;
    let retryCount = 0;
    let isRunning = false;
    let isPaused = false;
    let currentTask = '';

    // 获取UIN（QQ号）
    const uin = window.g_iUin || window.QZONE?.FP?.getQzoneConfig()?.loginUin ||
                document.cookie.match(/uin=o0*(\d+)/)?.[1] || '';

    // ========== Cookie操作 ==========
    function setCookie(name, value, seconds) {
        const expires = new Date(Date.now() + seconds * 1000).toUTCString();
        document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
    }

    function getCookie(name) {
        const value = '; ' + document.cookie;
        const parts = value.split('; ' + name + '=');
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    }

    function deleteCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    // ========== 移除"与我相关"菜单 ==========
    function removeMeRelatedMenu() {
        const meTab = document.getElementById('tab_menu_me') ||
                     document.querySelector('li[type="me"]') ||
                     document.querySelector('#feed_tab_my');
        if (meTab) {
            meTab.style.display = 'none';
            console.log('已移除"与我相关"菜单元素');
        }
    }

    // ========== 检测是否在好友动态页面（原始逻辑） ==========
    function isInFriendFeedPage() {
        const hasLikeButtons = document.querySelectorAll('.qz_like_btn_v3').length > 0;
        console.log('检测点赞元素:', hasLikeButtons ? '存在（在好友动态）' : '不存在（不在好友动态）');
        return hasLikeButtons;
    }

    // ========== 进入好友动态页面（原始逻辑） ==========
    function goToFriendFeed() {
        currentTask = '切换到好友动态页面';
        updateStatusBar('点赞元素不存在，切换到好友动态页面...');
        console.log('切换到好友动态，UIN:', uin);

        // 按原始代码的顺序尝试点击好友动态标签
        const friendTab = document.getElementById('tab_menu_friend') ||
                         document.querySelector('li[type="friend"] a') ||
                         document.querySelector('.feed-control-tab a:not(.item-on)');

        if (friendTab) {
            friendTab.click();
            console.log('点击左侧菜单栏"好友动态"tab');
            // 点击后等待一下再刷新
            setTimeout(() => {
                refresh();
            }, 2000);
        } else if (uin) {
            // 如果找不到标签，直接导航到好友动态页面
            location.href = `https://user.qzone.qq.com/${uin}/infocenter`;
            console.log('直接导航到infocenter');
        } else {
            // 最后的备选方案
            refresh();
            console.log('无tab可用，刷新页面');
        }
    }

    // ========== 安全点赞（原始逻辑） ==========
    function safeLike() {
        currentTask = '执行安全点赞';
        updateStatusBar('开始安全点赞...');

        try {
            const btns = document.querySelectorAll('.qz_like_btn_v3');
            const contents = document.querySelectorAll('.f-info');
            const users = document.querySelectorAll('.f-name');

            let likedCount = 0;
            let skippedCount = 0;

            btns.forEach((btn, index) => {
                setTimeout(() => {
                    // 检查是否已赞
                    if (btn.classList.contains('item-on')) {
                        skippedCount++;
                        return;
                    }

                    // 获取用户QQ号
                    const userLink = users[index];
                    const qqNumber = userLink ? userLink.href.match(/\/(\d+)/)?.[1] : '';

                    // 检查是否在屏蔽列表
                    if (qqNumber && blockQQNumbers.includes(qqNumber)) {
                        console.log('跳过屏蔽用户:', qqNumber);
                        skippedCount++;
                        return;
                    }

                    // 获取内容
                    const content = contents[index]?.innerText || '';

                    // 过滤游戏转发
                    if (filterGameForward && /游戏|转发|点赞/.test(content)) {
                        console.log('跳过游戏转发内容');
                        skippedCount++;
                        return;
                    }

                    // 执行点赞
                    btn.click();
                    likedCount++;
                    console.log('点赞成功 #' + (index + 1));

                    // 更新状态
                    updateStatusBar('点赞进度: ' + likedCount + ' 成功, ' + skippedCount + ' 跳过');
                }, index * likeDelay * 1000);
            });

            // 点赞完成后滚动
            setTimeout(() => {
                simulateScroll();
            }, btns.length * likeDelay * 1000 + 2000);

        } catch(e) {
            console.error('点赞出错:', e);
            updateStatusBar('点赞出错: ' + e.message);
        }
    }

    // ========== 模拟滚动 ==========
    function simulateScroll() {
        currentTask = '模拟滚动加载';
        updateStatusBar('模拟滚动以加载更多动态...');

        let scrolled = 0;
        const scrollInterval = setInterval(() => {
            if (scrolled >= scrollCount) {
                clearInterval(scrollInterval);
                // 滚动完成后回到顶部
                setTimeout(() => {
                    window.scrollTo(0, 0);
                    updateStatusBar('滚动完成，已回到顶部');
                }, 2000);
                return;
            }

            window.scrollBy(0, scrollStep);
            scrolled++;
            updateStatusBar('滚动进度: ' + scrolled + '/' + scrollCount);
        }, 2000);
    }

    // ========== 刷新页面 ==========
    function refresh() {
        currentTask = '刷新页面';
        lastRefresh = Date.now();
        setCookie('al-lastRefresh', lastRefresh, Number.MAX_SAFE_INTEGER);
        nextTime = Date.now() + duration * 1000;
        setCookie('al-justRefreshed', 'true', 60);
        location.reload();
    }

    // ========== 执行工作流（原始逻辑） ==========
    function executeWorkflow() {
        if (isRunning && !isPaused) return;

        isRunning = true;
        currentTask = '执行整体工作流';
        updateStatusBar('开始执行工作流');

        // 等待初始延迟
        setTimeout(() => {
            if (isInFriendFeedPage()) {
                // 在好友动态页面，直接点赞
                updateStatusBar('检测到点赞元素，直接执行点赞...');
                safeLike();
            } else {
                // 不在好友动态页面，切换过去
                updateStatusBar('未检测到点赞元素，切换并刷新页面...');
                retryCount++;

                if (retryCount > maxRetries) {
                    updateStatusBar('重试次数超过上限，停止执行');
                    isRunning = false;
                    retryCount = 0;
                    return;
                }

                goToFriendFeed();
                // goToFriendFeed会调用refresh，refresh后会重新执行工作流
            }

            isRunning = false;
            currentTask = '';
        }, initialDelay);
    }

    // ========== 创建状态栏 ==========
    function createStatusBar() {
        const statusBar = document.createElement('div');
        statusBar.id = 'al-status-bar';
        statusBar.style.cssText =
            'position: fixed; top: 10px; left: 10px; width: 300px; ' +
            'padding: 10px; background: rgba(0, 0, 0, 0.8); color: #fff; ' +
            'font-size: 12px; border-radius: 8px; z-index: 10000; ' +
            'box-shadow: 0 2px 10px rgba(0,0,0,0.3);';

        document.body.appendChild(statusBar);
        return statusBar;
    }

    // ========== 更新状态栏 ==========
    function updateStatusBar(customMessage) {
        const statusBar = document.getElementById('al-status-bar') || createStatusBar();

        const now = Date.now();
        const timeLeft = Math.max(0, Math.floor((nextTime - now) / 1000));
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        let statusHTML = '<div style="font-weight: bold; margin-bottom: 5px;">QZone AutoPraise Pro</div>';

        if (customMessage) {
            statusHTML += '<div style="color: #4CAF50; margin: 5px 0;">' + customMessage + '</div>';
        }

        statusHTML += '<div>下次刷新: ' + minutes + '分' + seconds + '秒</div>';
        statusHTML += '<div>重试次数: ' + retryCount + '/' + maxRetries + '</div>';

        if (currentTask) {
            statusHTML += '<div>当前任务: ' + currentTask + '</div>';
        }

        statusHTML += '<div style="margin-top: 5px;">' +
            '<button onclick="togglePause()" style="padding: 2px 8px; margin-right: 5px;">' +
            (isPaused ? '恢复' : '暂停') + '</button>' +
            '<button onclick="showConfig()" style="padding: 2px 8px;">设置</button>' +
            '</div>';

        statusBar.innerHTML = statusHTML;
    }

    // ========== 创建简单设置面板 ==========
    function createConfigPanel() {
        const panel = document.createElement('div');
        panel.id = 'al-config-panel';
        panel.style.cssText =
            'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); ' +
            'width: 400px; padding: 20px; background: rgba(255, 255, 255, 0.95); ' +
            'border-radius: 10px; z-index: 10001; display: none; ' +
            'box-shadow: 0 4px 20px rgba(0,0,0,0.3);';

        panel.innerHTML = `
            <h3>AutoPraise 设置</h3>
            <div style="margin: 10px 0;">
                <label>屏蔽QQ号 (逗号分隔):</label><br>
                <input type="text" id="config-blockQQ" value="${blockQQNumbers.join(',')}"
                       style="width: 100%; padding: 5px;">
            </div>
            <div style="margin: 10px 0;">
                <label>
                    <input type="checkbox" id="config-filterGame" ${filterGameForward ? 'checked' : ''}>
                    过滤游戏转发内容
                </label>
            </div>
            <div style="margin: 10px 0;">
                <label>刷新间隔 (秒):</label><br>
                <input type="number" id="config-duration" value="${duration}" min="30"
                       style="width: 100%; padding: 5px;">
            </div>
            <div style="margin: 10px 0;">
                <label>下滑次数:</label><br>
                <input type="number" id="config-scrollCount" value="${scrollCount}" min="1" max="10"
                       style="width: 100%; padding: 5px;">
            </div>
            <div style="margin: 20px 0; text-align: center;">
                <button onclick="saveConfig()" style="padding: 5px 20px; margin-right: 10px;">保存</button>
                <button onclick="closeConfig()" style="padding: 5px 20px;">关闭</button>
            </div>
        `;

        document.body.appendChild(panel);
        return panel;
    }

    // ========== 全局函数（供按钮调用） ==========
    window.togglePause = function() {
        isPaused = !isPaused;
        if (!isPaused) {
            nextTime = Date.now() + duration * 1000;
        }
        updateStatusBar(isPaused ? '已暂停' : '已恢复');
    };

    window.showConfig = function() {
        const panel = document.getElementById('al-config-panel') || createConfigPanel();
        panel.style.display = 'block';
    };

    window.closeConfig = function() {
        const panel = document.getElementById('al-config-panel');
        if (panel) panel.style.display = 'none';
    };

    window.saveConfig = function() {
        blockQQNumbers = document.getElementById('config-blockQQ').value.split(',').map(s => s.trim()).filter(s => s);
        filterGameForward = document.getElementById('config-filterGame').checked;
        duration = parseInt(document.getElementById('config-duration').value) || 180;
        scrollCount = parseInt(document.getElementById('config-scrollCount').value) || 3;

        setCookie('al-blockQQNumbers', blockQQNumbers.join(','), Number.MAX_SAFE_INTEGER);
        setCookie('al-filterGameForward', filterGameForward, Number.MAX_SAFE_INTEGER);
        setCookie('al-duration', duration, Number.MAX_SAFE_INTEGER);
        setCookie('al-scrollCount', scrollCount, Number.MAX_SAFE_INTEGER);

        closeConfig();
        updateStatusBar('设置已保存');
    };

    // ========== 主循环 ==========
    function mainLoop() {
        if (!isPaused) {
            const now = Date.now();
            if (now >= nextTime) {
                refresh();
            }
        }

        updateStatusBar();
        setTimeout(mainLoop, 1000);
    }

    // ========== 初始化 ==========
    function init() {
        console.log('[QZone AutoPraise] 初始化...');

        removeMeRelatedMenu();
        createStatusBar();

        // 检查是否刚刷新
        const justRefreshed = getCookie('al-justRefreshed') === 'true';
        if (justRefreshed) {
            deleteCookie('al-justRefreshed');
            // 刷新后延迟执行工作流
            setTimeout(() => {
                executeWorkflow();
            }, refreshDelay * 1000);
        }

        // 启动主循环
        mainLoop();

        updateStatusBar('脚本已启动');
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
