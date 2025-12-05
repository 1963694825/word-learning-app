// 认证工具
const { post, get } = require('./request');
const { setStorage, getStorage, removeStorage } = require('./storage');

const app = getApp();

/**
 * 用户登录
 */
async function login(username, password) {
    try {
        const res = await post('/auth/login', { username, password });

        if (res.code === 200 && res.data.token) {
            // 保存token
            app.globalData.token = res.data.token;
            setStorage('token', res.data.token);

            // 保存用户信息
            app.globalData.userInfo = res.data.user;
            setStorage('userInfo', res.data.user);

            return { success: true, data: res.data };
        } else {
            return { success: false, message: res.message };
        }
    } catch (error) {
        return { success: false, message: '登录失败' };
    }
}

/**
 * 获取用户信息
 */
async function getProfile() {
    try {
        const res = await get('/auth/profile', {}, true);

        if (res.code === 200) {
            app.globalData.userInfo = res.data;
            setStorage('userInfo', res.data);
            return { success: true, data: res.data };
        } else {
            return { success: false, message: res.message };
        }
    } catch (error) {
        return { success: false, message: '获取用户信息失败' };
    }
}

/**
 * 退出登录
 */
function logout() {
    app.globalData.token = null;
    app.globalData.userInfo = null;
    removeStorage('token');
    removeStorage('userInfo');
}

/**
 * 检查是否已登录
 */
function isLoggedIn() {
    return !!app.globalData.token;
}

module.exports = {
    login,
    getProfile,
    logout,
    isLoggedIn
};
