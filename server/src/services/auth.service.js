const axios = require('axios');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

class AuthService {
    /**
     * 微信小程序登录
     * @param {string} code - 微信登录凭证
     * @param {object} userInfo - 用户信息
     */
    async wxLogin(code, userInfo) {
        try {
            // 1. 调用微信API获取openid和session_key
            const wxRes = await this.getWxOpenId(code);

            if (!wxRes.openid) {
                throw new Error('获取微信openid失败');
            }

            // 2. 查找或创建用户
            let user = await User.findOne({ where: { openid: wxRes.openid } });

            if (!user) {
                // 创建新用户
                user = await User.create({
                    openid: wxRes.openid,
                    session_key: wxRes.session_key,
                    nickname: userInfo.nickName || '微信用户',
                    avatar_url: userInfo.avatarUrl || '',
                    gender: userInfo.gender || 0
                });
            } else {
                // 更新用户信息
                await user.update({
                    session_key: wxRes.session_key,
                    nickname: userInfo.nickName || user.nickname,
                    avatar_url: userInfo.avatarUrl || user.avatar_url,
                    gender: userInfo.gender || user.gender
                });
            }

            // 3. 生成JWT token
            const token = generateToken({
                id: user.id,
                openid: user.openid,
                nickname: user.nickname
            });

            return {
                token,
                user: {
                    id: user.id,
                    nickname: user.nickname,
                    avatar_url: user.avatar_url,
                    total_learn_days: user.total_learn_days,
                    continuous_days: user.continuous_days
                }
            };
        } catch (error) {
            console.error('微信登录失败:', error);
            throw new Error('登录失败: ' + error.message);
        }
    }

    /**
     * 调用微信API获取openid
     * @param {string} code - 微信登录凭证
     */
    async getWxOpenId(code) {
        const appId = process.env.WECHAT_APP_ID;
        const appSecret = process.env.WECHAT_APP_SECRET;

        if (!appId || !appSecret) {
            throw new Error('微信配置未设置');
        }

        const url = 'https://api.weixin.qq.com/sns/jscode2session';
        const params = {
            appid: appId,
            secret: appSecret,
            js_code: code,
            grant_type: 'authorization_code'
        };

        try {
            const response = await axios.get(url, { params });
            const data = response.data;

            if (data.errcode) {
                throw new Error(`微信API错误: ${data.errmsg}`);
            }

            return {
                openid: data.openid,
                session_key: data.session_key,
                unionid: data.unionid
            };
        } catch (error) {
            console.error('调用微信API失败:', error);
            throw error;
        }
    }

    /**
     * 简化登录(用于测试)
     */
    async login(username, password) {
        let user = await User.findOne({ where: { openid: `test_${username}` } });

        if (!user) {
            user = await User.create({
                openid: `test_${username}`,
                nickname: username,
                avatar_url: 'https://via.placeholder.com/150'
            });
        }

        const token = generateToken({
            id: user.id,
            openid: user.openid,
            nickname: user.nickname
        });

        return {
            token,
            user: {
                id: user.id,
                nickname: user.nickname,
                avatar_url: user.avatar_url,
                total_learn_days: user.total_learn_days,
                continuous_days: user.continuous_days
            }
        };
    }

    /**
     * 获取用户信息
     */
    async getProfile(userId) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new Error('用户不存在');
        }

        return {
            id: user.id,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            total_learn_days: user.total_learn_days,
            continuous_days: user.continuous_days,
            total_words: user.total_words
        };
    }
}

module.exports = new AuthService();
