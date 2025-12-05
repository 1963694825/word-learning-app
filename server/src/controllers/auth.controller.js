const authService = require('../services/auth.service');
const { success, error } = require('../utils/response');

class AuthController {
    // 登录
    async login(ctx) {
        try {
            const { username, password } = ctx.request.body;

            if (!username) {
                ctx.body = error('用户名不能为空', 400);
                return;
            }

            const result = await authService.login(username, password);
            ctx.body = success(result, '登录成功');
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }

    // 获取用户信息
    async getProfile(ctx) {
        try {
            const userId = ctx.state.user.id;
            const profile = await authService.getProfile(userId);
            ctx.body = success(profile);
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }
}

module.exports = new AuthController();
