const wordbookService = require('../services/wordbook.service');
const { success, error } = require('../utils/response');

class WordbookController {
    async getWordbooks(ctx) {
        try {
            const userId = ctx.state.user.id;
            const wordbooks = await wordbookService.getWordbooks(userId);
            ctx.body = success(wordbooks);
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }

    async createWordbook(ctx) {
        try {
            const userId = ctx.state.user.id;
            const { name, description } = ctx.request.body;

            if (!name) {
                ctx.body = error('生词本名称不能为空', 400);
                return;
            }

            const wordbook = await wordbookService.createWordbook(userId, name, description);
            ctx.body = success(wordbook, '创建成功');
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }

    async addWord(ctx) {
        try {
            const userId = ctx.state.user.id;
            const { id } = ctx.params;
            const { wordId } = ctx.request.body;

            const result = await wordbookService.addWord(id, wordId, userId);
            ctx.body = success(result, '添加成功');
        } catch (err) {
            ctx.body = error(err.message, 500);
        }
    }
}

module.exports = new WordbookController();
