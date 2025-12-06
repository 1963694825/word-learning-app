const Router = require('koa-router');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = new Router({ prefix: '/auth' });

// 微信小程序登录(不需要认证)
router.post('/wx-login', authController.wxLogin);

// 测试登录(不需要认证)
router.post('/login', authController.login);

// 获取用户信息(需要认证)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
