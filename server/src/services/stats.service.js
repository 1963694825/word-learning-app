const { User, LearnRecord, Word } = require('../models');
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
}

module.exports = new StatsService();
