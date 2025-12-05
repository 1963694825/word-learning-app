// SRS (Spaced Repetition System) 间隔重复算法

// 复习间隔(天数)
const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30];

// 计算下次复习时间
function calculateNextReviewTime(learnRecord, isCorrect) {
    let level = learnRecord.familiarity_level || 0;

    // 根据答题结果调整熟悉度等级
    if (isCorrect) {
        level = Math.min(level + 1, 5); // 最高5级
    } else {
        level = Math.max(level - 1, 0); // 最低0级
    }

    // 获取对应的复习间隔
    const interval = REVIEW_INTERVALS[level] || 30;

    // 计算下次复习时间
    const nextTime = new Date();
    nextTime.setDate(nextTime.getDate() + interval);
    nextTime.setHours(0, 0, 0, 0); // 设置为当天0点

    return {
        familiarity_level: level,
        next_review_time: nextTime
    };
}

// 判断是否需要复习
function needsReview(learnRecord) {
    if (!learnRecord.next_review_time) {
        return true;
    }

    const now = new Date();
    const nextReview = new Date(learnRecord.next_review_time);

    return now >= nextReview;
}

// 获取单词状态
function getWordStatus(learnRecord) {
    if (!learnRecord) {
        return 'new'; // 未学习
    }

    if (learnRecord.familiarity_level >= 4) {
        return 'mastered'; // 已掌握
    }

    if (needsReview(learnRecord)) {
        return 'review'; // 需复习
    }

    return 'learning'; // 学习中
}

module.exports = {
    calculateNextReviewTime,
    needsReview,
    getWordStatus,
    REVIEW_INTERVALS
};
