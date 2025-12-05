const Router = require('koa-router');
const testController = require('../controllers/test.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = new Router({ prefix: '/test' });

router.use(authMiddleware);

router.get('/questions', testController.getQuestions);
router.post('/submit', testController.submitAnswers);

module.exports = router;
