// pages/profile/profile.js
const { logout, isLoggedIn } = require('../../utils/auth');
const { get } = require('../../utils/request');

const app = getApp();

Page({
  data: {
    userInfo: null,
    stats: {
      todayWords: 0,
      totalWords: 0,
      continuousDays: 0
    }
  },

  onShow() {
    // 检查登录状态
    if (isLoggedIn()) {
      const userInfo = app.globalData.userInfo;
      console.log('Profile页面 - globalData.userInfo:', userInfo);

      this.setData({
        userInfo: userInfo
      });

      // 加载学习统计数据
      this.loadStats();
    } else {
      // 未登录,清空userInfo
      this.setData({
        userInfo: null,
        stats: {
          todayWords: 0,
          totalWords: 0,
          continuousDays: 0
        }
      });
    }
  },

  // 加载学习统计
  async loadStats() {
    try {
      const res = await get('/stats/overview', {}, true);
      if (res.code === 200) {
        this.setData({
          stats: {
            todayWords: res.data.stats.today_words || 0,
            totalWords: res.data.stats.total_words || 0,
            continuousDays: res.data.stats.continuous_days || 0
          }
        });
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  },

  // 跳转到登录页
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗?',
      success: (res) => {
        if (res.confirm) {
          logout();
          // 清空当前页面的userInfo和stats
          this.setData({
            userInfo: null,
            stats: {
              todayWords: 0,
              totalWords: 0,
              continuousDays: 0
            }
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  }
});