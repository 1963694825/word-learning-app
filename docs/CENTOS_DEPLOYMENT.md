# CentOS 7.4 服务器部署指南

## 📋 服务器信息
- **系统**: CentOS 7.4 x64
- **管理工具**: 快卫士
- **项目**: 单词学习小程序后端

---

## 🚀 部署步骤

### 第一步: 连接服务器

```bash
# 使用SSH连接服务器
ssh root@your_server_ip

# 或使用快卫士提供的Web终端
```

### 第二步: 安装Node.js

```bash
# 1. 安装Node.js 16.x (推荐使用NodeSource仓库)
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# 2. 验证安装
node -v  # 应显示 v16.x.x
npm -v   # 应显示 8.x.x

# 3. 安装PM2进程管理器
npm install -g pm2
```

### 第三步: 安装MySQL

```bash
# 1. 下载MySQL Yum仓库
wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm

# 2. 安装MySQL Yum仓库
sudo rpm -ivh mysql80-community-release-el7-3.noarch.rpm

# 3. 安装MySQL服务器
sudo yum install -y mysql-server

# 4. 启动MySQL服务
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 5. 获取临时密码
sudo grep 'temporary password' /var/log/mysqld.log

# 6. 修改root密码
mysql -u root -p
# 输入临时密码后执行:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourNewPassword@123';
FLUSH PRIVILEGES;
EXIT;

# 7. 创建数据库
mysql -u root -p
CREATE DATABASE word_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 第四步: 上传项目代码

**方法1: 使用Git (推荐)**
```bash
# 1. 安装Git
sudo yum install -y git

# 2. 克隆项目
cd /var/www
git clone https://github.com/YOUR_USERNAME/word-learning-app.git
cd word-learning-app/server
```

**方法2: 使用FTP/SFTP**
```bash
# 使用FileZilla或WinSCP上传代码到服务器
# 目标路径: /var/www/word-learning-app
```

### 第五步: 配置项目

```bash
# 1. 进入项目目录
cd /var/www/word-learning-app/server

# 2. 安装依赖
npm install --production

# 3. 创建.env文件
cp .env.example .env
vi .env
```

**编辑.env文件内容:**
```env
NODE_ENV=production
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=word_learning
DB_USER=root
DB_PASSWORD=YourNewPassword@123

JWT_SECRET=your_random_secret_key_min_32_characters_long
JWT_EXPIRES_IN=7d

WECHAT_APP_ID=wx723464455b434f1b
WECHAT_APP_SECRET=8e6df7630d4187e02570b4582024ffea

API_DOC_ENABLED=false
```

按 `i` 进入编辑模式,编辑完成后按 `ESC`,输入 `:wq` 保存退出。

### 第六步: 初始化数据库

```bash
# 导入数据库结构和初始数据
mysql -u root -p word_learning < database/schema.sql
mysql -u root -p word_learning < database/seed.sql
```

### 第七步: 启动服务

```bash
# 使用PM2启动服务
pm2 start src/app.js --name word-learning-api

# 设置开机自启
pm2 startup
pm2 save

# 查看服务状态
pm2 status

# 查看日志
pm2 logs word-learning-api
```

### 第八步: 配置防火墙

```bash
# 1. 开放3000端口
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# 2. 验证端口开放
sudo firewall-cmd --list-ports

# 3. 测试API
curl http://localhost:3000/api/v1/books
```

### 第九步: 安装Nginx (可选,推荐)

```bash
# 1. 安装Nginx
sudo yum install -y nginx

