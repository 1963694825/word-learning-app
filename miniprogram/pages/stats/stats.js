// pages/stats/stats.js
const { get } = require('../../utils/request');

Page({
  data: {
    stats: null,
    calendar: [],
    currentMonth: '',
    loading: true
  },

  onShow() {
    this.loadStats();
    this.loadCalendar();
  },

  onPullDownRefresh() {
    this.loadStats();
    this.loadCalendar();
  },

  async loadStats() {
    this.setData({ loading: true });

    try {
      const res = await get('/stats/overview', {}, true);

      if (res.code === 200) {
        this.setData({
          stats: res.data.stats,
          loading: false
        });
      }
    } catch (error) {
      console.error('加载失败:', error);
      this.setData({ loading: false });
    }
  },

  async loadCalendar() {
    try {
      const res = await get('/stats/calendar?days=42', {}, true);

      if (res.code === 200) {
        const calendarData = this.formatCalendar(res.data.calendar);
        const now = new Date();
        const currentMonth = `${now.getFullYear()}年${now.getMonth() + 1}月`;

        this.setData({
          calendar: calendarData,
          currentMonth: currentMonth
        });
      }
    } catch (error) {
      console.error('加载日历失败:', error);
    }
  },

  // 格式化日历数据为按周显示
  formatCalendar(data) {
    if (!data || data.length === 0) return [];

    // 获取当前月份的第一天
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 获取第一天是星期几(0=周日,1=周一...)
    let firstDayOfWeek = firstDay.getDay();
    // 转换为周一开始(0=周一,6=周日)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const calendar = [];

    // 填充上个月的日期
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendar.push({
        date: '',
        day: '',
        isCurrentMonth: false,
        hasLearned: false,
        count: 0
      });
    }

    // 填充当前月的日期
    const daysInMonth = lastDay.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = data.find(d => d.date === dateStr);

      calendar.push({
        date: dateStr,
        day: day,
        isCurrentMonth: true,
        hasLearned: dayData ? dayData.hasLearned : false,
        count: dayData ? dayData.count : 0
      });
    }

    // 填充下个月的日期,补齐到42个格子(6周)
    const remaining = 42 - calendar.length;
    for (let i = 1; i <= remaining; i++) {
      calendar.push({
        date: '',
        day: '',
        isCurrentMonth: false,
        hasLearned: false,
        count: 0
      });
    }

    return calendar;
  }
});