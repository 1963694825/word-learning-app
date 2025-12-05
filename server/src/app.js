const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const config = require('./config');

const app = new Koa();

// 中间件
app.use(cors());
app.use(bodyParser());

// 错误处理
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = {
            code: ctx.status,
            message: err.message || '服务器错误'
        };
        console.error('Error:', err);
    }
});

// 测试路由
app.use(async (ctx) => {
    ctx.body = {
        code: 200,
        message: '英语单词学习API服务运行中',
        data: {
            version: '1.0.0',
            env: config.env
        }
    };
});

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🚀 服务器启动成功`);
    console.log(`📡 运行地址: http://localhost:${PORT}`);
    console.log(`🌍 运行环境: ${config.env}`);
});

module.exports = app;
