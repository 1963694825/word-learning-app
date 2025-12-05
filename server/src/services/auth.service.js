const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

class AuthService {
    // 简化登录(用于测试,生产环境使用微信登录)
    async login(username, password) {
        // 查找或创建测试用户
        let user = await User.findOne({ where: { openid: `test_${username}` } });

        if (!user) {
            // 创建新用户
            user = await User.create({
                openid: `test_${username}`,
                nickname: username,
                avatar_url: 'https://via.placeholder.com/150'
            });
        }

        // 生成token
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

    // 获取用户信息
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
