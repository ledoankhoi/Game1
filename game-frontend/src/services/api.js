const BASE_URL = '/api';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
    }
    return data;
}

export const api = {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export const endpoints = {
    // Auth
    register: '/auth/register',
    login: '/auth/login',
    googleLogin: '/auth/google-login',
    facebookLogin: '/auth/facebook-login',
    profile: '/auth/profile',
    updateScore: '/auth/update-score',
    updateAvatar: '/auth/update-avatar',
    updateUsername: '/auth/update-username',
    toggleFavorite: '/auth/toggle-favorite',
    submitFeedback: '/auth/feedback',
    claimQuest: '/auth/claim-quest',
    equipBadge: '/auth/equip-badge',
    updateSettings: '/auth/update-settings',
    getUserInfo: '/auth/info',

    // Game
    gameList: '/game/list',
    gameInfo: (slug) => `/game/info/${slug}`,
    gameInstructions: (slug) => `/game/instructions/${slug}`,
    saveResult: '/game/save-result',
    gameHistory: '/game/history',
    playGame: (slug) => `/game/${slug}/play`,
    recommendations: '/game/recommendations',

    // Leaderboard
    leaderboardExp: '/game/leaderboard/exp',
    leaderboardScore: '/game/leaderboard/score',
    leaderboardGame: (gameId) => `/game/leaderboard/game/${gameId}`,
    leaderboardCategory: (category) => `/game/leaderboard/category/${category}`,

    // Shop
    shopItems: '/shop/items',
    shopBuy: '/shop/buy',
    shopEquip: '/shop/equip',

    // Quest
    questList: '/quest/list',
    questClaim: '/quest/claim',

    // Achievement
    achievementList: '/achievement/list',

    // Social - Friends
    friendList: '/friends/list',
    friendRequests: '/friends/requests',
    friendRequest: '/friends/request',
    friendAccept: '/friends/accept',
    friendReject: '/friends/reject',
    friendRemove: '/friends/remove',

    // Social - Guilds
    guildCreate: '/guilds/create',
    guildMy: '/guilds/my',
    guildList: '/guilds/list',
    guildInfo: (id) => `/guilds/${id}`,
    guildJoin: (id) => `/guilds/${id}/join`,
    guildLeave: (id) => `/guilds/${id}/leave`,
    guildKick: (id) => `/guilds/${id}/kick`,
    guildPromote: (id) => `/guilds/${id}/promote`,
    guildLeaderboard: '/guilds/leaderboard',

    // Social - Messages
    messagesConversation: (userId) => `/messages/${userId}`,
    messagesGuild: (guildId) => `/messages/guild/${guildId}`,

    // Social - Profile
    publicProfile: (username) => `/profile/${username}`,

    // Admin
    adminUsers: '/admin/users',
    adminGames: '/admin/games',
    adminItems: '/admin/items',
};
