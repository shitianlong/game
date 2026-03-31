// GameHub - 网络游戏推荐系统
// 所有数据存储在localStorage中，模拟后端功能

document.addEventListener('DOMContentLoaded', function() {
    // 初始化系统
    initSystem();
    
    // 设置导航链接事件
    setupNavLinks();
    
    // 设置认证相关事件
    setupAuthEvents();
    
    // 设置用户交互事件
    setupUserEvents();
    
    // 加载初始数据
    loadData();
    
    // 更新统计数据
    updateStats();
});

// ==================== 初始化 ====================
function initSystem() {
    // 检查是否已登录
    const currentUser = getCurrentUser();
    if (currentUser) {
        showSection('home-section');
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('register-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        document.getElementById('user-name').textContent = currentUser.username;
        document.getElementById('user-avatar').textContent = currentUser.username.charAt(0).toUpperCase();
        
        // 如果是管理员，显示额外功能
        if (currentUser.role === 'admin') {
            // 可以添加管理员特定功能
        }
    } else {
        showSection('login-section');
    }
    
    // 生成验证码
    generateCaptcha();
    
    // 设置当前日期
    const now = new Date();
    document.getElementById('info-register-date').textContent = formatDate(now);
    document.getElementById('info-last-login').textContent = formatDate(now);
}

// ==================== 导航功能 ====================
function setupNavLinks() {
    // 导航链接
    document.getElementById('home-link').addEventListener('click', (e) => {
        e.preventDefault();
        setActiveLink('home-link');
        showSection('home-section');
    });
    
    document.getElementById('recommend-link').addEventListener('click', (e) => {
        e.preventDefault();
        setActiveLink('recommend-link');
        showSection('recommend-section');
        loadRecommendations();
    });
    
    document.getElementById('friends-link').addEventListener('click', (e) => {
        e.preventDefault();
        setActiveLink('friends-link');
        showSection('friends-section');
        loadFriends();
    });
    
    document.getElementById('market-link').addEventListener('click', (e) => {
        e.preventDefault();
        setActiveLink('market-link');
        showSection('market-section');
        loadMarket();
    });
    
    document.getElementById('ranking-link').addEventListener('click', (e) => {
        e.preventDefault();
        setActiveLink('ranking-link');
        showSection('ranking-section');
        loadRankings();
    });
    
    document.getElementById('forum-link').addEventListener('click', (e) => {
        e.preventDefault();
        setActiveLink('forum-link');
        showSection('forum-section');
        loadForumPosts();
    });
    
    // 用户头像点击显示个人资料
    document.getElementById('user-avatar').addEventListener('click', () => {
        if (getCurrentUser()) {
            showSection('profile-section');
            loadUserProfile();
        }
    });
    
    // 退出登录
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // 显示注册/登录表单
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('register-section').style.display = 'block';
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
    });
    
    // 登录和注册按钮
    document.getElementById('login-btn').addEventListener('click', () => {
        showSection('login-section');
    });
    
    document.getElementById('register-btn').addEventListener('click', () => {
        showSection('register-section');
    });
}

// ==================== 认证功能 ====================
function setupAuthEvents() {
    // 刷新验证码
    document.getElementById('captcha-refresh').addEventListener('click', generateCaptcha);
    
    // 登录表单提交
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // 注册表单提交
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister();
    });
}

function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captcha = '';
    for (let i = 0; i < 4; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('captcha-display').textContent = captcha;
    return captcha;
}

