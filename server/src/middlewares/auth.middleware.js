const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

// JWT认证中间件
async function authMiddleware(ctx, next) {
    try {
        // 获取token
        const authHeader = ctx.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            ctx.status = 401;
            ctx.body = error('未提供认证token', 401);
            return;
        }

        const token = authHeader.substring(7);

        // 验证token
        const decoded = verifyToken(token);

        // 将用户信息附加到ctx.state
        ctx.state.user = decoded;

        await next();
    } catch (err) {
        ctx.status = 401;
        ctx.body = error('认证失败: ' + err.message, 401);
    }
}

module.exports = authMiddleware;
