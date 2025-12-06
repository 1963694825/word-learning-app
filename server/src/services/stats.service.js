const { User, LearnRecord, Word, Book, BookWord } = require('../models');
const { Op } = require('sequelize');

class StatsService {
    async getOverview(userId) {
        const user = await User.findByPk(userId);

        const totalWords = await LearnRecord.count({
            where: { user_id: userId }
        });

        const masteredWords = await LearnRecord.count({
            where: {
                user_id: userId,
                familiarity_level: { [Op.gte]: 4 }
            }
        });

        const todayRecords = await LearnRecord.count({
            where: {
                user_id: userId,
                last_review_time: {
                    [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        });

        return {
            user: {
                nickname: user.nickname,
                avatar_url: user.avatar_url
            },
            stats: {
                total_learn_days: user.total_learn_days,
                continuous_days: user.continuous_days,
                total_words: totalWords,
                mastered_words: masteredWords,
                today_words: todayRecords
            }
        };
    }

    /**
     * 获取特定词书的学习统计
     * @param {number} userId - 用户ID
     * @param {number} bookId - 词书ID
     */
    async getBookStats(userId, bookId) {
        // 获取词书信息
        const book = await Book.findByPk(bookId);
        if (!book) {
            throw new Error('词书不存在');
        }

        // 获取词书的总单词数
        const totalWords = await BookWord.count({
            where: { book_id: bookId }
        });

        // 获取用户在该词书中已学习的单词数
        const learnedWords = await LearnRecord.count({
            where: {
                user_id: userId,
                book_id: bookId
            }
        });

        // 获取已掌握的单词数(熟悉度>=4)
        const masteredWords = await LearnRecord.count({
            where: {
                user_id: userId,
                book_id: bookId,
                familiarity_level: { [Op.gte]: 4 }
            }
        });

        // 获取学习中的单词数(熟悉度1-3)
        const learningWords = await LearnRecord.count({
            where: {
                user_id: userId,
                book_id: bookId,
                familiarity_level: { [Op.between]: [1, 3] }
            }
        });

        // 未学习的单词数
        const unlearnedWords = totalWords - learnedWords;

        // 学习进度百分比
        const progress = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

        return {
            book: {
                id: book.id,
                name: book.name,
                description: book.description,
                difficulty_level: book.difficulty_level,
                category: book.category
            },
            stats: {
                total_words: totalWords,           // 总单词数
                learned_words: learnedWords,       // 已学习单词数
                unlearned_words: unlearnedWords,   // 未学习单词数
                mastered_words: masteredWords,     // 已掌握单词数
                learning_words: learningWords,     // 学习中单词数
                progress: progress                 // 学习进度(%)
            }
        };
    }
}

module.exports = new StatsService();
