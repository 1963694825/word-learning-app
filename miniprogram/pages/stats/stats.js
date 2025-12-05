// pages/stats/stats.js
const { get } = require('../../utils/request');

Page({
  data: {
    stats: null,
    loading: true
  },

  onShow() {
    this.loadStats();
  },

  onPullDownRefresh() {
    this.loadStats(true);
  },

  async loadStats() {
    this.setData({ loading: true });

    try {
      const res = await get('/stats/overview', {}, true);

      if (res.code === 200) {
        this.setData({
          stats: res.data.stats,
          loading: false
        });
      }
    } catch (error) {
      console.error('加载失败:', error);
      this.setData({ loading: false });
    }
  }
});