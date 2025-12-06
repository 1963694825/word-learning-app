// 检查用户数据关联的脚本
const { User, LearnRecord } = require('./src/models');

async function checkUserData() {
    try {
        // 1. 查看所有用户
        const users = await User.findAll({
            attributes: ['id', 'openid', 'nickname', 'total_learn_days', 'continuous_days']
        });

        console.log('\n=== 所有用户 ===');
        users.forEach(user => {
            console.log(`ID: ${user.id}, 昵称: ${user.nickname}, OpenID: ${user.openid ? user.openid.substring(0, 10) + '...' : 'null'}`);
            console.log(`  累计天数: ${user.total_learn_days}, 连续天数: ${user.continuous_days}`);
        });

        // 2. 查看每个用户的学习记录数
        console.log('\n=== 每个用户的学习记录数 ===');
        for (const user of users) {
            const count = await LearnRecord.count({
                where: { user_id: user.id }
            });
            console.log(`用户 ${user.nickname} (ID: ${user.id}): ${count} 条记录`);
        }

        // 3. 检查是否有学习记录没有关联用户
        const orphanRecords = await LearnRecord.count({
            where: { user_id: null }
        });
        console.log(`\n未关联用户的学习记录: ${orphanRecords} 条`);

        process.exit(0);
    } catch (error) {
        console.error('检查失败:', error);
        process.exit(1);
    }
}

checkUserData();
