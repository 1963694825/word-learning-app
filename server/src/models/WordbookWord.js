const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WordbookWord = sequelize.define('WordbookWord', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    wordbook_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '生词本ID'
    },
    word_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '单词ID'
    },
    note: {
        type: DataTypes.TEXT,
        comment: '笔记'
    },
    source: {
        type: DataTypes.STRING(100),
        comment: '来源'
    }
}, {
    tableName: 'wordbook_words',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            fields: ['wordbook_id']
        }
    ]
});

module.exports = WordbookWord;
