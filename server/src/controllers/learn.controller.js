const learnService = require('../services/learn.service');
const { success, error } = require('../utils/response');

class LearnController {
    async getDailyTask(ctx) {
        try {
            const userId = ctx.state.user.id;
            const { bookId, limit } = ctx.query;

            const task = await learnService.getDailyTask(userId, bookId, parseInt(limit) || 20);
            ctx.body = success(task);
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }

    async submitRecord(ctx) {
        try {
            const userId = ctx.state.user.id;
            const { wordId, isKnown } = ctx.request.body;

            if (!wordId) {
                ctx.body = error('单词ID不能为空', 400);
                return;
            }

            const record = await learnService.submitRecord(userId, wordId, isKnown);
            ctx.body = success(record, '学习记录提交成功');
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }
}

module.exports = new LearnController();