function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const captchaInput = document.getElementById('login-captcha').value.trim().toUpperCase();
    const captchaDisplay = document.getElementById('captcha-display').textContent;
    
    // 验证验证码
    if (captchaInput !== captchaDisplay) {
        alert('验证码错误！');
        generateCaptcha();
        return;
    }
    
    // 获取用户数据
    const users = JSON.parse(localStorage.getItem('gamehub_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // 保存当前用户
        localStorage.setItem('gamehub_current_user', JSON.stringify(user));
        
        // 更新UI
        document.getElementById('user-name').textContent = user.username;
        document.getElementById('user-avatar').textContent = user.username.charAt(0).toUpperCase();
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('register-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        
        // 隐藏登录表单，显示首页
        document.getElementById('login-section').style.display = 'none';
        showSection('home-section');
        
        // 更新最后登录时间
        const now = new Date();
        document.getElementById('info-last-login').textContent = formatDate(now);
        
        alert('登录成功！');
        updateStats();
        loadUserProfile();
    } else {
        alert('账号或密码错误！');
        generateCaptcha();
    }
}

function handleRegister() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const role = document.getElementById('register-role').value;
    const email = document.getElementById('register-email').value.trim();
    
    // 验证输入
    if (password !== confirm) {
        alert('两次输入的密码不一致！');
        return;
    }
    
    if (password.length < 6) {
        alert('密码长度至少为6位！');
        return;
    }
    
    // 检查用户名是否已存在
    const users = JSON.parse(localStorage.getItem('gamehub_users') || '[]');
    if (users.some(u => u.username === username)) {
        alert('该账号已存在！');
        return;
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        role: role,
        email: email,
        avatar: username.charAt(0).toUpperCase(),
        level: 1,
        points: 1000, // 初始积分
        friends: [],
        games: [],
        preferences: ['rpg', 'fps'],
        status: 'online',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
    
    // 保存用户
    users.push(newUser);
    localStorage.setItem('gamehub_users', JSON.stringify(users));
    
    // 自动登录
    localStorage.setItem('gamehub_current_user', JSON.stringify(newUser));
    
    // 更新UI
    document.getElementById('user-name').textContent = username;
    document.getElementById('user-avatar').textContent = username.charAt(0).toUpperCase();
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('register-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'block';
    
    // 隐藏注册表单，显示首页
    document.getElementById('register-section').style.display = 'none';
    showSection('home-section');
    
    alert('注册成功！欢迎来到GameHub！');
    updateStats();
    loadUserProfile();
}

function logout() {
    localStorage.removeItem('gamehub_current_user');
    document.getElementById('user-name').textContent = '游客';
    document.getElementById('user-avatar').textContent = '?';
    document.getElementById('login-btn').style.display = 'block';
    document.getElementById('register-btn').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'none';
    
    showSection('login-section');
    alert('您已成功退出登录');
}

// ==================== 用户交互功能 ====================
function setupUserEvents() {
    // 好友管理
    document.getElementById('add-friend-btn').addEventListener('click', () => {
        document.getElementById('add-friend-modal').style.display = 'flex';
    });
    
    document.getElementById('send-friend-request').addEventListener('click', sendFriendRequest);
    
    // 论坛
    document.getElementById('new-post-btn').addEventListener('click', () => {
        document.getElementById('new-post-modal').style.display = 'flex';
    });
    
    document.getElementById('submit-post').addEventListener('click', createForumPost);
    
    // 个人资料编辑
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
        document.getElementById('edit-profile-modal').style.display = 'flex';
        loadEditProfileForm();
    });
    
    document.getElementById('save-profile-changes').addEventListener('click', saveProfileChanges);
    
    // 市场功能
    document.querySelectorAll('.market-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.market-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tab = btn.dataset.tab;
            document.getElementById('equipment-grid').style.display = tab === 'buy' ? 'grid' : 'none';
            document.getElementById('sell-form').style.display = tab === 'sell' ? 'block' : 'none';
            document.getElementById('transaction-history').style.display = tab === 'history' ? 'block' : 'none';
            
            if (tab === 'history') {
                loadTransactionHistory();
            }
        });
    });
    
    // 排行榜标签
    document.querySelectorAll('.ranking-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.ranking-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tab = btn.dataset.tab;
            document.getElementById('players-ranking').style.display = tab === 'players' ? 'block' : 'none';
            document.getElementById('games-ranking').style.display = tab === 'games' ? 'block' : 'none';
            document.getElementById('clans-ranking').style.display = tab === 'clans' ? 'block' : 'none';
        });
    });
    
    // 个人资料标签
    document.querySelectorAll('.profile-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.profile-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tab = btn.dataset.tab;
            document.getElementById('info-tab').style.display = tab === 'info' ? 'block' : 'none';
            document.getElementById('games-tab').style.display = tab === 'games' ? 'block' : 'none';
            document.getElementById('activity-tab').style.display = tab === 'activity' ? 'block' : 'none';
            
            if (tab === 'games') {
                loadUserGames();
            } else if (tab === 'activity') {
                loadUserActivity();
            }
        });
    });
    
    // 好友标签
    document.querySelectorAll('.friends-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.friends-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            loadFriends(btn.dataset.tab);
        });
    });
    
    // 论坛分类
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            loadForumPosts(card.dataset.category);
        });
    });
    
    // 关闭弹窗
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // 点击弹窗外部关闭
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // 购买装备
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('buy-btn')) {
            const equipmentId = e.target.dataset.id;
            buyEquipment(equipmentId);
        }
        
        // 接受好友请求
        if (e.target.classList.contains('accept-btn')) {
            const friendId = e.target.dataset.id;
            acceptFriendRequest(friendId);
        }
        
        // 拒绝好友请求
        if (e.target.classList.contains('decline-btn')) {
            const friendId = e.target.dataset.id;
            declineFriendRequest(friendId);
        }
        
        // 接受游戏邀请
        if (e.target.classList.contains('accept-invite')) {
            const inviteId = e.target.dataset.id;
            acceptGameInvite(inviteId);
        }
        
        // 拒绝游戏邀请
        if (e.target.classList.contains('decline-invite')) {
            const inviteId = e.target.dataset.id;
            declineGameInvite(inviteId);
        }
    });
}

