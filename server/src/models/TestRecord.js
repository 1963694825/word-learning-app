const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TestRecord = sequelize.define('TestRecord', {
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
    test_type: {
        type: DataTypes.STRING(50),
        comment: '测试类型'
    },
    total_questions: {
        type: DataTypes.INTEGER,
        comment: '总题数'
    },
    correct_count: {
        type: DataTypes.INTEGER,
        comment: '正确数'
    },
    accuracy: {
        type: DataTypes.DECIMAL(5, 2),
        comment: '正确率'
    },
    duration: {
        type: DataTypes.INTEGER,
        comment: '用时(秒)'
    }
}, {
    tableName: 'test_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            fields: ['user_id']
        }
    ]
});

module.exports = TestRecord;
