const Router = require('koa-router');
const learnController = require('../controllers/learn.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = new Router({ prefix: '/learn' });

router.use(authMiddleware);

router.get('/daily-task', learnController.getDailyTask);
router.post('/record', learnController.submitRecord);

module.exports = router;
