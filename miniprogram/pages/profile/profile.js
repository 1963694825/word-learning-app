// pages/profile/profile.js
const { logout } = require('../../utils/auth');

const app = getApp();

Page({
  data: {
    userInfo: null
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo
    });
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗?',
      success: (res) => {
        if (res.confirm) {
          logout();
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }
      }
    });
  }
});