// pages/login/login.js
const { post } = require('../../utils/request');

Page({
    data: {
        loading: false,
        showUserInfo: false,
        code: '',
        avatarUrl: '',
        nickname: ''
    },

    /**
     * 微信授权登录 - 第一步:获取code
     */
    async handleWxLogin() {
        try {
            this.setData({ loading: true });

            // 获取微信登录凭证code
            const loginRes = await wx.login();
            if (!loginRes.code) {
                throw new Error('获取登录凭证失败');
            }

            console.log('获取到code:', loginRes.code);

            // 保存code,显示用户信息填写界面
            this.setData({
                code: loginRes.code,
                showUserInfo: true,
                loading: false
            });

        } catch (error) {
            console.error('获取code失败:', error);
            wx.showToast({
                title: '登录失败',
                icon: 'none',
                duration: 2000
            });
            this.setData({ loading: false });
        }
    },

    /**
     * 选择头像
     */
    onChooseAvatar(e) {
        const { avatarUrl } = e.detail;
        console.log('选择的头像:', avatarUrl);
        this.setData({
            avatarUrl: avatarUrl
        });
    },

    /**
     * 输入昵称
     */
    onNicknameChange(e) {
        const nickname = e.detail.value;
        console.log('输入的昵称:', nickname);
        this.setData({
            nickname: nickname
        });
    },

    /**
     * 确认信息并登录 - 第二步:提交到后端
     */
    async handleConfirmInfo() {
        try {
            this.setData({ loading: true });

            const { code, avatarUrl, nickname } = this.data;

            // 发送到后端登录
            const res = await post('/auth/wx-login', {
                code: code,
                userInfo: {
                    avatarUrl: avatarUrl,
                    nickName: nickname
                }
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

            wx.showToast({
                title: error.message || '登录失败',
                icon: 'none',
                duration: 2000
            });
        } finally {
            this.setData({ loading: false });
        }
    }
});
