// pages/profile/profile.js
const { logout } = require('../../utils/auth');

const app = getApp();

Page({
  data: {
    userInfo: null
  },

  onShow() {
    const userInfo = app.globalData.userInfo;
    console.log('Profile页面 - globalData.userInfo:', userInfo);
    console.log('Profile页面 - 头像URL:', userInfo?.avatar_url);
    console.log('Profile页面 - 昵称:', userInfo?.nickname);

    this.setData({
      userInfo: userInfo
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