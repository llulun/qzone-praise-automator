// ==UserScript==
// @name         QZone AutoPraise Pro
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.0
// @description  网页版QQ空间自动点赞工具（增强版：简化工作流，通过检测点赞元素判断是否在好友动态页面，有则直接执行点赞，无则切换到好友动态后刷新页面重走流程，移除菜单元素，添加延迟处理、安全点赞、菜单调整、状态栏美化、滚动模拟等功能）
// @author       llulun
// @match        *://*.qzone.qq.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    // 从cookie获取配置（简化：移除pageDetectDelay）
    let duration = parseInt(getCookie('al-duration')) || 180; // 默认180秒刷新频率
    let refreshDelay = parseInt(getCookie('al-refreshDelay')) || 10; // 默认10秒刷新后整体延迟
    let likeDelay = parseInt(getCookie('al-likeDelay')) || 5; // 默认5秒点赞延迟
    let scrollCount = parseInt(getCookie('al-scrollCount')) || 3; // 默认下滑3个动态
    let blocked = getCookie('al-blocked') ? getCookie('al-blocked').split(',') : [];
    const dict = ['点赞', '转发', '评论']; // 使用const以防修改，针对游戏转发类内容
    let select = Boolean(getCookie('al-select'));
    let lastRefresh = parseInt(getCookie('al-lastRefresh')) || 0;
    let nextTime = Math.max(Date.now(), lastRefresh + duration * 1000);
    let isScrolling = false;
    let timeout = null; // 用于滚动超时
    let isRunning = false; // 防止并发执行
    let testMode = false; // 测试模式标志
    let uin = unsafeWindow.g_iUin || unsafeWindow.g_iLoginUin || ''; // 获取当前用户UIN，用于URL导航
    let retryCount = 0; // 重试计数器，避免无限循环
    const maxRetries = 3; // 最大重试次数

    // Cookie 操作函数（不变）
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

    // 设置配置函数（简化：移除通用延迟提示）
    function setConfig() {
        const max = Number.MAX_SAFE_INTEGER;
        alert("Auto Like Enhanced 需要您填写一些必要的信息~");
        let blk = prompt('请输入你不想点赞的用户的QQ号（可输入多个，用英文逗号","分隔）', blocked.join(',')).replaceAll(' ', '');
        blocked = blk ? blk.split(',') : [];
        setCookie('al-blocked', blk, max);
        select = confirm('是否不点赞转发游戏类内容？');
        setCookie('al-select', select ? 'true' : '', max);
        let dur = prompt('请输入自动刷新频率（秒），默认180秒：', duration);
        duration = parseInt(dur) || 180;
        setCookie('al-duration', duration, max);
        let rDelay = prompt('请输入刷新后整体延迟（秒），默认10秒：', refreshDelay);
        refreshDelay = parseInt(rDelay) || 10;
        setCookie('al-refreshDelay', refreshDelay, max);
        let lDelay = prompt('请输入点赞操作延迟（秒），默认5秒：', likeDelay);
        likeDelay = parseInt(lDelay) || 5;
        setCookie('al-likeDelay', likeDelay, max);
        let sCount = prompt('请输入每次下滑动态数量，默认3：', scrollCount);
        scrollCount = parseInt(sCount) || 3;
        setCookie('al-scrollCount', scrollCount, max);
        alert('如果需要再次设置，可以双击页面任意处调用或使用菜单。');
        alert('操作说明：\n需保持浏览器窗口打开QQ空间好友动态页面状态，\n每隔' + duration + '秒会自动刷新并执行流程。\n滑动页面浏览时也会自动点赞。\n增强功能：安全点赞（避免二次点赞）、延迟处理、滚动模拟、简化工作流通过点赞元素检测是否在好友动态并切换后刷新重走、有则直接点赞。');
        setCookie('al-setted', 'true', max);
        updateStatusBar(); // 更新状态栏
    }

    // 创建菜单栏（简化：移除通用延迟输入）
    function createMenu() {
        let menu = document.createElement('div');
        menu.id = 'al-menu';
        menu.style.position = 'fixed';
        menu.style.top = '60px'; // 稍微往下，避免遮挡顶部
        menu.style.right = '10px';
        menu.style.background = 'linear-gradient(to bottom, #ffffff, #f0f0f0)';
        menu.style.border = '1px solid #ccc';
        menu.style.borderRadius = '8px';
        menu.style.padding = '10px';
        menu.style.zIndex = '10002';
        menu.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        menu.style.fontFamily = 'Arial, sans-serif';
        menu.style.opacity = '0.85'; // 添加透明度
        menu.style.display = 'none'; // 默认隐藏

        menu.innerHTML = `
            <h3 style="margin: 0; color: #333;">Auto Like 控制面板</h3>
            <hr style="border: 0; height: 1px; background: #ddd;">
            <label>刷新频率 (秒): <input type="number" id="al-dur" value="${duration}" min="30" style="width: 60px;"></label><br>
            <label>刷新延迟 (秒): <input type="number" id="al-rdelay" value="${refreshDelay}" min="5" style="width: 60px;"></label><br>
            <label>点赞延迟 (秒): <input type="number" id="al-ldelay" value="${likeDelay}" min="3" style="width: 60px;"></label><br>
            <label>下滑动态数: <input type="number" id="al-scount" value="${scrollCount}" min="1" style="width: 60px;"></label><br>
            <button id="al-save" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">保存</button>
            <button id="al-test" style="background: #2196F3; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-left: 10px;">测试执行</button>
            <button id="al-close" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-left: 10px;">关闭</button>
        `;

        document.body.appendChild(menu);

        // 保存按钮事件（简化：移除通用延迟保存）
        document.getElementById('al-save').addEventListener('click', function() {
            duration = parseInt(document.getElementById('al-dur').value) || 180;
            refreshDelay = parseInt(document.getElementById('al-rdelay').value) || 10;
            likeDelay = parseInt(document.getElementById('al-ldelay').value) || 5;
            scrollCount = parseInt(document.getElementById('al-scount').value) || 3;
            setCookie('al-duration', duration, Number.MAX_SAFE_INTEGER);
            setCookie('al-refreshDelay', refreshDelay, Number.MAX_SAFE_INTEGER);
            setCookie('al-likeDelay', likeDelay, Number.MAX_SAFE_INTEGER);
            setCookie('al-scrollCount', scrollCount, Number.MAX_SAFE_INTEGER);
            nextTime = Date.now() + duration * 1000;
            alert('设置已保存！');
            updateStatusBar();
        });

        // 测试按钮：直接执行流程
        document.getElementById('al-test').addEventListener('click', function() {
            testMode = true;
            executeWorkflow();
            testMode = false;
        });

        // 关闭按钮
        document.getElementById('al-close').addEventListener('click', function() {
            menu.style.display = 'none';
        });

        // 切换按钮（浮动按钮显示菜单）
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
        toggleBtn.addEventListener('click', function() {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });

        document.body.appendChild(toggleBtn);
    }

    // 创建状态栏（保持详细显示，不进一步精简）
    function createStatusBar() {
        let statusBar = document.createElement('div');
        statusBar.id = 'al-status-bar';
        statusBar.style.position = 'fixed';
        statusBar.style.top = '0';
        statusBar.style.left = '0';
        statusBar.style.width = '100%';
        statusBar.style.background = 'linear-gradient(to right, #f0f0f0, #e0e0e0)';
        statusBar.style.padding = '12px 20px'; // 增加padding调宽，显示更多
        statusBar.style.zIndex = '10001';
        statusBar.style.fontSize = '15px'; // 略增大字体，便于阅读更多内容
        statusBar.style.textAlign = 'center';
        statusBar.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        statusBar.style.fontFamily = 'Arial, sans-serif';
        statusBar.style.color = '#333';
        statusBar.style.opacity = '0.85'; // 添加透明度，不影响观看
        document.body.appendChild(statusBar);

        // 每秒更新状态栏
        setInterval(updateStatusBar, 1000);
        updateStatusBar();
    }

    // 更新状态栏函数（保持详细，不精简，添加重试次数显示）
    function updateStatusBar(message = '') {
        let statusBar = document.getElementById('al-status-bar');
        if (!statusBar) return;

        let lastRefreshTime = new Date(lastRefresh).toLocaleTimeString();
        let nextRefreshTime = new Date(nextTime).toLocaleTimeString();
        let remainingSeconds = Math.max(0, Math.ceil((nextTime - Date.now()) / 1000));
        let remainingColor = remainingSeconds < 30 ? 'red' : 'green';
        let scrollingStatus = isScrolling ? '<span style="color: blue;">滚动中</span>' : '<span style="color: gray;">静止</span>';
        let currentStep = message || (isRunning ? '<span style="color: orange;">执行中...</span>' : '<span style="color: green;">等待刷新</span>');

        statusBar.innerHTML = `
            上次刷新: <strong>${lastRefreshTime}</strong> |
            下次刷新: <strong>${nextRefreshTime}</strong> |
            剩余时间: <span style="color: ${remainingColor};">${remainingSeconds} 秒</span> |
            状态: ${scrollingStatus} |
            当前步骤: ${currentStep} |
            刷新间隔: <strong>${duration} 秒</strong> |
            延迟: 刷新${refreshDelay}s / 点赞${likeDelay}s |
            下滑: ${scrollCount}个动态 |
            重试: ${retryCount}/${maxRetries}
        `;
    }

    // 移除“与我相关”菜单元素（不变：隐藏元素）
    function removeMeRelatedMenu() {
        let meTab = document.getElementById('tab_menu_me') || document.querySelector('li[type="me"]') || document.querySelector('#feed_tab_my');
        if (meTab) {
            meTab.style.display = 'none'; // 隐藏元素，避免点击
            console.log('已移除“与我相关”菜单元素');
        } else {
            console.log('未找到“与我相关”菜单元素');
        }
    }

    // 检测是否在好友动态页面（通过检测是否存在点赞元素）
    function isInFriendFeedPage() {
        const hasLikeButtons = document.querySelectorAll('.qz_like_btn_v3').length > 0;
        console.log('检测点赞元素:', hasLikeButtons ? '存在（在好友动态）' : '不存在（不在好友动态）');
        return hasLikeButtons;
    }

    // 进入“好友动态”页面（优先点击tab，备选重定向，只在必要时调用）
    function goToFriendFeed() {
        updateStatusBar('点赞元素不存在，切换到好友动态页面...');
        console.log('切换到好友动态，UIN:', uin);

        let friendTab = document.getElementById('tab_menu_friend') || document.querySelector('li[type="friend"] a') || document.querySelector('.feed-control-tab a:not(.item-on)');
        if (friendTab) {
            friendTab.click();
            console.log('点击左侧菜单栏“好友动态”tab');
        } else if (uin) {
            location.href = `https://user.qzone.qq.com/${uin}/infocenter`;
            console.log('直接导航到infocenter');
        } else {
            refresh();
            console.log('无tab可用，刷新页面');
        }
    }

    // 安全点赞函数（不变）
    function safeLike() {
        updateStatusBar('开始安全点赞...');
        try {
            const btns = document.querySelectorAll('.qz_like_btn_v3');
            const contents = document.querySelectorAll('.f-info');
            const users = document.querySelectorAll('.f-name');

            Array.from(btns).forEach((btn, index) => {
                setTimeout(() => {
                    const content = contents[index] ? contents[index].innerHTML : '';
                    const user = users[index] && users[index].getAttribute('link') ? users[index].getAttribute('link').replace('nameCard_', '') : '';

                    if (btn.classList.contains('item-on') || blocked.indexOf(user) > -1) {
                        updateStatusBar(`跳过已赞或屏蔽动态 ${index + 1}`);
                        return;
                    }

                    let isGameForward = false;
                    if (select) {
                        for (let j = 0; j < dict.length; j++) {
                            const word = dict[j];
                            if (content.includes(word)) {
                                isGameForward = true;
                                break;
                            }
                        }
                    }

                    if (isGameForward) {
                        updateStatusBar(`跳过游戏转发动态 ${index + 1}`);
                        return;
                    }

                    btn.click();
                    console.log('Liked: ' + content);
                    updateStatusBar(`点赞动态 ${index + 1}`);
                }, index * likeDelay * 1000);
            });

            setTimeout(safeLike, (btns.length * likeDelay + 5) * 1000);
        } catch (error) {
            console.error('Safe like failed:', error);
            updateStatusBar('点赞过程中出错: ' + error.message);
        }
    }

    // 模拟下滑动态（不变）
    function simulateScroll() {
        updateStatusBar('模拟下滑动态...');
        let scrollStep = window.innerHeight * 0.9;

        Array.from({length: scrollCount}).forEach((_, i) => {
            const stepIndex = i;
            const targetScroll = (stepIndex + 1) * scrollStep;
            setTimeout(() => {
                smoothScrollTo(targetScroll, 500);
                window.dispatchEvent(new Event('scroll'));
                safeLike();
                updateStatusBar(`滚动到动态组 ${stepIndex + 1}/${scrollCount}`);
                let loadMoreBtn = document.querySelector('.load-more') || document.querySelector('a[title="加载更多"]');
                if (loadMoreBtn) {
                    loadMoreBtn.click();
                    console.log('点击加载更多按钮作为备用');
                }
            }, stepIndex * 3000);
        });
        setTimeout(() => {
            smoothScrollTo(0, 1000);
            updateStatusBar('回到顶部，等待下次刷新');
        }, scrollCount * 3000 + 3000);
    }

    // 平滑滚动辅助函数（不变）
    function smoothScrollTo(targetY, duration) {
        const startY = window.scrollY;
        const distance = targetY - startY;
        let startTime = null;

        function animation(currentTime) {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = progress * (2 - progress);
            window.scrollTo(0, startY + distance * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                window.dispatchEvent(new Event('scroll'));
            }
        }

        requestAnimationFrame(animation);
    }

    // 刷新页面（不变：刷新当前页面，从头开始流程）
    function refresh() {
        lastRefresh = Date.now();
        setCookie('al-lastRefresh', lastRefresh, Number.MAX_SAFE_INTEGER);
        nextTime = Date.now() + duration * 1000;
        setCookie('al-justRefreshed', 'true', 60);
        location.reload();
        updateStatusBar('页面刷新完成，从头开始流程');
    }

    // 执行整个工作流（简化：通过点赞元素检测是否在好友动态，有则直接执行点赞，无则切换后刷新页面重走流程）
    function executeWorkflow() {
        if (isRunning && !testMode) return;
        isRunning = true;
        updateStatusBar('开始执行工作流');

        setTimeout(() => {
            // 通过点赞元素检测是否在好友动态页面
            if (isInFriendFeedPage()) {
                // 有点赞元素，直接执行点赞
                updateStatusBar('检测到点赞元素，直接执行点赞...');
                safeLike();
                simulateScroll();
            } else {
                // 无点赞元素，切换并刷新页面
                updateStatusBar('未检测到点赞元素，切换并刷新页面...');
                goToFriendFeed();
                // 切换后立即刷新页面（确保切换生效），并延迟重走流程
                refresh();
                setTimeout(executeWorkflow, refreshDelay * 1000);
            }
            isRunning = false;
        }, 3000); // 初始延迟确保页面稳定
    }

    // 滚动事件（不变）
    window.addEventListener('scroll', function() {
        if (timeout) clearTimeout(timeout);
        isScrolling = true;
        updateStatusBar();
        safeLike();
        timeout = setTimeout(() => {
            isScrolling = false;
            updateStatusBar();
        }, 1000);
    });

    // 主循环（不变）
    setInterval(function() {
        const time = Date.now();
        if (time >= nextTime || testMode) {
            refresh();
        } else if (isScrolling) {
            safeLike();
        }
    }, 5000);

    // 初始化
    unsafeWindow.setConfig = setConfig;
    unsafeWindow.getCookie = getCookie;
    unsafeWindow.setCookie = setCookie;

    window.onload = function () {
        if (!getCookie('al-setted')) setConfig();
        createMenu();
        createStatusBar();

        window.ondblclick = setConfig;

        console.log('当前UIN:', uin);

        removeMeRelatedMenu();

        if (getCookie('al-justRefreshed')) {
            setCookie('al-justRefreshed', '', -1);
            setTimeout(executeWorkflow, 3000);
        }
    };

    console.log('Auto Like Enhanced Running...');
})();
