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
}

module.exports = new StatsController();
