// 网络请求封装
const app = getApp();

/**
 * 发起网络请求
 * @param {string} url - 请求路径
 * @param {string} method - 请求方法
 * @param {object} data - 请求数据
 * @param {boolean} needAuth - 是否需要认证
 */
function request(url, method = 'GET', data = {}, needAuth = false) {
    return new Promise((resolve, reject) => {
        const header = {
            'Content-Type': 'application/json'
        };

        // 添加认证token
        if (needAuth && app.globalData.token) {
            header['Authorization'] = `Bearer ${app.globalData.token}`;
        }

        wx.request({
            url: `${app.globalData.apiBase}${url}`,
            method,
            data,
            header,
            success(res) {
                if (res.statusCode === 200) {
                    resolve(res.data);
                } else {
                    reject(res.data);
                }
            },
            fail(err) {
                reject(err);
            }
        });
    });
}

// 便捷方法
function get(url, data = {}, needAuth = false) {
    return request(url, 'GET', data, needAuth);
}

function post(url, data = {}, needAuth = false) {
    return request(url, 'POST', data, needAuth);
}

module.exports = {
    request,
    get,
    post
};
