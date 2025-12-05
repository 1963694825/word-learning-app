// 本地存储封装

/**
 * 保存数据到本地存储
 */
function setStorage(key, value) {
    try {
        wx.setStorageSync(key, value);
        return true;
    } catch (e) {
        console.error('存储失败:', e);
        return false;
    }
}

/**
 * 从本地存储获取数据
 */
function getStorage(key, defaultValue = null) {
    try {
        const value = wx.getStorageSync(key);
        return value || defaultValue;
    } catch (e) {
        console.error('读取失败:', e);
        return defaultValue;
    }
}

/**
 * 删除本地存储数据
 */
function removeStorage(key) {
    try {
        wx.removeStorageSync(key);
        return true;
    } catch (e) {
        console.error('删除失败:', e);
        return false;
    }
}

/**
 * 清空本地存储
 */
function clearStorage() {
    try {
        wx.clearStorageSync();
        return true;
    } catch (e) {
        console.error('清空失败:', e);
        return false;
    }
}

module.exports = {
    setStorage,
    getStorage,
    removeStorage,
    clearStorage
};
