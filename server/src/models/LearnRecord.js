const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LearnRecord = sequelize.define('LearnRecord', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID'
    },
    word_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '单词ID'
    },
    book_id: {
        type: DataTypes.INTEGER,
        comment: '词书ID'
    },
    first_learn_time: {
        type: DataTypes.DATE,
        comment: '首次学习时间'
    },
    learn_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '学习次数'
    },
    last_review_time: {
        type: DataTypes.DATE,
        comment: '最后复习时间'
    },
    next_review_time: {
        type: DataTypes.DATE,
        comment: '下次复习时间'
    },
    familiarity_level: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '熟悉度等级(0-5)'
    },
    correct_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '正确次数'
    },
    wrong_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '错误次数'
    },
    status: {
        type: DataTypes.STRING(20),
        comment: '状态(learning/mastered)'
    }
}, {
    tableName: 'learn_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['user_id', 'word_id']
        },
        {
            fields: ['next_review_time']
        }
    ]
});

module.exports = LearnRecord;
