// pages/index/index.js
const { get } = require('../../utils/request');
const { login, isLoggedIn } = require('../../utils/auth');

Page({
    data: {
        userInfo: null,
        stats: {
            todayWords: 0,
            totalWords: 0,
            continuousDays: 0
        },
        todayTask: {
            review: [],
            new: [],
            total: 0
        },
        loading: true
    },

    onLoad() {
        this.checkLogin();
    },

    onShow() {
        if (isLoggedIn()) {
            this.loadData();
        }
    },

    // 下拉刷新
    onPullDownRefresh() {
        this.loadData(true);
    },

    // 检查登录状态
    async checkLogin() {
        if (!isLoggedIn()) {
            // 自动登录(测试用)
            const result = await login('testuser', '123456');
            if (result.success) {
                this.setData({ userInfo: result.data.user });
                this.loadData();
            } else {
                wx.showToast({ title: '登录失败', icon: 'none' });
            }
        } else {
            this.loadData();
        }
    },

    // 加载数据
    async loadData(refresh = false) {
        this.setData({ loading: true });

        try {
            // 获取统计数据
            const statsRes = await get('/stats/overview', {}, true);
            if (statsRes.code === 200) {
                this.setData({
                    stats: {
                        todayWords: statsRes.data.stats.today_words || 0,
                        totalWords: statsRes.data.stats.total_words || 0,
                        continuousDays: statsRes.data.stats.continuous_days || 0
                    }
                });
            }

            // 获取今日任务
            const taskRes = await get('/learn/daily-task?bookId=1&limit=10', {}, true);
            if (taskRes.code === 200) {
                this.setData({
                    todayTask: taskRes.data
                });
            }

            if (refresh) {
                wx.showToast({ title: '刷新成功', icon: 'success' });
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            wx.showToast({ title: '加载失败,请重试', icon: 'none' });
        } finally {
            this.setData({ loading: false });
            if (refresh) {
                wx.stopPullDownRefresh();
            }
        }
    },

    // 开始学习
    startLearning() {
        if (this.data.todayTask.total > 0) {
            wx.navigateTo({
                url: '/pages/learn/learn'
            });
        } else {
            wx.showToast({
                title: '暂无学习任务',
                icon: 'none'
            });
        }
    },

    // 开始测试
    startTest() {
        wx.navigateTo({
            url: '/pages/test/test'
        });
    }
});
