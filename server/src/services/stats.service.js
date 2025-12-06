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

        // 获取词书的所有单词ID
        const bookWordIds = await BookWord.findAll({
            where: { book_id: bookId },
            attributes: ['word_id']
        }).then(records => records.map(r => r.word_id));

        // 获取词书的总单词数
        const totalWords = bookWordIds.length;

        // 获取用户在该词书中已学习的单词数
        const learnedWords = await LearnRecord.count({
            where: {
                user_id: userId,
                word_id: { [Op.in]: bookWordIds.length > 0 ? bookWordIds : [0] }
            }
        });

        // 获取已掌握的单词数(熟悉度>=4)
        const masteredWords = await LearnRecord.count({
            where: {
                user_id: userId,
                word_id: { [Op.in]: bookWordIds.length > 0 ? bookWordIds : [0] },
                familiarity_level: { [Op.gte]: 4 }
            }
        });

        // 获取学习中的单词数(熟悉度1-3)
        const learningWords = await LearnRecord.count({
            where: {
                user_id: userId,
                word_id: { [Op.in]: bookWordIds.length > 0 ? bookWordIds : [0] },
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

    /**
     * 获取学习日历数据
     * @param {number} userId - 用户ID
     * @param {number} days - 获取最近多少天的数据,默认30天
     */
    async getCalendar(userId, days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days + 1);
        startDate.setHours(0, 0, 0, 0);

        // 获取这段时间内每天的学习记录
        const records = await LearnRecord.findAll({
            where: {
                user_id: userId,
                last_review_time: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: ['last_review_time'],
            raw: true
        });

        // 统计每天的学习记录数
        const dailyRecords = {};
        records.forEach(record => {
            const date = new Date(record.last_review_time);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            dailyRecords[dateStr] = (dailyRecords[dateStr] || 0) + 1;
        });

        // 生成日历数据
        const calendar = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            calendar.push({
                date: dateStr,
                count: dailyRecords[dateStr] || 0,
                hasLearned: (dailyRecords[dateStr] || 0) > 0
            });
        }

        return calendar;
    }
}

module.exports = new StatsService();
