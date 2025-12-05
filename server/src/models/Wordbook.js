const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wordbook = sequelize.define('Wordbook', {
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
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '生词本名称'
    },
    description: {
        type: DataTypes.TEXT,
        comment: '描述'
    },
    word_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '单词数量'
    },
    icon: {
        type: DataTypes.STRING(50),
        comment: '图标'
    },
    color: {
        type: DataTypes.STRING(20),
        comment: '颜色'
    }
}, {
    tableName: 'wordbooks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            fields: ['user_id']
        }
    ]
});

module.exports = Wordbook;
