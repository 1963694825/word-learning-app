// pages/learn/learn.js
const { get, post } = require('../../utils/request');

Page({
    data: {
        words: [],
        currentIndex: 0,
        currentWord: null,
        showAnswer: false,
        loading: true,
        finished: false,
        bookId: 1, // 默认词书ID
        progress: {
            current: 0,
            total: 0
        }
    },

    onLoad(options) {
        // 从URL参数获取词书ID
        const bookId = options.bookId ? parseInt(options.bookId) : 1;
        console.log('学习页面加载,词书ID:', bookId);
        this.setData({ bookId });
        this.loadWords();
    },

    // 加载学习任务
    async loadWords() {
        this.setData({ loading: true });

        try {
            // 使用当前选中的词书ID
            const res = await get(`/learn/daily-task?bookId=${this.data.bookId}&limit=10`, {}, true);

            if (res.code === 200) {
                const allWords = [...res.data.review, ...res.data.new];

                if (allWords.length > 0) {
                    this.setData({
                        words: allWords,
                        currentWord: allWords[0],
                        progress: {
                            current: 1,
                            total: allWords.length
                        },
                        loading: false
                    });
                } else {
                    this.setData({
                        loading: false,
                        finished: true
                    });
                    wx.showToast({
                        title: '今日任务已完成',
                        icon: 'success'
                    });
                }
            }
        } catch (error) {
            console.error('加载失败:', error);
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            });
            this.setData({ loading: false });
        }
    },

    // 翻转卡片
    flipCard() {
        this.setData({
            showAnswer: !this.data.showAnswer
        });
    },

    // 认识
    async handleKnow() {
        await this.submitRecord(true);
    },

    // 不认识
    async handleUnknow() {
        await this.submitRecord(false);
    },

    // 提交学习记录
    async submitRecord(isKnown) {
        const { currentWord, currentIndex, words } = this.data;

        try {
            await post('/learn/record', {
                wordId: currentWord.id,
                isKnown
            }, true);

            // 下一个单词
            const nextIndex = currentIndex + 1;

            if (nextIndex < words.length) {
                this.setData({
                    currentIndex: nextIndex,
                    currentWord: words[nextIndex],
                    showAnswer: false,
                    progress: {
                        current: nextIndex + 1,
                        total: words.length
                    }
                });
            } else {
                // 学习完成
                this.setData({ finished: true });
                wx.showModal({
                    title: '恭喜',
                    content: `今日学习完成!共学习${words.length}个单词`,
                    showCancel: false,
                    success: () => {
                        wx.navigateBack();
                    }
                });
            }
        } catch (error) {
            console.error('提交失败:', error);
            wx.showToast({
                title: '提交失败',
                icon: 'none'
            });
        }
    }
});
