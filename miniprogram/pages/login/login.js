// pages/login/login.js
const { post } = require('../../utils/request');

Page({
    data: {
        loading: false
    },

    /**
     * 微信授权登录
     */
    async handleWxLogin() {
        try {
            this.setData({ loading: true });

            // 1. 先获取用户信息(必须在点击事件中直接调用)
            const userInfoRes = await wx.getUserProfile({
                desc: '用于完善用户资料'
            });

            console.log('获取到用户信息:', userInfoRes.userInfo);

            // 2. 再获取微信登录凭证code
            const loginRes = await wx.login();
            if (!loginRes.code) {
                throw new Error('获取登录凭证失败');
            }

            console.log('获取到code:', loginRes.code);

            // 3. 发送到后端登录
            const res = await post('/auth/wx-login', {
                code: loginRes.code,
                userInfo: userInfoRes.userInfo
            }, false);

            if (res.code === 200) {
                // 保存token和用户信息
                const app = getApp();
                app.globalData.token = res.data.token;
                app.globalData.userInfo = res.data.user;

                wx.setStorageSync('token', res.data.token);
                wx.setStorageSync('userInfo', res.data.user);

                wx.showToast({
                    title: '登录成功',
                    icon: 'success',
                    duration: 1500
                });

                // 延迟跳转到首页
                setTimeout(() => {
                    wx.switchTab({
                        url: '/pages/index/index'
                    });
                }, 1500);
            } else {
                throw new Error(res.message || '登录失败');
            }
        } catch (error) {
            console.error('登录失败:', error);

            let errorMsg = '登录失败';
            if (error.errMsg && error.errMsg.includes('getUserProfile:fail auth deny')) {
                errorMsg = '您取消了授权';
            } else if (error.message) {
                errorMsg = error.message;
            }

            wx.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 2000
            });
        } finally {
            this.setData({ loading: false });
        }
    }
});
