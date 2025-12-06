const { sequelize, Word, Book, BookWord } = require('../src/models');

/**
 * 验证数据库中的数据
 */
async function verifyData() {
    try {
        console.log('🔍 开始验证数据...\n');
        console.log('═'.repeat(60));

        // 1. 统计总数
        const wordCount = await Word.count();
        const bookCount = await Book.count();
        const bookWordCount = await BookWord.count();

        console.log('📊 数据统计:');
        console.log(`   单词总数: ${wordCount}`);
        console.log(`   词书总数: ${bookCount}`);
        console.log(`   关联记录: ${bookWordCount}`);
        console.log('═'.repeat(60));

        // 2. 显示每个词书的详细信息
        console.log('\n📚 词书详情:\n');
        const books = await Book.findAll({
            attributes: ['id', 'name', 'word_count', 'difficulty_level', 'category'],
            order: [['difficulty_level', 'ASC']]
        });

        if (books.length === 0) {
            console.log('   ⚠️  未找到任何词书');
            console.log('   请先运行导入脚本: node scripts/import-dicts.js');
        } else {
            // 使用表格显示
            console.table(books.map(b => ({
                ID: b.id,
                名称: b.name,
                单词数: b.word_count,
                难度: b.difficulty_level,
                分类: b.category
            })));

            // 3. 验证每个词书的关联数据
            console.log('\n🔗 验证词书-单词关联:\n');
            for (const book of books) {
                const actualCount = await BookWord.count({ where: { book_id: book.id } });
                const status = actualCount === book.word_count ? '✅' : '⚠️';
                console.log(`   ${status} ${book.name}: ${actualCount}/${book.word_count}`);
            }
        }

        // 4. 检查数据完整性
        console.log('\n\n🔍 数据完整性检查:\n');

        // 检查是否有单词没有关联到任何词书
        const orphanWords = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM words w 
            WHERE NOT EXISTS (
                SELECT 1 FROM book_words bw WHERE bw.word_id = w.id
            )
        `, { type: sequelize.QueryTypes.SELECT });

        console.log(`   未关联词书的单词: ${orphanWords[0].count}`);

        // 检查是否有词书没有单词
        const emptyBooks = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM books b 
            WHERE NOT EXISTS (
                SELECT 1 FROM book_words bw WHERE bw.book_id = b.id
            )
        `, { type: sequelize.QueryTypes.SELECT });

        console.log(`   没有单词的词书: ${emptyBooks[0].count}`);

        // 5. 显示一些示例单词
        console.log('\n\n📝 示例单词 (前5个):\n');
        const sampleWords = await Word.findAll({
            limit: 5,
            attributes: ['word', 'phonetic_us', 'phonetic_uk']
        });

        sampleWords.forEach((word, index) => {
            console.log(`   ${index + 1}. ${word.word}`);
            console.log(`      美式: ${word.phonetic_us}`);
            console.log(`      英式: ${word.phonetic_uk}`);
        });

        console.log('\n═'.repeat(60));
        console.log('✅ 数据验证完成!\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ 验证失败:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// 运行验证
verifyData();
