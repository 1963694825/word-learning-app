const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    openid: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        comment: '微信openid'
    },
    nickname: {
        type: DataTypes.STRING(50),
        comment: '昵称'
    },
    avatar_url: {
        type: DataTypes.STRING(255),
        comment: '头像URL'
    },
    total_learn_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '累计学习天数'
    },
    continuous_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '连续打卡天数'
    },
    total_words: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '累计学习单词数'
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['openid']
        }
    ]
});

module.exports = User;
