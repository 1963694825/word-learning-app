const Router = require('koa-router');
const wordbookController = require('../controllers/wordbook.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = new Router({ prefix: '/wordbooks' });

router.use(authMiddleware);

router.get('/', wordbookController.getWordbooks);
router.post('/', wordbookController.createWordbook);
router.post('/:id/words', wordbookController.addWord);

module.exports = router;
