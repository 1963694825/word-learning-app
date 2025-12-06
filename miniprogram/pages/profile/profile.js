// pages/profile/profile.js
const { logout, isLoggedIn } = require('../../utils/auth');

const app = getApp();

Page({
  data: {
    userInfo: null
  },

  onShow() {
    // 检查登录状态
    if (isLoggedIn()) {
      const userInfo = app.globalData.userInfo;
      console.log('Profile页面 - globalData.userInfo:', userInfo);
      console.log('Profile页面 - 头像URL:', userInfo?.avatar_url);
      console.log('Profile页面 - 昵称:', userInfo?.nickname);

      this.setData({
        userInfo: userInfo
      });
    } else {
      // 未登录,清空userInfo
      this.setData({
        userInfo: null
      });
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
          // 清空当前页面的userInfo
          this.setData({
            userInfo: null
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