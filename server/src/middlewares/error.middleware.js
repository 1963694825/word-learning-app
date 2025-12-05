const { error } = require('../utils/response');

// 统一错误处理中间件
async function errorMiddleware(ctx, next) {
    try {
        await next();
    } catch (err) {
        console.error('Error:', err);

        // 设置状态码
        ctx.status = err.status || 500;

        // 返回错误信息
        ctx.body = error(
            err.message || '服务器内部错误',
            ctx.status,
            process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
        );

        // 触发应用级错误事件
        ctx.app.emit('error', err, ctx);
    }
}

module.exports = errorMiddleware;
