// app.js
App({
    globalData: {
        userInfo: null,
        token: null,
        apiBase: 'http://localhost:3000/api/v1'
    },

    onLaunch() {
        // 小程序启动时执行
        console.log('小程序启动');

        // 尝试从本地存储获取token
        const token = wx.getStorageSync('token');
        if (token) {
            this.globalData.token = token;
        }
    },

    onShow() {
        // 小程序显示时执行
    },

    onHide() {
        // 小程序隐藏时执行
    }
});
