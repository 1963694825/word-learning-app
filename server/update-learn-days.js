// 手动更新用户打卡天数的脚本
const { User, LearnRecord } = require('./src/models');
const { Op } = require('sequelize');

async function updateUserLearnDays() {
    try {
        // 获取最新的用户
        const user = await User.findOne({
            order: [['id', 'DESC']]
        });

        if (!user) {
            console.log('没有找到用户');
            return;
        }

        console.log('正在更新用户:', user.nickname);

        // 获取所有学习过的日期(去重)
        const allRecords = await LearnRecord.findAll({
            where: { user_id: user.id },
            attributes: ['last_review_time'],
            raw: true
        });

        console.log('学习记录总数:', allRecords.length);

        // 统计不同的学习日期
        const learnDates = new Set();
        allRecords.forEach(record => {
            const date = new Date(record.last_review_time);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            learnDates.add(dateStr);
        });

        console.log('学习日期:', Array.from(learnDates));

        const totalLearnDays = learnDates.size;

        // 计算连续天数
        let continuousDays = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

            if (learnDates.has(dateStr)) {
                continuousDays++;
            } else {
                break;
            }
        }

        console.log('累计天数:', totalLearnDays);
        console.log('连续天数:', continuousDays);

        // 更新用户记录
        await user.update({
            total_learn_days: totalLearnDays,
            continuous_days: continuousDays
        });

        console.log('更新成功!');
        process.exit(0);
    } catch (error) {
        console.error('更新失败:', error);
        process.exit(1);
    }
}

updateUserLearnDays();
