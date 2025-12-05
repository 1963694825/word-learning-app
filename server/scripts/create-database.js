const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
    let connection;

    try {
        // 连接MySQL服务器(不指定数据库)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('✅ 已连接到MySQL服务器');

        // 创建数据库
        const dbName = process.env.DB_NAME || 'word_learning';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

        console.log(`✅ 数据库 "${dbName}" 创建成功`);

        // 验证数据库
        const [databases] = await connection.query(`SHOW DATABASES LIKE '${dbName}'`);
        if (databases.length > 0) {
            console.log(`✅ 数据库验证成功`);
        }

    } catch (error) {
        console.error('❌ 创建数据库失败:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// 运行脚本
createDatabase();
