const { sequelize, Word, Book, BookWord } = require('../src/models');

/**
 * 重新排序词书ID
 * 按照难度等级从低到高重新分配ID
 */
async function reorderBookIds() {
    try {
        console.log('🔄 开始重新排序词书ID...\n');

        // 1. 测试数据库连接
        console.log('📡 测试数据库连接...');
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功\n');

        // 2. 获取所有词书,按难度等级排序
        console.log('📚 获取所有词书...');
        const books = await Book.findAll({
            order: [['difficulty_level', 'ASC'], ['id', 'ASC']]
        });

        console.log(`找到 ${books.length} 个词书:`);
        books.forEach((book, index) => {
            console.log(`   ${index + 1}. ${book.name} (当前ID: ${book.id}, 难度: ${book.difficulty_level})`);
        });
        console.log('');

        // 3. 定义新的ID映射
        const idMapping = {};
        books.forEach((book, index) => {
            idMapping[book.id] = index + 1;
        });

        console.log('📋 ID映射关系:');
        books.forEach((book, index) => {
            console.log(`   ${book.name}: ${book.id} → ${index + 1}`);
        });
        console.log('');

        // 4. 开始事务
        console.log('🔄 开始更新ID...');
        const transaction = await sequelize.transaction();

        try {
            // 4.1 临时禁用外键检查
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });

            // 4.2 先将所有ID设置为临时值(负数)
            console.log('   步骤1: 设置临时ID...');
            for (const book of books) {
                await sequelize.query(
                    'UPDATE books SET id = ? WHERE id = ?',
                    { replacements: [-book.id, book.id], transaction }
                );
            }

            // 4.3 更新book_words表的book_id为临时值
            console.log('   步骤2: 更新关联表的临时ID...');
            for (const book of books) {
                await sequelize.query(
                    'UPDATE book_words SET book_id = ? WHERE book_id = ?',
                    { replacements: [-book.id, book.id], transaction }
                );
            }

            // 4.4 将临时ID更新为新ID
            console.log('   步骤3: 设置新ID...');
            for (const book of books) {
                const newId = idMapping[book.id];
                await sequelize.query(
                    'UPDATE books SET id = ? WHERE id = ?',
                    { replacements: [newId, -book.id], transaction }
                );
            }

            // 4.5 更新book_words表的book_id为新ID
            console.log('   步骤4: 更新关联表的新ID...');
            for (const book of books) {
                const newId = idMapping[book.id];
                await sequelize.query(
                    'UPDATE book_words SET book_id = ? WHERE book_id = ?',
                    { replacements: [newId, -book.id], transaction }
                );
            }

            // 4.6 重置自增ID
            console.log('   步骤5: 重置自增ID...');
            const maxId = books.length;
            await sequelize.query(
                `ALTER TABLE books AUTO_INCREMENT = ${maxId + 1}`,
                { transaction }
            );

            // 4.7 恢复外键检查
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });

            // 提交事务
            await transaction.commit();
            console.log('✅ ID更新完成\n');

        } catch (error) {
            // 回滚事务
            await transaction.rollback();
            throw error;
        }

        // 5. 验证结果
        console.log('🔍 验证结果...');
        console.log('═'.repeat(60));

        const updatedBooks = await Book.findAll({
            attributes: ['id', 'name', 'word_count', 'difficulty_level', 'category'],
            order: [['id', 'ASC']]
        });

        console.table(updatedBooks.map(b => ({
            ID: b.id,
            名称: b.name,
            单词数: b.word_count,
            难度: b.difficulty_level,
            分类: b.category
        })));

        // 6. 验证关联数据
        console.log('\n🔗 验证词书-单词关联:');
        for (const book of updatedBooks) {
            const count = await BookWord.count({ where: { book_id: book.id } });
            console.log(`   ${book.name} (ID: ${book.id}): ${count} 个单词`);
        }

        console.log('\n✅ 词书ID重排完成!');
        console.log('   小学英语现在的ID是: 1');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ 重排失败:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// 运行重排
reorderBookIds();
