const Router = require('koa-router');
const statsController = require('../controllers/stats.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = new Router({ prefix: '/stats' });

router.use(authMiddleware);

router.get('/overview', statsController.getOverview);
router.get('/book/:bookId', statsController.getBookStats);

module.exports = router;