// ==================== 数据加载功能 ====================
function loadData() {
    // 加载热门游戏
    loadFeaturedGames();
    
    // 加载推荐内容
    loadRecommendations();
    
    // 加载论坛帖子
    loadForumPosts();
    
    // 加载装备市场
    loadMarket();
}

function loadFeaturedGames() {
    const gamesGrid = document.getElementById('featured-games');
    gamesGrid.innerHTML = '';
    
    const featuredGames = [
        { id: 1, name: '幻境传说', genre: 'RPG', rating: 4.8, img: 'fa-sword' },
        { id: 2, name: '星际争霸', genre: '策略', rating: 4.7, img: 'fa-rocket' },
        { id: 3, name: '极速狂飙', genre: '竞速', rating: 4.5, img: 'fa-car' },
        { id: 4, name: '末日生存', genre: '生存', rating: 4.6, img: 'fa-skull' },
        { id: 5, name: '魔法学院', genre: '模拟', rating: 4.4, img: 'fa-hat-wizard' },
        { id: 6, name: '足球巨星', genre: '体育', rating: 4.3, img: 'fa-futbol' }
    ];
    
    featuredGames.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.innerHTML = `
            <div class="game-card-img">
                <i class="${game.img}"></i>
            </div>
            <div class="game-card-content">
                <div class="game-card-title">${game.name}</div>
                <div class="game-card-meta">
                    <span>${game.genre}</span>
                    <span class="game-card-rating"><i class="fas fa-star"></i> ${game.rating}</span>
                </div>
                <button class="game-card-btn" onclick="viewGameDetails(${game.id})">查看详情</button>
            </div>
        `;
        gamesGrid.appendChild(gameCard);
    });
}

function loadRecommendations() {
    const recommendationsGrid = document.getElementById('recommendations-grid');
    recommendationsGrid.innerHTML = '';
    
    const recommendations = [
        { id: 1, name: '暗影之刃', type: 'new', desc: '全新动作RPG，体验极致战斗', rating: 4.9, img: 'fa-dragon' },
        { id: 2, name: '传奇装备包', type: 'equipment', desc: '包含稀有武器和防具', price: 500, img: 'fa-shield-alt' },
        { id: 3, name: '太空探险家', type: 'trending', desc: '本周最热门的太空探索游戏', rating: 4.7, img: 'fa-space-shuttle' },
        { id: 4, name: '魔法法杖', type: 'equipment', desc: '增加50%魔法伤害的稀有法杖', price: 800, img: 'fa-magic' },
        { id: 5, name: '赛车冠军', type: 'new', desc: '全新赛车游戏，支持多人联机', rating: 4.6, img: 'fa-flag-checkered' },
        { id: 6, name: '生存工具包', type: 'equipment', desc: '包含各种生存必备装备', price: 300, img: 'fa-toolbox' }
    ];
    
    recommendations.forEach(item => {
        const tagText = item.type === 'new' ? '新游戏' : 
                       item.type === 'equipment' ? '新装备' : '热门';
                       
        const recommendationCard = document.createElement('div');
        recommendationCard.className = 'recommendation-card';
        recommendationCard.innerHTML = `
            <div class="recommendation-img">
                <i class="${item.img}"></i>
                <div class="recommendation-tag">${tagText}</div>
            </div>
            <div class="recommendation-content">
                <div class="recommendation-title">
                    <span>${item.name}</span>
                    <i class="fas fa-heart${item.type === 'equipment' ? '' : '-alt'}"></i>
                </div>
                <div class="recommendation-desc">${item.desc}</div>
                <div class="recommendation-meta">
                    ${item.type === 'equipment' ? 
                        `<span><i class="fas fa-coins"></i> ${item.price} 积分</span>` : 
                        `<span><i class="fas fa-star"></i> ${item.rating}</span>`}
                    <span>${item.type === 'equipment' ? '装备' : '游戏'}</span>
                </div>
            </div>
        `;
        recommendationsGrid.appendChild(recommendationCard);
    });
}

