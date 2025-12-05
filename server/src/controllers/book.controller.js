const bookService = require('../services/book.service');
const { success, error, paginate } = require('../utils/response');

class BookController {
    // 获取词书列表
    async getBooks(ctx) {
        try {
            const books = await bookService.getBooks();
            ctx.body = success(books);
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }

    // 获取词书详情
    async getBookById(ctx) {
        try {
            const { id } = ctx.params;
            const book = await bookService.getBookById(id);
            ctx.body = success(book);
        } catch (err) {
            ctx.body = error(err.message, 404);
        }
    }

    // 获取词书单词列表
    async getBookWords(ctx) {
        try {
            const { id } = ctx.params;
            const { page = 1, pageSize = 20 } = ctx.query;

            const result = await bookService.getBookWords(id, parseInt(page), parseInt(pageSize));

            ctx.body = paginate(result.words, result.total, result.page, result.pageSize);
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }
}

module.exports = new BookController();
