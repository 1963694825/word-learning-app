const Router = require('koa-router');
const bookController = require('../controllers/book.controller');

const router = new Router({ prefix: '/books' });

// 获取词书列表
router.get('/', bookController.getBooks);

// 获取词书详情
router.get('/:id', bookController.getBookById);

// 获取词书单词列表
router.get('/:id/words', bookController.getBookWords);

module.exports = router;