function loadFriends(tab = 'online') {
    const friendsList = document.getElementById('friends-list');
    friendsList.innerHTML = '';
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // 模拟好友数据
    const allFriends = [
        { id: 1, name: '游戏达人', status: 'online', avatar: 'G', games: ['幻境传说', '星际争霸'] },
        { id: 2, name: '冒险王', status: 'online', avatar: 'A', games: ['末日生存', '魔法学院'] },
        { id: 3, name: '电竞高手', status: 'offline', avatar: 'E', games: ['极速狂飙', '足球巨星'] },
        { id: 4, name: '策略大师', status: 'busy', avatar: 'S', games: ['星际争霸', '魔法学院'] },
        { id: 5, name: '新手玩家', status: 'online', avatar: 'N', games: ['幻境传说'] },
        { id: 6, name: '装备收藏家', status: 'away', avatar: 'C', games: ['末日生存', '极速狂飙'] }
    ];
    
    // 过滤好友
    let filteredFriends = allFriends;
    if (tab === 'online') {
        filteredFriends = allFriends.filter(f => f.status === 'online');
    }
    
    // 更新计数
    document.getElementById('online-count').textContent = allFriends.filter(f => f.status === 'online').length;
    document.getElementById('all-friends-count').textContent = allFriends.length;
    document.getElementById('requests-count').textContent = '2';
    
    // 显示好友
    filteredFriends.forEach(friend => {
        const statusClass = friend.status === 'online' ? 'online' : 'offline';
        const statusText = friend.status === 'online' ? '在线' : 
                          friend.status === 'busy' ? '忙碌中' : 
                          friend.status === 'away' ? '离开' : '离线';
        
        const friendCard = document.createElement('div');
        friendCard.className = 'friend-card';
        friendCard.innerHTML = `
            <div class="friend-avatar">${friend.avatar}</div>
            <div class="friend-info">
                <div class="friend-name">${friend.name}</div>
                <div class="friend-status ${statusClass}">${statusText}</div>
            </div>
            <div class="friend-actions">
                <button class="friend-btn invite" title="邀请游戏"><i class="fas fa-gamepad"></i></button>
                <button class="friend-btn remove" title="移除好友"><i class="fas fa-user-minus"></i></button>
            </div>
        `;
        friendsList.appendChild(friendCard);
    });
    
    // 加载游戏邀请
    loadGameInvites();
}

function loadGameInvites() {
    const invitesContainer = document.querySelector('.invites-container');
    invitesContainer.innerHTML = '';
    
    const invites = [
        { id: 1, game: '幻境传说', from: '游戏达人', time: '10分钟前' },
        { id: 2, game: '星际争霸', from: '策略大师', time: '30分钟前' }
    ];
    
    invites.forEach(invite => {
        const inviteCard = document.createElement('div');
        inviteCard.className = 'invite-card';
        inviteCard.innerHTML = `
            <div class="invite-game">${invite.game}</div>
            <div class="invite-from">来自 ${invite.from} · ${invite.time}</div>
            <div class="invite-actions">
                <button class="invite-btn accept" data-id="${invite.id}">接受</button>
                <button class="invite-btn decline" data-id="${invite.id}">拒绝</button>
            </div>
        `;
        invitesContainer.appendChild(inviteCard);
    });
}

