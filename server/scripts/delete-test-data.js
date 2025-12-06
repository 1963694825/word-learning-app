const { sequelize, Word, Book, BookWord } = require('../src/models');

/**
 * 删除测试数据
 */
async function deleteTestData() {
    try {
        console.log('🗑️  开始删除测试数据...\n');

        // 1. 测试数据库连接
        console.log('📡 测试数据库连接...');
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功\n');

        // 2. 查找测试词书
        console.log('🔍 查找测试词书...');
        const testBookNames = ['基础词汇', '进阶词汇', '测试词书'];

        const testBooks = await Book.findAll({
            where: {
                name: testBookNames
            }
        });

        if (testBooks.length === 0) {
            console.log('⚠️  未找到测试词书');
            process.exit(0);
        }

        console.log(`找到 ${testBooks.length} 个测试词书:`);
        testBooks.forEach(book => {
            console.log(`   - ${book.name} (ID: ${book.id})`);
        });
        console.log('');

        // 3. 删除词书-单词关联
        console.log('🗑️  删除词书-单词关联...');
        const bookIds = testBooks.map(b => b.id);

        const deletedBookWords = await BookWord.destroy({
            where: {
                book_id: bookIds
            }
        });
        console.log(`✅ 删除了 ${deletedBookWords} 条关联记录\n`);

        // 4. 删除词书
        console.log('🗑️  删除词书...');
        const deletedBooks = await Book.destroy({
            where: {
                id: bookIds
            }
        });
        console.log(`✅ 删除了 ${deletedBooks} 个词书\n`);

        // 5. 查找并删除孤立的单词(没有关联到任何词书的单词)
        console.log('🔍 查找孤立的单词...');
        const [orphanWords] = await sequelize.query(`
            SELECT w.id, w.word 
            FROM words w 
            WHERE NOT EXISTS (
                SELECT 1 FROM book_words bw WHERE bw.word_id = w.id
            )
        `);

        if (orphanWords.length > 0) {
            console.log(`找到 ${orphanWords.length} 个孤立单词`);
            console.log('示例:');
            orphanWords.slice(0, 5).forEach(word => {
                console.log(`   - ${word.word} (ID: ${word.id})`);
            });
            console.log('');

            console.log('🗑️  删除孤立的单词...');
            const orphanWordIds = orphanWords.map(w => w.id);
            const deletedWords = await Word.destroy({
                where: {
                    id: orphanWordIds
                }
            });
            console.log(`✅ 删除了 ${deletedWords} 个孤立单词\n`);
        } else {
            console.log('✅ 没有孤立的单词\n');
        }

        // 6. 验证删除结果
        console.log('🔍 验证删除结果...');
        console.log('═'.repeat(50));

        const wordCount = await Word.count();
        const bookCount = await Book.count();
        const bookWordCount = await BookWord.count();

        console.log(`   单词总数: ${wordCount}`);
        console.log(`   词书总数: ${bookCount}`);
        console.log(`   关联记录: ${bookWordCount}`);
        console.log('═'.repeat(50));

        // 7. 显示剩余的词书
        console.log('\n📚 剩余的词书:');
        const remainingBooks = await Book.findAll({
            attributes: ['id', 'name', 'word_count', 'difficulty_level', 'category'],
            order: [['difficulty_level', 'ASC']]
        });

        if (remainingBooks.length > 0) {
            console.table(remainingBooks.map(b => ({
                ID: b.id,
                名称: b.name,
                单词数: b.word_count,
                难度: b.difficulty_level,
                分类: b.category
            })));
        } else {
            console.log('   (无)');
        }

        console.log('\n✅ 测试数据删除完成!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ 删除失败:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// 运行删除
deleteTestData();
