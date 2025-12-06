const { sequelize, Word, Book, BookWord } = require('../src/models');
const fs = require('fs');
const path = require('path');

// 词库文件路径
const DICTS_DIR = path.join(__dirname, '../../dicts');
const BOOKS_CONFIG_PATH = path.join(__dirname, '../data/books-config.json');

/**
 * 导入所有词库数据(保留现有数据)
 */
async function importAllDicts() {
    try {
        console.log('🚀 开始导入词库数据...\n');

        // 1. 测试数据库连接
        console.log('📡 测试数据库连接...');
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功\n');

        // 2. 读取词书配置
        console.log('📖 读取词书配置...');
        const booksConfig = JSON.parse(fs.readFileSync(BOOKS_CONFIG_PATH, 'utf8'));
        console.log(`✅ 找到 ${booksConfig.books.length} 个词书配置\n`);

        // 3. 同步数据库表结构(不删除现有数据)
        console.log('📋 同步数据库表结构...');
        await sequelize.sync({ alter: false }); // alter: false 保留现有数据
        console.log('✅ 表结构检查完成\n');

        // 统计信息
        let totalNewWords = 0;
        let totalNewBooks = 0;
        let totalSkippedBooks = 0;

        // 4. 遍历每个词书配置
        for (const bookConfig of booksConfig.books) {
            console.log(`\n📚 处理词书: ${bookConfig.name}`);
            console.log('─'.repeat(50));

            // 检查词书是否已存在
            const existingBook = await Book.findOne({ where: { name: bookConfig.name } });
            if (existingBook) {
                console.log(`   ⚠️  词书已存在,跳过 (ID: ${existingBook.id})`);
                totalSkippedBooks++;
                continue;
            }

            // 读取词库文件
            const dictFilePath = path.join(DICTS_DIR, `${bookConfig.key}.json`);

            if (!fs.existsSync(dictFilePath)) {
                console.log(`   ⚠️  文件不存在: ${dictFilePath}`);
                continue;
            }

            const dictData = JSON.parse(fs.readFileSync(dictFilePath, 'utf8'));
            console.log(`   文件: ${bookConfig.key}.json`);
            console.log(`   单词数量: ${dictData.total_words || dictData.words.length}`);

            // 创建词书记录
            const book = await Book.create({
                name: bookConfig.name,
                description: dictData.description || bookConfig.description,
                word_count: dictData.words.length,
                difficulty_level: bookConfig.difficulty_level,
                category: bookConfig.category,
                is_builtin: bookConfig.is_builtin
            });
            console.log(`   ✅ 词书创建成功 (ID: ${book.id})`);
            totalNewBooks++;

            // 批量导入单词
            let newWordCount = 0;
            let existingWordCount = 0;

            for (let i = 0; i < dictData.words.length; i++) {
                const wordData = dictData.words[i];

                // 检查单词是否已存在
                let word = await Word.findOne({ where: { word: wordData.word } });

                if (!word) {
                    // 创建新单词
                    word = await Word.create({
                        word: wordData.word,
                        phonetic_us: wordData.phonetic_us || '',
                        phonetic_uk: wordData.phonetic_uk || '',
                        definitions: wordData.definitions || [],
                        examples: wordData.examples || [],
                        root: null,
                        synonyms: null,
                        frequency: null,
                        difficulty: null,
                        audio_url: null
                    });
                    newWordCount++;
                } else {
                    existingWordCount++;
                }

                // 创建词书-单词关联
                await BookWord.create({
                    book_id: book.id,
                    word_id: word.id,
                    word_order: i + 1
                });

                // 进度显示
                if ((i + 1) % 100 === 0 || i === dictData.words.length - 1) {
                    process.stdout.write(`\r   导入进度: ${i + 1}/${dictData.words.length}`);
                }
            }

            console.log(`\n   ✅ 单词导入完成`);
            console.log(`   新增单词: ${newWordCount}, 已存在: ${existingWordCount}`);

            totalNewWords += newWordCount;
        }

        // 5. 验证数据
        console.log('\n\n🔍 验证数据...');
        console.log('═'.repeat(50));
        const wordCount = await Word.count();
        const bookCount = await Book.count();
        const bookWordCount = await BookWord.count();

        console.log(`   单词总数: ${wordCount}`);
        console.log(`   词书总数: ${bookCount}`);
        console.log(`   关联记录: ${bookWordCount}`);
        console.log('═'.repeat(50));

        // 6. 显示每个词书的详细信息
        console.log('\n📊 词书详情:');
        const books = await Book.findAll({
            attributes: ['id', 'name', 'word_count', 'difficulty_level', 'category'],
            order: [['difficulty_level', 'ASC']]
        });

        console.table(books.map(b => ({
            ID: b.id,
            名称: b.name,
            单词数: b.word_count,
            难度: b.difficulty_level,
            分类: b.category
        })));

        console.log('\n📈 导入统计:');
        console.log(`   新增词书: ${totalNewBooks}`);
        console.log(`   跳过词书: ${totalSkippedBooks}`);
        console.log(`   新增单词: ${totalNewWords}`);

        console.log('\n🎉 词库数据导入完成!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ 导入失败:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// 运行导入
importAllDicts();