function loadMarket() {
    const equipmentGrid = document.getElementById('equipment-grid');
    equipmentGrid.innerHTML = '';
    
    const equipmentItems = [
        { id: 1, name: '传说之剑', price: 800, desc: '增加攻击力150%，稀有度：传说', img: 'fa-sword' },
        { id: 2, name: '守护者盾牌', price: 600, desc: '增加防御力120%，稀有度：史诗', img: 'fa-shield-alt' },
        { id: 3, name: '迅捷之靴', price: 300, desc: '增加移动速度50%，稀有度：稀有', img: 'fa-shoe-prints' },
        { id: 4, name: '智慧法杖', price: 700, desc: '增加魔法伤害200%，稀有度：传说', img: 'fa-magic' },
        { id: 5, name: '生命药水', price: 50, desc: '立即恢复50%生命值，稀有度：普通', img: 'fa-heart' },
        { id: 6, name: '隐身斗篷', price: 450, desc: '10秒内隐身，稀有度：史诗', img: 'fa-vest' }
    ];
    
    equipmentItems.forEach(item => {
        const equipmentCard = document.createElement('div');
        equipmentCard.className = 'equipment-card';
        equipmentCard.innerHTML = `
            <div class="equipment-img">
                <i class="${item.img}"></i>
            </div>
            <div class="equipment-content">
                <div class="equipment-name">${item.name}</div>
                <span class="equipment-price"><i class="fas fa-coins"></i> ${item.price} 积分</span>
                <div class="equipment-desc">${item.desc}</div>
                <div class="equipment-actions">
                    <button class="buy-btn" data-id="${item.id}">购买</button>
                    <button class="buy-btn sell-btn">收藏</button>
                </div>
            </div>
        `;
        equipmentGrid.appendChild(equipmentCard);
    });
    
    // 更新用户积分显示
    const currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById('user-points').textContent = currentUser.points;
    }
}

