const { LearnRecord, Word, Book, User } = require('../models');
const { calculateNextReviewTime, needsReview } = require('../utils/srs');
const { Op } = require('sequelize');

class LearnService {
    // 获取每日学习任务
    async getDailyTask(userId, bookId, limit = 20) {
        // 获取需要复习的单词
        const reviewWords = await LearnRecord.findAll({
            where: {
                user_id: userId,
                next_review_time: { [Op.lte]: new Date() }
            },
            include: [{ model: Word }],
            limit: Math.floor(limit / 2)
        });

        // 获取新词
        const learnedWordIds = await LearnRecord.findAll({
            where: { user_id: userId },
            attributes: ['word_id']
        }).then(records => records.map(r => r.word_id));

        const newWords = await Word.findAll({
            where: {
                id: { [Op.notIn]: learnedWordIds.length > 0 ? learnedWordIds : [0] }
            },
            include: [{
                model: Book,
                where: bookId ? { id: bookId } : {},
                through: { attributes: [] }
            }],
            limit: limit - reviewWords.length
        });

        return {
            review: reviewWords.map(r => r.Word),
            new: newWords,
            total: reviewWords.length + newWords.length
        };
    }

    // 提交学习记录
    async submitRecord(userId, wordId, isKnown) {
        let record = await LearnRecord.findOne({
            where: { user_id: userId, word_id: wordId }
        });

        if (!record) {
            // 创建新记录
            const srsData = calculateNextReviewTime({ familiarity_level: 0 }, isKnown);
            record = await LearnRecord.create({
                user_id: userId,
                word_id: wordId,
                first_learn_time: new Date(),
                learn_count: 1,
                last_review_time: new Date(),
                ...srsData,
                correct_count: isKnown ? 1 : 0,
                wrong_count: isKnown ? 0 : 1,
                status: 'learning'
            });
        } else {
            // 更新记录
            const srsData = calculateNextReviewTime(record, isKnown);
            await record.update({
                learn_count: record.learn_count + 1,
                last_review_time: new Date(),
                ...srsData,
                correct_count: isKnown ? record.correct_count + 1 : record.correct_count,
                wrong_count: isKnown ? record.wrong_count : record.wrong_count + 1,
                status: srsData.familiarity_level >= 4 ? 'mastered' : 'learning'
            });
        }

        return record;
    }
}

module.exports = new LearnService();
