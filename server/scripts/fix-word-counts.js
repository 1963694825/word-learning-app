const { sequelize, Book, BookWord } = require('../src/models');

async function fixWordCounts() {
    try {
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功\n');

        const books = await Book.findAll({
            order: [['id', 'ASC']]
        });

        console.log('🔄 开始修复词书单词数...\n');

        for (const book of books) {
            const actualCount = await BookWord.count({
                where: { book_id: book.id }
            });

            if (book.word_count !== actualCount) {
                console.log(`📝 ${book.name}:`);
                console.log(`   旧值: ${book.word_count}`);
                console.log(`   新值: ${actualCount}`);

                await book.update({ word_count: actualCount });
                console.log(`   ✅ 已更新\n`);
            } else {
                console.log(`✅ ${book.name}: ${actualCount} 词 (无需更新)`);
            }
        }

        console.log('\n✅ 所有词书单词数已修复!');

        // 验证结果
        console.log('\n📊 修复后的数据:');
        const updatedBooks = await Book.findAll({
            attributes: ['id', 'name', 'word_count'],
            order: [['id', 'ASC']]
        });

        console.table(updatedBooks.map(b => ({
            ID: b.id,
            名称: b.name,
            单词数: b.word_count
        })));

        process.exit(0);
    } catch (error) {
        console.error('❌ 修复失败:', error);
        process.exit(1);
    }
}

fixWordCounts();