function loadRankings() {
    // 玩家排行榜
    const playersTableBody = document.getElementById('players-table-body');
    playersTableBody.innerHTML = '';
    
    const players = [
        { rank: 1, name: '电竞王者', level: 50, points: 15000, winRate: '85%' },
        { rank: 2, name: '游戏达人', level: 48, points: 14200, winRate: '82%' },
        { rank: 3, name: '冒险王', level: 45, points: 13500, winRate: '78%' },
        { rank: 4, name: '策略大师', level: 42, points: 12800, winRate: '75%' },
        { rank: 5, name: '新手玩家', level: 30, points: 9500, winRate: '65%' }
    ];
    
    players.forEach(player => {
        const rankClass = player.rank <= 3 ? `rank-${player.rank}` : '';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="rank-badge ${rankClass}">${player.rank}</span></td>
            <td>${player.name}</td>
            <td>${player.level}</td>
            <td>${player.points}</td>
            <td>${player.winRate}</td>
        `;
        playersTableBody.appendChild(row);
    });
    
    // 游戏排行榜
    const gamesTableBody = document.getElementById('games-table-body');
    gamesTableBody.innerHTML = '';
    
    const games = [
        { rank: 1, name: '幻境传说', players: 150000, rating: 4.8, genre: 'RPG' },
        { rank: 2, name: '星际争霸', players: 120000, rating: 4.7, genre: '策略' },
        { rank: 3, name: '极速狂飙', players: 95000, rating: 4.6, genre: '竞速' },
        { rank: 4, name: '末日生存', players: 85000, rating: 4.5, genre: '生存' },
        { rank: 5, name: '魔法学院', players: 75000, rating: 4.4, genre: '模拟' }
    ];
    
    games.forEach(game => {
        const rankClass = game.rank <= 3 ? `rank-${game.rank}` : '';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="rank-badge ${rankClass}">${game.rank}</span></td>
            <td>${game.name}</td>
            <td>${game.players.toLocaleString()}</td>
            <td>${game.rating}</td>
            <td>${game.genre}</td>
        `;
        gamesTableBody.appendChild(row);
    });
    
    // 战队排行榜
    const clansTableBody = document.getElementById('clans-table-body');
    clansTableBody.innerHTML = '';
    
    const clans = [
        { rank: 1, name: '龙之队', members: 50, wins: 320, points: 15000 },
        { rank: 2, name: '凤凰战队', members: 45, wins: 290, points: 14200 },
        { rank: 3, name: '猛虎联盟', members: 48, wins: 275, points: 13500 },
        { rank: 4, name: '猎鹰小队', members: 42, wins: 250, points: 12800 },
        { rank: 5, name: '新星战队', members: 35, wins: 180, points: 9500 }
    ];
    
    clans.forEach(clan => {
        const rankClass = clan.rank <= 3 ? `rank-${clan.rank}` : '';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="rank-badge ${rankClass}">${clan.rank}</span></td>
            <td>${clan.name}</td>
            <td>${clan.members}</td>
            <td>${clan.wins}</td>
            <td>${clan.points}</td>
        `;
        clansTableBody.appendChild(row);
    });
}

function loadForumPosts(category = 'all') {
    const forumPosts = document.getElementById('forum-posts');
    forumPosts.innerHTML = '';
    
    // 更新分类计数
    document.getElementById('all-posts-count').textContent = '24';
    document.getElementById('strategy-count').textContent = '8';
    document.getElementById('feedback-count').textContent = '6';
    document.getElementById('offtopic-count').textContent = '10';
    
    // 模拟帖子数据
    const posts = [
        { id: 1, title: '幻境传说终极攻略', category: 'strategy', author: '游戏达人', time: '2小时前', content: '分享一些高级技巧和隐藏任务...', likes: 45, comments: 12 },
        { id: 2, title: '新装备平衡性问题', category: 'feedback', author: '电竞高手', time: '5小时前', content: '最近更新的装备太强了，建议调整...', likes: 38, comments: 25 },
        { id: 3, title: '周末游戏聚会', category: 'offtopic', author: '冒险王', time: '昨天', content: '这周末有人一起开黑吗？', likes: 27, comments: 31 },
        { id: 4, title: '星际争霸新手指南', category: 'strategy', author: '策略大师', time: '3天前', content: '给新手玩家的一些基础建议...', likes: 52, comments: 18 },
        { id: 5, title: '服务器延迟问题', category: 'feedback', author: '新手玩家', time: '1天前', content: '最近服务器延迟严重，希望能优化...', likes: 63, comments: 42 },
        { id: 6, title: '分享我的游戏收藏', category: 'offtopic', author: '装备收藏家', time: '2天前', content: '晒一晒我收集的稀有装备...', likes: 35, comments: 28 }
    ];
    
    // 过滤帖子
    const filteredPosts = category === 'all' ? posts : posts.filter(p => p.category === category);
    
    filteredPosts.forEach(post => {
        const categoryClass = post.category;
        const categoryText = post.category === 'strategy' ? '攻略' : 
                            post.category === 'feedback' ? '反馈' : '闲聊';
        
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.innerHTML = `
            <div class="post-header">
                <a href="#" class="post-title">${post.title}</a>
                <span class="post-category ${categoryClass}">${categoryText}</span>
            </div>
            <div class="post-meta">
                <span><i class="fas fa-user"></i> ${post.author}</span>
                <span><i class="fas fa-clock"></i> ${post.time}</span>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-footer">
                <div class="post-stats">
                    <span><i class="fas fa-heart"></i> ${post.likes}</span>
                    <span><i class="fas fa-comment"></i> ${post.comments}</span>
                </div>
                <button class="btn secondary-btn">回复</button>
            </div>
        `;
        forumPosts.appendChild(postCard);
    });
}

function loadUserProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // 更新个人资料信息
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-role').textContent = currentUser.role === 'admin' ? '游戏管理者' : '玩家';
    document.getElementById('profile-level').textContent = currentUser.level;
    document.getElementById('profile-points').textContent = currentUser.points;
    document.getElementById('profile-friends').textContent = currentUser.friends.length;
    
    document.getElementById('info-username').textContent = currentUser.username;
    document.getElementById('info-email').textContent = currentUser.email;
    document.getElementById('info-preferences').textContent = currentUser.preferences.map(p => {
        const prefs = { rpg: 'RPG', fps: 'FPS', strategy: '策略', simulation: '模拟', sports: '体育', racing: '竞速' };
        return prefs[p] || p;
    }).join(', ');
    document.getElementById('info-status').textContent = currentUser.status === 'online' ? '在线' : 
                                                        currentUser.status === 'busy' ? '忙碌' : 
                                                        currentUser.status === 'away' ? '离开' : '离线';
    
    // 更新头像
    document.getElementById('avatar-preview').textContent = currentUser.username.charAt(0).toUpperCase();
}

function loadUserGames() {
    const userGamesGrid = document.getElementById('user-games-grid');
    userGamesGrid.innerHTML = '';
    
    // 模拟用户游戏数据
    const userGames = [
        { name: '幻境传说', hours: 120, icon: 'fa-sword' },
        { name: '星际争霸', hours: 85, icon: 'fa-rocket' },
        { name: '末日生存', hours: 65, icon: 'fa-skull' },
        { name: '魔法学院', hours: 45, icon: 'fa-hat-wizard' }
    ];
    
    userGames.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'user-game-card';
        gameCard.innerHTML = `
            <div class="user-game-icon">
                <i class="${game.icon}"></i>
            </div>
            <div class="user-game-name">${game.name}</div>
            <div class="user-game-hours">${game.hours} 小时</div>
        `;
        userGamesGrid.appendChild(gameCard);
    });
}

function loadUserActivity() {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
    // 模拟活动数据
    const activities = [
        { icon: 'fa-gamepad', title: '开始玩 幻境传说', time: '2小时前' },
        { icon: 'fa-user-plus', title: '添加了好友 游戏达人', time: '5小时前' },
        { icon: 'fa-shopping-cart', title: '购买了装备 传说之剑', time: '昨天' },
        { icon: 'fa-trophy', title: '在 幻境传说 中达到等级 25', time: '2天前' },
        { icon: 'fa-comments', title: '在论坛发布了新帖子', time: '3天前' }
    ];
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

function loadTransactionHistory() {
    const historyTableBody = document.getElementById('history-table-body');
    historyTableBody.innerHTML = '';
    
    // 模拟交易历史
    const transactions = [
        { date: '2023-06-15', type: '购买', item: '传说之剑', price: 800, status: 'completed' },
        { date: '2023-06-14', type: '出售', item: '生命药水', price: 30, status: 'completed' },
        { date: '2023-06-12', type: '购买', item: '守护者盾牌', price: 600, status: 'completed' },
        { date: '2023-06-10', type: '购买', item: '迅捷之靴', price: 300, status: 'cancelled' }
    ];
    
    transactions.forEach(transaction => {
        const statusClass = transaction.status === 'completed' ? 'status-completed' : 
                           transaction.status === 'pending' ? 'status-pending' : 'status-cancelled';
        const statusText = transaction.status === 'completed' ? '已完成' : 
                          transaction.status === 'pending' ? '处理中' : '已取消';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.type}</td>
            <td>${transaction.item}</td>
            <td>${transaction.price} 积分</td>
            <td class="${statusClass}">${statusText}</td>
        `;
        historyTableBody.appendChild(row);
    });
}

