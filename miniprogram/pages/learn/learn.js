// pages/learn/learn.js
Page({
    data: {
        words: [],
        currentIndex: 0,
        showAnswer: false
    },

    onLoad() {
        // 页面加载时获取学习任务
        wx.showToast({ title: '学习页面开发中', icon: 'none' });
    }
});
