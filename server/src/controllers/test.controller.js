const testService = require('../services/test.service');
const { success, error } = require('../utils/response');

class TestController {
    async getQuestions(ctx) {
        try {
            const userId = ctx.state.user.id;
            const { count } = ctx.query;

            const questions = await testService.generateQuestions(userId, parseInt(count) || 10);
            ctx.body = success(questions);
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }

    async submitAnswers(ctx) {
        try {
            const userId = ctx.state.user.id;
            const { answers } = ctx.request.body;

            if (!answers || !Array.isArray(answers)) {
                ctx.body = error('答案格式错误', 400);
                return;
            }

            const result = await testService.submitAnswers(userId, answers);
            ctx.body = success(result, '测试提交成功');
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }
}

module.exports = new TestController();
