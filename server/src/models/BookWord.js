const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookWord = sequelize.define('BookWord', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '词书ID'
    },
    word_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '单词ID'
    },
    word_order: {
        type: DataTypes.INTEGER,
        comment: '单词顺序'
    }
}, {
    tableName: 'book_words',
    timestamps: false,
    indexes: [
        {
            fields: ['book_id']
        },
        {
            fields: ['word_id']
        }
    ]
});

module.exports = BookWord;