function loadEditProfileForm() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    document.getElementById('edit-email').value = currentUser.email || '';
    
    // 设置游戏偏好
    const preferencesSelect = document.getElementById('edit-preferences');
    currentUser.preferences.forEach(pref => {
        Array.from(preferencesSelect.options).forEach(option => {
            if (option.value === pref) {
                option.selected = true;
            }
        });
    });
    
    // 设置状态
    document.getElementById('edit-status').value = currentUser.status || 'online';
}

// ==================== 辅助函数 ====================
function showSection(sectionId) {
    // 隐藏所有内容区域
    document.querySelectorAll('.content-section, .auth-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // 显示指定区域
    document.getElementById(sectionId).style.display = 'block';
    
    // 更新导航高亮
    if (sectionId === 'home-section') {
        setActiveLink('home-link');
    } else if (sectionId === 'recommend-section') {
        setActiveLink('recommend-link');
    } else if (sectionId === 'friends-section') {
        setActiveLink('friends-link');
    } else if (sectionId === 'market-section') {
        setActiveLink('market-link');
    } else if (sectionId === 'ranking-section') {
        setActiveLink('ranking-link');
    } else if (sectionId === 'forum-section') {
        setActiveLink('forum-link');
    } else if (sectionId === 'profile-section') {
        // 个人资料页面不改变导航高亮
    }
}

function setActiveLink(linkId) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById(linkId).classList.add('active');
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('gamehub_current_user'));
}

