const { sequelize } = require('../src/models');

async function checkLearnRecords() {
    try {
        await sequelize.authenticate();

        // 检查learn_records表
        const [count] = await sequelize.query('SELECT COUNT(*) as count FROM learn_records');
        console.log(`learn_records 表记录数: ${count[0].count}`);

        if (count[0].count > 0) {
            const [data] = await sequelize.query(`
                SELECT book_id, COUNT(*) as count 
                FROM learn_records 
                GROUP BY book_id 
                ORDER BY book_id
            `);
            console.log('\nbook_id 分布:');
            console.table(data);
        } else {
            console.log('✅ learn_records 表为空,无需更新');
        }

        // 检查book_words表
        const [bookWordsData] = await sequelize.query(`
            SELECT book_id, COUNT(*) as count 
            FROM book_words 
            GROUP BY book_id 
            ORDER BY book_id
        `);
        console.log('\nbook_words 表的 book_id 分布:');
        console.table(bookWordsData);

        process.exit(0);
    } catch (error) {
        console.error('错误:', error.message);
        process.exit(1);
    }
}

checkLearnRecords();
