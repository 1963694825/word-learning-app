const { sequelize, Book, BookWord } = require('../src/models');

async function checkWordCounts() {
    try {
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功\n');

        const books = await Book.findAll({
            attributes: ['id', 'name', 'word_count'],
            order: [['id', 'ASC']]
        });

        console.log('📊 词书单词数对比:\n');
        console.log('ID | 词书名称 | Books表word_count | BookWord表实际数量');
        console.log('-'.repeat(70));

        for (const book of books) {
            const actualCount = await BookWord.count({
                where: { book_id: book.id }
            });

            const match = book.word_count === actualCount ? '✅' : '❌';
            console.log(`${book.id} | ${book.name.padEnd(12)} | ${String(book.word_count).padEnd(18)} | ${actualCount} ${match}`);
        }

        console.log('\n');
        process.exit(0);
    } catch (error) {
        console.error('错误:', error);
        process.exit(1);
    }
}

checkWordCounts();
