const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '词书名称'
    },
    description: {
        type: DataTypes.TEXT,
        comment: '词书描述'
    },
    word_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '单词数量'
    },
    difficulty_level: {
        type: DataTypes.INTEGER,
        comment: '难度等级'
    },
    category: {
        type: DataTypes.STRING(50),
        comment: '分类(考试/分级/专业)'
    },
    cover_url: {
        type: DataTypes.STRING(255),
        comment: '封面图片URL'
    },
    is_builtin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '是否内置词书'
    }
}, {
    tableName: 'books',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Book;
