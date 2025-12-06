const { sequelize, Word, Book, BookWord } = require('../src/models');
const fs = require('fs');
const path = require('path');

// 词库文件路径
const DICTS_DIR = path.join(__dirname, '../../dicts');
const BOOKS_CONFIG_PATH = path.join(__dirname, '../data/books-config.json');

/**
 * 导入单个词库
 * @param {string} bookKey - 词库key,如 'cet4', 'primary_school'
 */
async function importSingleDict(bookKey) {
    try {
        console.log(`🚀 开始导入词库: ${bookKey}\n`);

        // 1. 读取词书配置
        const booksConfig = JSON.parse(fs.readFileSync(BOOKS_CONFIG_PATH, 'utf8'));
        const bookConfig = booksConfig.books.find(b => b.key === bookKey);

        if (!bookConfig) {
            console.error(`❌ 未找到词书配置: ${bookKey}`);
            console.log('可用的词书:');
            booksConfig.books.forEach(b => console.log(`  - ${b.key}`));
            process.exit(1);
        }

        console.log(`📖 词书: ${bookConfig.name}`);

        // 2. 读取词库文件
        const dictFilePath = path.join(DICTS_DIR, `${bookKey}.json`);

        if (!fs.existsSync(dictFilePath)) {
            console.error(`❌ 文件不存在: ${dictFilePath}`);
            process.exit(1);
        }

        const dictData = JSON.parse(fs.readFileSync(dictFilePath, 'utf8'));
        console.log(`📄 文件: ${bookKey}.json`);
        console.log(`📊 单词数量: ${dictData.total_words || dictData.words.length}\n`);

        // 3. 检查词书是否已存在
        let book = await Book.findOne({ where: { name: bookConfig.name } });

        if (book) {
            console.log(`⚠️  词书已存在 (ID: ${book.id})`);
            console.log('是否要重新导入? 这将删除现有数据。');
            console.log('请手动删除词书后重新运行此脚本。');
            process.exit(0);
        }

        // 4. 创建词书记录
        console.log('📚 创建词书记录...');
        book = await Book.create({
            name: bookConfig.name,
            description: dictData.description || bookConfig.description,
            word_count: dictData.words.length,
            difficulty_level: bookConfig.difficulty_level,
            category: bookConfig.category,
            is_builtin: bookConfig.is_builtin
        });
        console.log(`✅ 词书创建成功 (ID: ${book.id})\n`);

        // 5. 导入单词
        console.log('📝 导入单词...');
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
                    phonetic_us: wordData.phonetic_us,
                    phonetic_uk: wordData.phonetic_uk,
                    definitions: wordData.definitions,
                    examples: wordData.examples || []
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
            if ((i + 1) % 50 === 0 || i === dictData.words.length - 1) {
                const progress = ((i + 1) / dictData.words.length * 100).toFixed(1);
                process.stdout.write(`\r   进度: ${i + 1}/${dictData.words.length} (${progress}%)`);
            }
        }

        console.log('\n');
        console.log(`✅ 单词导入完成`);
        console.log(`   新增单词: ${newWordCount}`);
        console.log(`   已存在单词: ${existingWordCount}\n`);

        // 6. 验证数据
        console.log('🔍 验证数据...');
        const bookWordCount = await BookWord.count({ where: { book_id: book.id } });
        console.log(`   词书-单词关联: ${bookWordCount}`);
        console.log(`   预期数量: ${dictData.words.length}`);

        if (bookWordCount === dictData.words.length) {
            console.log('   ✅ 数据验证通过\n');
        } else {
            console.log('   ⚠️  数据数量不匹配\n');
        }

        console.log('🎉 词库导入完成!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ 导入失败:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// 解析命令行参数
const args = process.argv.slice(2);
const fileArg = args.find(arg => arg.startsWith('--file='));

if (!fileArg) {
    console.error('❌ 请指定词库文件');
    console.log('用法: node import-single-dict.js --file=<词库key>');
    console.log('示例: node import-single-dict.js --file=cet4');
    console.log('\n可用的词库:');
    console.log('  - primary_school (小学英语)');
    console.log('  - middle_school (初中英语)');
    console.log('  - high_school (高中英语)');
    console.log('  - cet4 (大学英语四级)');
    console.log('  - cet6 (大学英语六级)');
    console.log('  - ielts (雅思)');
    console.log('  - toefl (托福)');
    process.exit(1);
}

const bookKey = fileArg.split('=')[1];
importSingleDict(bookKey);
