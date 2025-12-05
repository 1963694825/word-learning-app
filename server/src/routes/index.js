const Router = require('koa-router');
const authRoutes = require('./auth.routes');
const bookRoutes = require('./book.routes');
const learnRoutes = require('./learn.routes');
const testRoutes = require('./test.routes');
const wordbookRoutes = require('./wordbook.routes');
const statsRoutes = require('./stats.routes');

const router = new Router({ prefix: '/api/v1' });

// 注册各模块路由
router.use(authRoutes.routes(), authRoutes.allowedMethods());
router.use(bookRoutes.routes(), bookRoutes.allowedMethods());
router.use(learnRoutes.routes(), learnRoutes.allowedMethods());
router.use(testRoutes.routes(), testRoutes.allowedMethods());
router.use(wordbookRoutes.routes(), wordbookRoutes.allowedMethods());
router.use(statsRoutes.routes(), statsRoutes.allowedMethods());

module.exports = router;
