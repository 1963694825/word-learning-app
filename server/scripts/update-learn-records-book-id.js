const { sequelize, Book } = require('../src/models');

/**
 * 更新learn_records表的book_id
 * 根据词书名称匹配新的ID
 */
async function updateLearnRecordsBookId() {
    try {
        console.log('🔄 开始更新 learn_records 表的 book_id...\n');

        // 1. 测试数据库连接
        console.log('📡 测试数据库连接...');
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功\n');

        // 2. 检查learn_records表是否有数据
        console.log('🔍 检查 learn_records 表...');
        const [countResult] = await sequelize.query('SELECT COUNT(*) as count FROM learn_records');
        const recordCount = countResult[0].count;

        console.log(`   找到 ${recordCount} 条学习记录`);

        if (recordCount === 0) {
            console.log('✅ learn_records 表为空,无需更新');
            process.exit(0);
        }

        // 3. 获取当前的book_id分布
        console.log('\n📊 当前 book_id 分布:');
        const [currentDistribution] = await sequelize.query(`
            SELECT book_id, COUNT(*) as count 
            FROM learn_records 
            WHERE book_id IS NOT NULL
            GROUP BY book_id 
            ORDER BY book_id
        `);

        if (currentDistribution.length > 0) {
            console.table(currentDistribution.map(d => ({
                词书ID: d.book_id,
                记录数: d.count
            })));
        } else {
            console.log('   所有记录的 book_id 都为 NULL');
        }

        // 4. 获取当前的词书列表(已经是新ID)
        console.log('\n📚 当前词书列表:');
        const books = await Book.findAll({
            attributes: ['id', 'name'],
            order: [['id', 'ASC']]
        });

        console.table(books.map(b => ({
            ID: b.id,
            名称: b.name
        })));

        // 5. 创建旧ID到新ID的映射
        // 注意: 由于我们已经在reorder-book-ids.js中更新了books表,
        // 这里的learn_records可能还保留着旧的book_id
        // 我们需要通过book_words表来找到正确的映射关系

        console.log('\n🔄 开始更新...');

        // 策略: 通过word_id找到对应的book_id
        // learn_records.word_id -> book_words.word_id -> book_words.book_id (新ID)

        const transaction = await sequelize.transaction();

        try {
            // 更新策略: 使用子查询更新
            const [updateResult] = await sequelize.query(`
                UPDATE learn_records lr
                INNER JOIN (
                    SELECT DISTINCT word_id, book_id 
                    FROM book_words
                ) bw ON lr.word_id = bw.word_id
                SET lr.book_id = bw.book_id
                WHERE lr.book_id IS NOT NULL OR lr.book_id != bw.book_id
            `, { transaction });

            await transaction.commit();

            console.log(`✅ 更新完成`);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        // 6. 验证更新结果
        console.log('\n🔍 验证更新结果:');
        const [newDistribution] = await sequelize.query(`
            SELECT lr.book_id, b.name, COUNT(*) as count 
            FROM learn_records lr
            LEFT JOIN books b ON lr.book_id = b.id
            WHERE lr.book_id IS NOT NULL
            GROUP BY lr.book_id, b.name
            ORDER BY lr.book_id
        `);

        if (newDistribution.length > 0) {
            console.table(newDistribution.map(d => ({
                词书ID: d.book_id,
                词书名称: d.name || '(未找到)',
                记录数: d.count
            })));
        }

        // 7. 检查是否有无效的book_id
        const [invalidRecords] = await sequelize.query(`
            SELECT COUNT(*) as count
            FROM learn_records lr
            WHERE lr.book_id IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM books b WHERE b.id = lr.book_id)
        `);

        if (invalidRecords[0].count > 0) {
            console.log(`\n⚠️  警告: 发现 ${invalidRecords[0].count} 条记录的 book_id 无效`);
        } else {
            console.log('\n✅ 所有记录的 book_id 都有效');
        }

        console.log('\n✅ learn_records 表的 book_id 更新完成!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ 更新失败:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// 运行更新
updateLearnRecordsBookId();
