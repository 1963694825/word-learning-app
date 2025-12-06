// pages/index/index.js
const { get } = require('../../utils/request');
const { login, isLoggedIn } = require('../../utils/auth');

Page({
    data: {
        userInfo: null,
        books: [],
        selectedBook: null,
        bookStats: null,
        stats: {
            todayWords: 0,
            totalWords: 0,
            continuousDays: 0
        },
        todayTask: {
            review: [],
            new: [],
            total: 0
        },
        loading: true
    },

    onLoad() {
        console.log('页面加载');
        this.checkLogin();
    },

    onShow() {
        if (isLoggedIn()) {
            this.loadData();
        }
    },

    onPullDownRefresh() {
        this.loadData(true);
    },

    async checkLogin() {
        if (!isLoggedIn()) {
            const result = await login('testuser', '123456');
            if (result.success) {
                this.setData({ userInfo: result.data.user });
                this.loadData();
            } else {
                wx.showToast({ title: '登录失败', icon: 'none' });
            }
        } else {
            this.loadData();
        }
    },

    async loadData(refresh = false) {
        this.setData({ loading: true });

        try {
            const booksRes = await get('/books', {}, false);
            if (booksRes.code === 200) {
                const books = booksRes.data.books || [];
                console.log('词书列表:', books);
                this.setData({ books });

                if (!this.data.selectedBook && books.length > 0) {
                    this.setData({ selectedBook: books[0] });
                    await this.loadBookStats(books[0].id);
                }
            }

            const statsRes = await get('/stats/overview', {}, true);
            if (statsRes.code === 200) {
                this.setData({
                    stats: {
                        todayWords: statsRes.data.stats.today_words || 0,
                        totalWords: statsRes.data.stats.total_words || 0,
                        continuousDays: statsRes.data.stats.continuous_days || 0
                    }
                });
            }

            const bookId = this.data.selectedBook ? this.data.selectedBook.id : 1;
            const taskRes = await get(`/learn/daily-task?bookId=${bookId}&limit=10`, {}, true);
            if (taskRes.code === 200) {
                this.setData({ todayTask: taskRes.data });
            }

            if (refresh) {
                wx.showToast({ title: '刷新成功', icon: 'success' });
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            wx.showToast({ title: '加载失败,请重试', icon: 'none' });
        } finally {
            this.setData({ loading: false });
            if (refresh) {
                wx.stopPullDownRefresh();
            }
        }
    },

    startLearning() {
        if (this.data.todayTask.total > 0) {
            wx.navigateTo({ url: '/pages/learn/learn' });
        } else {
            wx.showToast({ title: '暂无学习任务', icon: 'none' });
        }
    },

    startTest() {
        wx.navigateTo({ url: '/pages/test/test' });
    },

    selectBook(e) {
        console.log('selectBook被调用', e);
        const bookId = parseInt(e.currentTarget.dataset.id);
        console.log('bookId:', bookId, 'type:', typeof bookId);

        const book = this.data.books.find(b => b.id === bookId);
        console.log('找到的书:', book);

        if (!book) {
            console.log('未找到词书');
            return;
        }

        wx.showToast({ title: '加载中...', icon: 'loading', duration: 10000 });

        this.setData({ selectedBook: book });

        this.loadBookStats(bookId).then(() => {
            return this.loadBookTask(bookId);
        }).then(() => {
            wx.hideToast();
        }).catch(err => {
            console.error('加载失败:', err);
            wx.hideToast();
        });
    },

    async loadBookStats(bookId) {
        try {
            console.log('加载词书统计:', bookId);
            const res = await get(`/stats/book/${bookId}`, {}, true);
            console.log('统计API响应:', res);
            if (res.code === 200) {
                this.setData({ bookStats: res.data.stats });
            }
        } catch (error) {
            console.error('加载词书统计失败:', error);
            this.setData({
                bookStats: {
                    total_words: 0,
                    learned_words: 0,
                    unlearned_words: 0,
                    mastered_words: 0,
                    learning_words: 0,
                    progress: 0
                }
            });
        }
    },

    async loadBookTask(bookId) {
        try {
            console.log('加载词书任务:', bookId);
            const taskRes = await get(`/learn/daily-task?bookId=${bookId}&limit=10`, {}, true);
            if (taskRes.code === 200) {
                this.setData({ todayTask: taskRes.data });
            }
        } catch (error) {
            console.error('加载任务失败:', error);
        }
    },

    goToWordbook() {
        wx.navigateTo({ url: '/pages/wordbook/wordbook' });
    }
});
