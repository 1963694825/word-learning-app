const { Word, LearnRecord } = require('../models');
const { Op } = require('sequelize');

class TestService {
    // 生成测试题目
    async generateQuestions(userId, count = 10) {
        // 获取用户学习过的单词
        const learnedWords = await LearnRecord.findAll({
            where: { user_id: userId },
            include: [{ model: Word }],
            order: [['familiarity_level', 'ASC'], ['last_review_time', 'DESC']],
            limit: count
        });

        if (learnedWords.length === 0) {
            throw new Error('还没有学习过单词,无法生成测试');
        }

        // 获取所有单词用于生成干扰项
        const allWords = await Word.findAll({ limit: 100 });

        const questions = learnedWords.map(record => {
            const correctWord = record.Word;
            const distractors = this.generateDistractors(correctWord, allWords, 3);
            const options = this.shuffleArray([correctWord, ...distractors]);

            return {
                id: correctWord.id,
                word: correctWord.word,
                phonetic: correctWord.phonetic_us,
                options: options.map(w => ({
                    id: w.id,
                    meaning: w.definitions[0]?.meaning || '未知'
                })),
                correctId: correctWord.id
            };
        });

        return questions;
    }

    // 生成干扰项
    generateDistractors(correctWord, allWords, count) {
        return allWords
            .filter(w => w.id !== correctWord.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
    }

    // 打乱数组
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 提交测试答案
    async submitAnswers(userId, answers) {
        let correctCount = 0;

        for (const answer of answers) {
            if (answer.selectedId === answer.correctId) {
                correctCount++;
            }
        }

        const accuracy = (correctCount / answers.length) * 100;

        return {
            total: answers.length,
            correct: correctCount,
            accuracy: accuracy.toFixed(2)
        };
    }
}

module.exports = new TestService();
