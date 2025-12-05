const { Wordbook, WordbookWord, Word } = require('../models');

class WordbookService {
    async getWordbooks(userId) {
        return await Wordbook.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
    }

    async createWordbook(userId, name, description) {
        return await Wordbook.create({
            user_id: userId,
            name,
            description,
            word_count: 0
        });
    }

    async addWord(wordbookId, wordId, userId) {
        const wordbook = await Wordbook.findOne({
            where: { id: wordbookId, user_id: userId }
        });

        if (!wordbook) {
            throw new Error('生词本不存在');
        }

        const existing = await WordbookWord.findOne({
            where: { wordbook_id: wordbookId, word_id: wordId }
        });

        if (existing) {
            throw new Error('单词已存在');
        }

        await WordbookWord.create({
            wordbook_id: wordbookId,
            word_id: wordId
        });

        await wordbook.update({
            word_count: wordbook.word_count + 1
        });

        return { success: true };
    }
}

module.exports = new WordbookService();
