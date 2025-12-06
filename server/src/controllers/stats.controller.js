const statsService = require('../services/stats.service');
const { success, error } = require('../utils/response');

class StatsController {
    async getOverview(ctx) {
        try {
            const userId = ctx.state.user.id;
            const overview = await statsService.getOverview(userId);
            ctx.body = success(overview);
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }

    async getBookStats(ctx) {
        try {
            const userId = ctx.state.user.id;
            const bookId = parseInt(ctx.params.bookId);
            const stats = await statsService.getBookStats(userId, bookId);
            ctx.body = success(stats);
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }

    async getCalendar(ctx) {
        try {
            const userId = ctx.state.user.id;
            const days = parseInt(ctx.query.days) || 30;
            const calendar = await statsService.getCalendar(userId, days);
            ctx.body = success({ calendar });
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }
}

module.exports = new StatsController();
