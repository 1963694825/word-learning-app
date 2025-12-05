const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(
    config.database.database,
    config.database.username,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect,
        timezone: config.database.timezone,
        pool: config.database.pool,
        logging: config.database.logging
    }
);

// 测试数据库连接
sequelize.authenticate()
    .then(() => {
        console.log('✅ 数据库连接成功');
    })
    .catch(err => {
        console.error('❌ 数据库连接失败:', err);
    });

module.exports = sequelize;