function updateStats() {
    // 模拟统计数据
    document.getElementById('total-users').textContent = '15,243';
    document.getElementById('total-games').textContent = '1,256';
    document.getElementById('active-tournaments').textContent = '42';
    document.getElementById('forum-posts').textContent = '8,765';
}

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ==================== 业务逻辑函数 ====================
function sendFriendRequest() {
    const friendUsername = document.getElementById('friend-username').value.trim();
    if (!friendUsername) {
        alert('请输入玩家账号或ID');
        return;
    }
    
    alert(`已向 ${friendUsername} 发送好友请求！`);
    document.getElementById('add-friend-modal').style.display = 'none';
    document.getElementById('friend-username').value = '';
}

function createForumPost() {
    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const content = document.getElementById('post-content').value.trim();
    
    if (!title || !content) {
        alert('请填写标题和内容');
        return;
    }
    
    alert('帖子发布成功！');
    document.getElementById('new-post-modal').style.display = 'none';
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    
    // 重新加载论坛帖子
    loadForumPosts();
}

function saveProfileChanges() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // 获取表单数据
    const newEmail = document.getElementById('edit-email').value.trim();
    const preferences = Array.from(document.getElementById('edit-preferences').selectedOptions).map(opt => opt.value);
    const status = document.getElementById('edit-status').value;
    
    // 更新用户数据
    currentUser.email = newEmail || currentUser.email;
    currentUser.preferences = preferences.length > 0 ? preferences : currentUser.preferences;
    currentUser.status = status;
    
    // 保存到localStorage
    const users = JSON.parse(localStorage.getItem('gamehub_users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('gamehub_users', JSON.stringify(users));
    }
    
    localStorage.setItem('gamehub_current_user', JSON.stringify(currentUser));
    
    // 更新UI
    document.getElementById('info-email').textContent = currentUser.email;
    document.getElementById('info-preferences').textContent = currentUser.preferences.map(p => {
        const prefs = { rpg: 'RPG', fps: 'FPS', strategy: '策略', simulation: '模拟', sports: '体育', racing: '竞速' };
        return prefs[p] || p;
    }).join(', ');
    document.getElementById('info-status').textContent = currentUser.status === 'online' ? '在线' : 
                                                        currentUser.status === 'busy' ? '忙碌' : 
                                                        currentUser.status === 'away' ? '离开' : '离线';
    
    // 关闭弹窗
    document.getElementById('edit-profile-modal').style.display = 'none';
    
    alert('个人资料更新成功！');
}

function buyEquipment(equipmentId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('请先登录');
        showSection('login-section');
        return;
    }
    
    // 模拟装备价格
    const equipmentPrices = {
        1: 800,
        2: 600,
        3: 300,
        4: 700,
        5: 50,
        6: 450
    };
    
    const price = equipmentPrices[equipmentId] || 0;
    
    if (currentUser.points < price) {
        alert('积分不足，无法购买此装备！');
        return;
    }
    
    // 扣除积分
    currentUser.points -= price;
    
    // 保存用户数据
    const users = JSON.parse(localStorage.getItem('gamehub_users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('gamehub_users', JSON.stringify(users));
    }
    
    localStorage.setItem('gamehub_current_user', JSON.stringify(currentUser));
    
    // 更新UI
    document.getElementById('user-points').textContent = currentUser.points;
    document.getElementById('profile-points').textContent = currentUser.points;
    
    alert(`购买成功！已扣除 ${price} 积分`);
}

function acceptFriendRequest(friendId) {
    alert('已接受好友请求');
    loadFriends();
}

function declineFriendRequest(friendId) {
    alert('已拒绝好友请求');
    loadFriends();
}

function acceptGameInvite(inviteId) {
    alert('已接受游戏邀请，即将加入游戏');
    loadGameInvites();
}

function declineGameInvite(inviteId) {
    alert('已拒绝游戏邀请');
    loadGameInvites();
}

function viewGameDetails(gameId) {
    alert(`查看游戏详情: ${gameId}`);
}
