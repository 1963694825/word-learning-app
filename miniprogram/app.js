// app.js
App({
    globalData: {
        userInfo: null,
        token: null,
        apiBase: 'http://192.168.1.4:3000/api/v1'
    },

    onLaunch() {
        // 小程序启动时执行
        console.log('小程序启动');

        // 尝试从本地存储获取token和用户信息
        const token = wx.getStorageSync('token');
        const userInfo = wx.getStorageSync('userInfo');

        if (token) {
            this.globalData.token = token;
        }

        if (userInfo) {
            this.globalData.userInfo = userInfo;
        }

        console.log('加载的用户信息:', userInfo);
    },

    onShow() {
        // 小程序显示时执行
    },

    onHide() {
        // 小程序隐藏时执行
    }
});
