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

        // 更新用户的打卡天数
        await this.updateUserLearnDays(userId);

        return record;
    }

    // 更新用户的学习天数和连续天数
    async updateUserLearnDays(userId) {
        const user = await User.findByPk(userId);
        if (!user) return;

        // 获取今天的开始时间
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // 检查今天是否有学习记录
        const todayRecords = await LearnRecord.count({
            where: {
                user_id: userId,
                last_review_time: {
                    [Op.gte]: todayStart
                }
            }
        });

        if (todayRecords === 0) return; // 今天没有学习,不更新

        // 获取所有学习过的日期(去重)
        const allRecords = await LearnRecord.findAll({
            where: { user_id: userId },
            attributes: ['last_review_time'],
            raw: true
        });

        // 统计不同的学习日期
        const learnDates = new Set();
        allRecords.forEach(record => {
            const date = new Date(record.last_review_time);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            learnDates.add(dateStr);
        });

        const totalLearnDays = learnDates.size;

        // 计算连续天数
        let continuousDays = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

            if (learnDates.has(dateStr)) {
                continuousDays++;
            } else {
                break;
            }
        }

        // 更新用户记录
        await user.update({
            total_learn_days: totalLearnDays,
            continuous_days: continuousDays
        });
    }
}

module.exports = new LearnService();
