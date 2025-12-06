const { sequelize } = require('../src/models');

/**
 * 检查所有与词书ID相关的表和字段
 */
async function checkBookRelatedTables() {
    try {
        console.log('🔍 检查与词书ID相关的表...\n');

        // 1. 测试数据库连接
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功\n');

        // 2. 查找所有包含book相关字段的表
        console.log('📋 查找包含book相关字段的表:');
        const [columns] = await sequelize.query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_KEY
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND (COLUMN_NAME LIKE '%book%' OR COLUMN_NAME LIKE '%Book%')
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);

        console.table(columns.map(col => ({
            表名: col.TABLE_NAME,
            字段名: col.COLUMN_NAME,
            类型: col.DATA_TYPE,
            键: col.COLUMN_KEY
        })));

        // 3. 查找所有外键关系
        console.log('\n🔗 查找外键关系:');
        const [foreignKeys] = await sequelize.query(`
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME IS NOT NULL
            AND (REFERENCED_TABLE_NAME = 'books' OR TABLE_NAME LIKE '%book%')
            ORDER BY TABLE_NAME
        `);

        if (foreignKeys.length > 0) {
            console.table(foreignKeys.map(fk => ({
                表名: fk.TABLE_NAME,
                字段: fk.COLUMN_NAME,
                引用表: fk.REFERENCED_TABLE_NAME,
                引用字段: fk.REFERENCED_COLUMN_NAME
            })));
        } else {
            console.log('   未找到外键关系');
        }

        // 4. 检查每个相关表的数据
        console.log('\n📊 检查相关表的数据:');

        const tablesToCheck = [...new Set(columns.map(c => c.TABLE_NAME))];

        for (const tableName of tablesToCheck) {
            const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`   ${tableName}: ${count[0].count} 条记录`);

            // 如果表中有book_id字段,显示示例数据
            const hasBookId = columns.some(c => c.TABLE_NAME === tableName && c.COLUMN_NAME === 'book_id');
            if (hasBookId && count[0].count > 0) {
                const [sample] = await sequelize.query(`
                    SELECT book_id, COUNT(*) as count 
                    FROM ${tableName} 
                    GROUP BY book_id 
                    ORDER BY book_id
                `);
                console.log(`      book_id分布:`, sample.map(s => `ID ${s.book_id}: ${s.count}条`).join(', '));
            }
        }

        // 5. 检查learn_records表(如果存在)
        const hasLearnRecords = tablesToCheck.includes('learn_records');
        if (hasLearnRecords) {
            console.log('\n📚 learn_records 表详情:');
            const [learnRecords] = await sequelize.query(`
                SELECT book_id, COUNT(*) as count 
                FROM learn_records 
                GROUP BY book_id 
                ORDER BY book_id
            `);

            if (learnRecords.length > 0) {
                console.table(learnRecords.map(lr => ({
                    词书ID: lr.book_id,
                    学习记录数: lr.count
                })));
            } else {
                console.log('   无学习记录');
            }
        }

        // 6. 检查wordbooks表(如果存在)
        const hasWordbooks = tablesToCheck.includes('wordbooks');
        if (hasWordbooks) {
            console.log('\n📖 wordbooks 表详情:');
            const [wordbooks] = await sequelize.query(`
                SELECT id, name, book_id 
                FROM wordbooks 
                ORDER BY id
            `);

            if (wordbooks.length > 0) {
                console.table(wordbooks.map(wb => ({
                    ID: wb.id,
                    名称: wb.name,
                    关联词书ID: wb.book_id
                })));
            } else {
                console.log('   无生词本');
            }
        }

        console.log('\n✅ 检查完成!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ 检查失败:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// 运行检查
checkBookRelatedTables();
