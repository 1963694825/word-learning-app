const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const config = require('./config');
const router = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = new Koa();

// 中间件
app.use(cors());
app.use(bodyParser());
app.use(errorMiddleware);

// 路由
app.use(router.routes());
app.use(router.allowedMethods());

// 错误事件监听
app.on('error', (err, ctx) => {
    console.error('Server error:', err);
});

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🚀 服务器启动成功`);
    console.log(`📡 运行地址: http://localhost:${PORT}`);
    console.log(`🌍 运行环境: ${config.env}`);
    console.log(`📚 API文档: http://localhost:${PORT}/api/v1`);
});

module.exports = app;
