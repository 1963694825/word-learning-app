const { sequelize, Word, Book, BookWord } = require('../src/models');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    try {
        console.log('🚀 开始初始化数据库...\n');

        // 1. 同步所有表结构
        console.log('📋 同步数据库表结构...');
        await sequelize.sync({ force: true }); // force:true 会删除已存在的表并重新创建
        console.log('✅ 表结构同步完成\n');

        // 2. 导入单词数据
        console.log('📚 导入单词数据...');
        const wordsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../data/test-words.json'), 'utf8')
        );
        const words = await Word.bulkCreate(wordsData);
        console.log(`✅ 成功导入 ${words.length} 个单词\n`);

        // 3. 导入词书数据
        console.log('📖 导入词书数据...');
        const booksData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../data/test-books.json'), 'utf8')
        );
        const books = await Book.bulkCreate(booksData);
        console.log(`✅ 成功导入 ${books.length} 个词书\n`);

        // 4. 关联词书和单词
        console.log('🔗 关联词书和单词...');
        // 基础词汇包含前3个单词
        await BookWord.bulkCreate([
            { book_id: books[0].id, word_id: words[0].id, word_order: 1 },
            { book_id: books[0].id, word_id: words[1].id, word_order: 2 },
            { book_id: books[0].id, word_id: words[2].id, word_order: 3 }
        ]);

        // 进阶词汇包含后2个单词
        await BookWord.bulkCreate([
            { book_id: books[1].id, word_id: words[3].id, word_order: 1 },
            { book_id: books[1].id, word_id: words[4].id, word_order: 2 }
        ]);

        // 更新词书的单词数量
        await books[0].update({ word_count: 3 });
        await books[1].update({ word_count: 2 });
        console.log('✅ 词书关联完成\n');

        // 5. 验证数据
        console.log('🔍 验证数据...');
        const wordCount = await Word.count();
        const bookCount = await Book.count();
        const bookWordCount = await BookWord.count();

        console.log(`   单词总数: ${wordCount}`);
        console.log(`   词书总数: ${bookCount}`);
        console.log(`   关联记录: ${bookWordCount}`);
        console.log('\n✅ 数据验证通过\n');

        console.log('🎉 数据库初始化完成!');
        process.exit(0);

    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        process.exit(1);
    }
}

// 运行初始化
initDatabase();
