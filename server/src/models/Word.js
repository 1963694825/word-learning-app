const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Word = sequelize.define('Word', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    word: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '单词'
    },
    phonetic_us: {
        type: DataTypes.STRING(100),
        comment: '美式音标'
    },
    phonetic_uk: {
        type: DataTypes.STRING(100),
        comment: '英式音标'
    },
    definitions: {
        type: DataTypes.JSON,
        comment: '释义(JSON格式)'
    },
    examples: {
        type: DataTypes.JSON,
        comment: '例句(JSON格式)'
    },
    root: {
        type: DataTypes.STRING(255),
        comment: '词根词缀'
    },
    synonyms: {
        type: DataTypes.JSON,
        comment: '同义词'
    },
    frequency: {
        type: DataTypes.STRING(20),
        comment: '词频(high/medium/low)'
    },
    difficulty: {
        type: DataTypes.INTEGER,
        comment: '难度等级(1-10)'
    },
    audio_url: {
        type: DataTypes.STRING(255),
        comment: '发音音频URL'
    }
}, {
    tableName: 'words',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            fields: ['word']
        },
        {
            fields: ['difficulty']
        }
    ]
});

module.exports = Word;
