#!/bin/bash

# 单词学习小程序后端一键部署脚本
# 适用于 CentOS 7.x

set -e  # 遇到错误立即退出

echo "========================================="
echo "  单词学习小程序后端一键部署脚本"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用root用户运行此脚本${NC}"
    exit 1
fi

echo -e "${GREEN}步骤 1/10: 安装Node.js 16.x${NC}"
if command -v node &> /dev/null; then
    echo "Node.js 已安装: $(node -v)"
else
    echo "正在安装Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
    yum install -y nodejs
    echo "Node.js 安装完成: $(node -v)"
fi

echo ""
echo -e "${GREEN}步骤 2/10: 安装PM2${NC}"
if command -v pm2 &> /dev/null; then
    echo "PM2 已安装: $(pm2 -v)"
else
    echo "正在安装PM2..."
    npm install -g pm2
    echo "PM2 安装完成"
fi

echo ""
echo -e "${GREEN}步骤 3/10: 安装MySQL 8.0${NC}"
if command -v mysql &> /dev/null; then
    echo "MySQL 已安装"
else
    echo "正在安装MySQL..."
    wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
    rpm -ivh mysql80-community-release-el7-3.noarch.rpm
    yum install -y mysql-server
    systemctl start mysqld
    systemctl enable mysqld
    echo "MySQL 安装完成"
    
    # 获取临时密码
    TEMP_PASS=$(grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')
    echo -e "${YELLOW}MySQL临时密码: $TEMP_PASS${NC}"
    echo -e "${YELLOW}请记录此密码,稍后需要使用${NC}"
fi

echo ""
echo -e "${GREEN}步骤 4/10: 安装Git${NC}"
if command -v git &> /dev/null; then
    echo "Git 已安装"
else
    yum install -y git
    echo "Git 安装完成"
fi

echo ""
echo -e "${GREEN}步骤 5/10: 克隆项目代码${NC}"
if [ -d "/var/www/word-learning-app" ]; then
    echo "项目目录已存在,更新代码..."
    cd /var/www/word-learning-app
    git pull
else
    echo "正在克隆项目..."
    mkdir -p /var/www
    cd /var/www
    git clone https://github.com/19636947/word-learning-app.git
fi

cd /var/www/word-learning-app/server

echo ""
echo -e "${GREEN}步骤 6/10: 安装项目依赖${NC}"
npm install --production

echo ""
echo -e "${GREEN}步骤 7/10: 配置环境变量${NC}"
if [ ! -f ".env" ]; then
    echo "创建.env文件..."
    cp .env.example .env
    
    # 生成随机JWT密钥
    JWT_SECRET=$(openssl rand -base64 32)
    
    # 修改.env文件
    sed -i "s/NODE_ENV=development/NODE_ENV=production/" .env
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    
    echo -e "${YELLOW}请手动编辑.env文件,设置以下内容:${NC}"
    echo "1. DB_PASSWORD (MySQL密码)"
    echo "2. WECHAT_APP_ID 和 WECHAT_APP_SECRET"
    echo ""
    echo -e "${YELLOW}编辑命令: vi /var/www/word-learning-app/server/.env${NC}"
    echo ""
    read -p "按回车键继续..."
else
    echo ".env文件已存在"
fi

echo ""
echo -e "${GREEN}步骤 8/10: 配置MySQL${NC}"
echo -e "${YELLOW}请手动执行以下MySQL配置:${NC}"
echo ""
echo "mysql -u root -p"
echo "ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourNewPassword@123';"
echo "CREATE DATABASE word_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "EXIT;"
echo ""
echo "然后导入数据:"
echo "mysql -u root -p word_learning < /var/www/word-learning-app/server/database/schema.sql"
echo "mysql -u root -p word_learning < /var/www/word-learning-app/server/database/seed.sql"
echo ""
read -p "MySQL配置完成后按回车键继续..."

echo ""
echo -e "${GREEN}步骤 9/10: 启动服务${NC}"
# 停止旧服务
pm2 delete word-learning-api 2>/dev/null || true

# 启动新服务
pm2 start src/app.js --name word-learning-api
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}步骤 10/10: 配置防火墙${NC}"
firewall-cmd --permanent --add-port=3000/tcp 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true

echo ""
echo "========================================="
echo -e "${GREEN}部署完成!${NC}"
echo "========================================="
echo ""
echo "服务状态:"
pm2 status
echo ""
echo "API地址: http://$(hostname -I | awk '{print $1}'):3000/api/v1"
echo ""
echo "常用命令:"
echo "  查看日志: pm2 logs word-learning-api"
echo "  重启服务: pm2 restart word-learning-api"
echo "  停止服务: pm2 stop word-learning-api"
echo ""
echo -e "${YELLOW}注意事项:${NC}"
echo "1. 请确保已正确配置.env文件"
echo "2. 请确保MySQL数据库已初始化"
echo "3. 生产环境建议配置Nginx和HTTPS"
echo ""
