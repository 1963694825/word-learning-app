const { sequelize } = require('../src/models');

/**
 * 检查数据库表结构
 */
async function checkDatabaseStructure() {
    try {
        console.log('🔍 检查数据库表结构...\n');
        console.log('═'.repeat(60));

        // 1. 测试数据库连接
        console.log('📡 测试数据库连接...');
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功\n');

        // 2. 获取所有表
        const [tables] = await sequelize.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = DATABASE()
        `);

        console.log(`📋 当前数据库中的表 (共 ${tables.length} 个):`);
        tables.forEach((table, index) => {
            console.log(`   ${index + 1}. ${table.TABLE_NAME}`);
        });
        console.log('');

        // 3. 检查必需的表
        const requiredTables = ['words', 'books', 'book_words', 'users', 'learn_records'];
        const existingTableNames = tables.map(t => t.TABLE_NAME);

        console.log('🔍 检查必需的表:');
        const missingTables = [];

        for (const tableName of requiredTables) {
            const exists = existingTableNames.includes(tableName);
            const status = exists ? '✅' : '❌';
            console.log(`   ${status} ${tableName}`);
            if (!exists) {
                missingTables.push(tableName);
            }
        }
        console.log('');

        // 4. 检查表结构
        if (existingTableNames.includes('words')) {
            console.log('📊 words 表结构:');
            const [columns] = await sequelize.query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'words'
                ORDER BY ORDINAL_POSITION
            `);

            console.table(columns.map(col => ({
                字段名: col.COLUMN_NAME,
                类型: col.DATA_TYPE,
                允许NULL: col.IS_NULLABLE,
                键: col.COLUMN_KEY
            })));
        }

        if (existingTableNames.includes('books')) {
            console.log('\n📊 books 表结构:');
            const [columns] = await sequelize.query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'books'
                ORDER BY ORDINAL_POSITION
            `);

            console.table(columns.map(col => ({
                字段名: col.COLUMN_NAME,
                类型: col.DATA_TYPE,
                允许NULL: col.IS_NULLABLE,
                键: col.COLUMN_KEY
            })));
        }

        if (existingTableNames.includes('book_words')) {
            console.log('\n📊 book_words 表结构:');
            const [columns] = await sequelize.query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'book_words'
                ORDER BY ORDINAL_POSITION
            `);

            console.table(columns.map(col => ({
                字段名: col.COLUMN_NAME,
                类型: col.DATA_TYPE,
                允许NULL: col.IS_NULLABLE,
                键: col.COLUMN_KEY
            })));
        }

        // 5. 统计现有数据
        console.log('\n📊 现有数据统计:');

        if (existingTableNames.includes('words')) {
            const [wordCount] = await sequelize.query('SELECT COUNT(*) as count FROM words');
            console.log(`   words: ${wordCount[0].count} 条记录`);
        }

        if (existingTableNames.includes('books')) {
            const [bookCount] = await sequelize.query('SELECT COUNT(*) as count FROM books');
            console.log(`   books: ${bookCount[0].count} 条记录`);
        }

        if (existingTableNames.includes('book_words')) {
            const [bookWordCount] = await sequelize.query('SELECT COUNT(*) as count FROM book_words');
            console.log(`   book_words: ${bookWordCount[0].count} 条记录`);
        }

        // 6. 总结
        console.log('\n═'.repeat(60));
        if (missingTables.length > 0) {
            console.log('⚠️  缺少以下表:');
            missingTables.forEach(table => console.log(`   - ${table}`));
            console.log('\n建议: 运行 npm run init-db 或使用 sequelize.sync() 创建表');
        } else {
            console.log('✅ 所有必需的表都存在');
        }
        console.log('═'.repeat(60));

        process.exit(0);

    } catch (error) {
        console.error('\n❌ 检查失败:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// 运行检查
checkDatabaseStructure();
