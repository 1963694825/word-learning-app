// pages/test/test.js
const { get, post } = require('../../utils/request');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    selectedOption: null,
    answers: [],
    loading: true,
    finished: false,
    result: null
  },

  onLoad() {
    this.loadQuestions();
  },

  // 加载测试题目
  async loadQuestions() {
    this.setData({ loading: true });

    try {
      const res = await get('/test/questions?count=5', {}, true);

      if (res.code === 200 && res.data.length > 0) {
        this.setData({
          questions: res.data,
          currentQuestion: res.data[0],
          loading: false
        });
      } else {
        wx.showToast({
          title: res.message || '暂无测试题目',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
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

  // 选择选项
  selectOption(e) {
    const optionId = e.currentTarget.dataset.id;
    this.setData({
      selectedOption: optionId
    });
  },

  // 提交答案
  submitAnswer() {
    const { selectedOption, currentQuestion, currentIndex, questions, answers } = this.data;

    if (!selectedOption) {
      wx.showToast({
        title: '请选择答案',
        icon: 'none'
      });
      return;
    }

    // 记录答案
    const newAnswers = [...answers, {
      selectedId: selectedOption,
      correctId: currentQuestion.correctId
    }];

    const nextIndex = currentIndex + 1;

    if (nextIndex < questions.length) {
      // 下一题
      this.setData({
        currentIndex: nextIndex,
        currentQuestion: questions[nextIndex],
        selectedOption: null,
        answers: newAnswers
      });
    } else {
      // 测试完成,提交结果
      this.submitTest(newAnswers);
    }
  },

  // 提交测试
  async submitTest(answers) {
    try {
      const res = await post('/test/submit', { answers }, true);

      if (res.code === 200) {
        this.setData({
          finished: true,
          result: res.data
        });
      }
    } catch (error) {
      console.error('提交失败:', error);
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      });
    }
  },

  // 返回首页
  backToHome() {
    wx.navigateBack();
  }
});