# 2. 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 3. 创建配置文件
sudo vi /etc/nginx/conf.d/word-learning.conf
```

**Nginx配置内容:**
```nginx
server {
    listen 80;
    server_name your_domain.com;  # 替换为你的域名或IP

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 4. 测试配置
sudo nginx -t

# 5. 重启Nginx
sudo systemctl restart nginx

# 6. 开放80端口
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload
```

### 第十步: 配置HTTPS (必须)

```bash
# 1. 安装certbot
sudo yum install -y epel-release
sudo yum install -y certbot python2-certbot-nginx

# 2. 获取SSL证书
sudo certbot --nginx -d your_domain.com

# 3. 自动续期
sudo certbot renew --dry-run

# 4. 开放443端口
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

---

## ✅ 验证部署

### 1. 检查服务状态
```bash
# 查看PM2进程
pm2 status

# 查看服务日志
pm2 logs word-learning-api --lines 50

# 查看Nginx状态
sudo systemctl status nginx

# 查看MySQL状态
sudo systemctl status mysqld
```

### 2. 测试API
```bash
# 测试本地API
curl http://localhost:3000/api/v1/books

# 测试Nginx代理
curl http://your_server_ip/api/v1/books

# 测试HTTPS (如果已配置)
curl https://your_domain.com/api/v1/books
```

### 3. 检查数据库
```bash
mysql -u root -p word_learning

# 执行SQL查询
SELECT COUNT(*) FROM books;
SELECT COUNT(*) FROM words;
EXIT;
```

---

## 🔧 常用管理命令

### PM2管理
```bash
# 查看所有进程
pm2 list

# 重启服务
pm2 restart word-learning-api

# 停止服务
pm2 stop word-learning-api

# 删除进程
pm2 delete word-learning-api

# 查看日志
pm2 logs word-learning-api

# 清空日志
pm2 flush

# 监控面板
pm2 monit
```

### Nginx管理
```bash
# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 重新加载配置
sudo systemctl reload nginx

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 查看访问日志
sudo tail -f /var/log/nginx/access.log
```

### MySQL管理
```bash
# 登录MySQL
mysql -u root -p

# 备份数据库
mysqldump -u root -p word_learning > backup.sql

# 恢复数据库
mysql -u root -p word_learning < backup.sql

# 查看数据库大小
mysql -u root -p -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.TABLES WHERE table_schema = 'word_learning';"
```

---

## 🔒 安全加固

### 1. 修改SSH端口
```bash
sudo vi /etc/ssh/sshd_config
# 修改 Port 22 为其他端口,如 Port 2222
sudo systemctl restart sshd
```

### 2. 禁用root远程登录
```bash
sudo vi /etc/ssh/sshd_config
# 修改 PermitRootLogin yes 为 PermitRootLogin no
sudo systemctl restart sshd
```

### 3. 配置防火墙规则
```bash
# 只允许特定IP访问
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="your_ip" port port="22" protocol="tcp" accept'
sudo firewall-cmd --reload
```

### 4. 定期更新系统
```bash
sudo yum update -y
```

---

## 📊 性能优化

### 1. PM2集群模式
```bash
# 使用所有CPU核心
pm2 start src/app.js -i max --name word-learning-api

# 或指定核心数
pm2 start src/app.js -i 4 --name word-learning-api
```

### 2. MySQL优化
```bash
sudo vi /etc/my.cnf

# 添加以下配置
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 512M
query_cache_size = 64M
```

```bash
sudo systemctl restart mysqld
```

### 3. Nginx缓存
```nginx
# 在nginx配置中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location /api {
    proxy_cache my_cache;
    proxy_cache_valid 200 5m;
    # ... 其他配置
}
```

---

## 🐛 故障排查

### 问题1: 服务无法启动
```bash
# 查看详细错误
pm2 logs word-learning-api --err

# 检查端口占用
netstat -tulpn | grep 3000

# 检查.env配置
cat .env
```

### 问题2: 数据库连接失败
```bash
# 检查MySQL状态
sudo systemctl status mysqld

# 测试数据库连接
mysql -u root -p -h localhost

# 检查防火墙
sudo firewall-cmd --list-all
```

### 问题3: Nginx 502错误
```bash
# 检查后端服务是否运行
pm2 status

# 检查Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 检查SELinux (CentOS特有)
sudo setenforce 0  # 临时关闭
```

---

## 📝 部署检查清单

- [ ] Node.js安装成功 (v16+)
- [ ] MySQL安装并运行
- [ ] 项目代码已上传
- [ ] .env配置正确
- [ ] 数据库已初始化
- [ ] PM2服务运行正常
- [ ] 防火墙端口已开放
- [ ] Nginx配置正确
- [ ] HTTPS证书已配置
- [ ] API测试通过
- [ ] 域名解析正确

---

## 🎯 下一步

部署完成后:
1. 修改小程序 `app.js` 中的 `apiBase` 为你的域名
2. 在微信公众平台配置服务器域名
3. 上传小程序代码
4. 提交审核

**你的API地址**: `https://your_domain.com/api/v1`

---

需要帮助? 查看日志:
```bash
pm2 logs word-learning-api
```
