const sequelize = require('../config/database');

// 导入所有模型
const User = require('./User');
const Word = require('./Word');
const Book = require('./Book');
const BookWord = require('./BookWord');
const LearnRecord = require('./LearnRecord');
const Wordbook = require('./Wordbook');
const WordbookWord = require('./WordbookWord');
const TestRecord = require('./TestRecord');

// 定义模型关联关系

// Book 和 Word 多对多关系(通过 BookWord)
Book.belongsToMany(Word, { through: BookWord, foreignKey: 'book_id' });
Word.belongsToMany(Book, { through: BookWord, foreignKey: 'word_id' });

// User 和 LearnRecord 一对多关系
User.hasMany(LearnRecord, { foreignKey: 'user_id' });
LearnRecord.belongsTo(User, { foreignKey: 'user_id' });

// Word 和 LearnRecord 一对多关系
Word.hasMany(LearnRecord, { foreignKey: 'word_id' });
LearnRecord.belongsTo(Word, { foreignKey: 'word_id' });

// User 和 Wordbook 一对多关系
User.hasMany(Wordbook, { foreignKey: 'user_id' });
Wordbook.belongsTo(User, { foreignKey: 'user_id' });

// Wordbook 和 Word 多对多关系(通过 WordbookWord)
Wordbook.belongsToMany(Word, { through: WordbookWord, foreignKey: 'wordbook_id' });
Word.belongsToMany(Wordbook, { through: WordbookWord, foreignKey: 'word_id' });

// User 和 TestRecord 一对多关系
User.hasMany(TestRecord, { foreignKey: 'user_id' });
TestRecord.belongsTo(User, { foreignKey: 'user_id' });

// 导出所有模型和sequelize实例
module.exports = {
    sequelize,
    User,
    Word,
    Book,
    BookWord,
    LearnRecord,
    Wordbook,
    WordbookWord,
    TestRecord
};
