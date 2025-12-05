// pages/wordbook/wordbook.js
const { get, post } = require('../../utils/request');

Page({
  data: {
    wordbooks: [],
    loading: true
  },

  onShow() {
    this.loadWordbooks();
  },

  async loadWordbooks() {
    this.setData({ loading: true });

    try {
      const res = await get('/wordbooks', {}, true);

      if (res.code === 200) {
        this.setData({
          wordbooks: res.data,
          loading: false
        });
      }
    } catch (error) {
      console.error('加载失败:', error);
      this.setData({ loading: false });
    }
  },

  createWordbook() {
    wx.showModal({
      title: '创建生词本',
      editable: true,
      placeholderText: '请输入生词本名称',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            const result = await post('/wordbooks', {
              name: res.content,
              description: '我的生词本'
            }, true);

            if (result.code === 200) {
              wx.showToast({
                title: '创建成功',
                icon: 'success'
              });
              this.loadWordbooks();
            }
          } catch (error) {
            wx.showToast({
              title: '创建失败',
              icon: 'none'
            });
          }
        }
      }
    });
  }
});