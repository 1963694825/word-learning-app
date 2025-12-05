const { Book, Word, BookWord } = require('../models');

class BookService {
    // 获取词书列表
    async getBooks() {
        const books = await Book.findAll({
            attributes: ['id', 'name', 'description', 'word_count', 'difficulty_level', 'category', 'cover_url'],
            order: [['difficulty_level', 'ASC']]
        });

        return books;
    }

    // 获取词书详情
    async getBookById(bookId) {
        const book = await Book.findByPk(bookId);

        if (!book) {
            throw new Error('词书不存在');
        }

        return book;
    }

    // 获取词书单词列表
    async getBookWords(bookId, page = 1, pageSize = 20) {
        const offset = (page - 1) * pageSize;

        const { count, rows } = await Word.findAndCountAll({
            include: [{
                model: Book,
                where: { id: bookId },
                through: { attributes: ['word_order'] },
                attributes: []
            }],
            offset,
            limit: pageSize,
            order: [[{ model: Book, as: 'Books' }, BookWord, 'word_order', 'ASC']]
        });

        return {
            words: rows,
            total: count,
            page,
            pageSize
        };
    }
}

module.exports = new BookService();
