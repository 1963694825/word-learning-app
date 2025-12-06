# 单词学习小程序部署指南

## 📋 目录

- [环境要求](#环境要求)
- [1. 准备工作](#1-准备工作)
- [2. 数据库部署](#2-数据库部署)
- [3. 后端部署](#3-后端部署)
- [4. 小程序部署](#4-小程序部署)
- [5. 微信公众平台配置](#5-微信公众平台配置)
- [6. 验证部署](#6-验证部署)
- [7. 常见问题](#7-常见问题)

---

## 环境要求

### 服务器环境
- **操作系统**: Linux (推荐 Ubuntu 20.04+) 或 Windows Server
- **Node.js**: v16.0.0 或更高版本
- **MySQL**: v5.7 或更高版本
- **内存**: 至少 2GB RAM
- **存储**: 至少 10GB 可用空间

### 开发工具
- **微信开发者工具**: 最新稳定版
- **Git**: 用于代码管理

---

## 1. 准备工作

### 1.1 获取代码

```bash
# 克隆项目
git clone https://github.com/YOUR_USERNAME/word-learning-app.git
cd word-learning-app
```

### 1.2 获取微信小程序凭证

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发" → "开发管理" → "开发设置"
3. 记录以下信息:
   - **AppID**: `wx723464455b434f1b`
   - **AppSecret**: `8e6df7630d4187e02570b4582024ffea`

---

## 2. 数据库部署

### 2.1 安装MySQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**Windows:**
下载并安装 [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

### 2.2 创建数据库

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE word_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户(可选)
CREATE USER 'wordapp'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON word_learning.* TO 'wordapp'@'localhost';
FLUSH PRIVILEGES;

# 退出
EXIT;
```

### 2.3 导入初始数据

```bash
cd server
mysql -u root -p word_learning < database/schema.sql
mysql -u root -p word_learning < database/seed.sql
```

---

## 3. 后端部署

### 3.1 安装依赖

```bash
cd server
npm install
```

### 3.2 配置环境变量

创建 `.env` 文件:

```bash
cp .env.example .env
```

编辑 `.env` 文件:

```env
# 服务器配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=word_learning
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT配置
JWT_SECRET=your_random_secret_key_here_min_32_chars
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APP_ID=wx723464455b434f1b
WECHAT_APP_SECRET=8e6df7630d4187e02570b4582024ffea

# API文档
API_DOC_ENABLED=true
```

> ⚠️ **安全提示**: 
> - 修改 `JWT_SECRET` 为随机字符串(至少32位)
> - 修改 `DB_PASSWORD` 为实际的数据库密码
> - 生产环境建议设置 `API_DOC_ENABLED=false`

### 3.3 启动后端服务

**开发环境:**
```bash
npm run dev
```

**生产环境 (使用PM2):**

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start src/app.js --name word-learning-api

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs word-learning-api

# 查看状态
pm2 status
```

### 3.4 配置Nginx反向代理 (可选)

创建Nginx配置文件 `/etc/nginx/sites-available/word-learning`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

启用配置:
```bash
sudo ln -s /etc/nginx/sites-available/word-learning /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. 小程序部署

### 4.1 配置API地址

编辑 `miniprogram/app.js`:

```javascript
globalData: {
    userInfo: null,
    token: null,
    // 开发环境
    apiBase: 'http://localhost:3000/api/v1'
    
    // 生产环境(使用服务器IP或域名)
    // apiBase: 'https://your-domain.com/api/v1'
}
```

### 4.2 配置服务器域名

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发" → "开发管理" → "开发设置"
3. 在"服务器域名"中配置:
   - **request合法域名**: `https://your-domain.com`
   - **uploadFile合法域名**: `https://your-domain.com`
   - **downloadFile合法域名**: `https://your-domain.com`

> ⚠️ **注意**: 
> - 域名必须使用HTTPS
> - 域名需要备案
> - 每月只能修改5次

### 4.3 上传小程序代码

1. 打开微信开发者工具
2. 导入项目,选择 `miniprogram` 目录
3. 填写AppID: `wx723464455b434f1b`
4. 点击"上传"按钮
5. 填写版本号和项目备注
6. 上传成功

### 4.4 提交审核

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入"版本管理"
3. 选择刚上传的版本,点击"提交审核"
4. 填写审核信息:
   - **功能页面**: 首页、学习页、统计页、我的
   - **测试账号**: 提供测试用的微信号
5. 等待审核(通常1-7个工作日)

### 4.5 发布上线

审核通过后:
1. 进入"版本管理"
2. 点击"发布"按钮
3. 小程序正式上线

---

## 5. 微信公众平台配置

### 5.1 基本信息设置

1. **小程序名称**: 单词学习助手
2. **小程序简介**: 智能英语单词学习工具,支持多词书、学习统计、打卡日历
3. **小程序头像**: 上传应用图标
4. **服务类目**: 教育 → 在线教育

### 5.2 用户隐私保护指引

1. 进入"设置" → "基本设置" → "用户隐私保护指引"
2. 填写以下信息:
   - **收集信息**: 微信昵称、微信头像
   - **使用目的**: 用于用户身份识别和个性化显示
   - **存储位置**: 中国境内服务器
3. 保存并发布

### 5.3 业务域名配置 (可选)

如果需要在小程序中打开网页:
1. 进入"开发" → "开发管理" → "业务域名"
2. 添加域名: `your-domain.com`
3. 下载校验文件并上传到服务器根目录

---

## 6. 验证部署

### 6.1 后端API验证

```bash
# 检查服务状态
curl http://localhost:3000/health

# 测试获取词书列表
curl http://localhost:3000/api/v1/books

# 查看API文档
# 浏览器访问: http://localhost:3000/api-docs
```

### 6.2 数据库验证

```bash
mysql -u root -p word_learning

# 检查表
SHOW TABLES;

# 检查词书数据
SELECT COUNT(*) FROM books;

# 检查单词数据
SELECT COUNT(*) FROM words;
```

### 6.3 小程序功能验证

- [ ] 登录功能正常
- [ ] 可以选择词书
- [ ] 可以学习单词
- [ ] 统计数据正确
- [ ] 学习日历显示
- [ ] 打卡记录更新

---

## 7. 常见问题

### 7.1 数据库连接失败

**问题**: `Error: connect ECONNREFUSED`

**解决**:
```bash
# 检查MySQL是否运行
sudo systemctl status mysql

# 启动MySQL
sudo systemctl start mysql

# 检查.env配置是否正确
cat .env | grep DB_
```

### 7.2 小程序无法连接后端

**问题**: `request:fail`

**解决**:
1. 检查 `apiBase` 配置是否正确
2. 确保服务器防火墙开放端口
3. 检查域名是否在"服务器域名"白名单中
4. 开发环境勾选"不校验合法域名"

### 7.3 微信登录失败

**问题**: `微信配置未设置`

**解决**:
```bash
# 检查.env中的微信配置
cat .env | grep WECHAT_

# 确保AppID和AppSecret正确
# 重启后端服务
pm2 restart word-learning-api
```

### 7.4 打卡记录不更新

**问题**: 学习后打卡天数为0

**解决**:
```bash
# 手动更新打卡数据
cd server
node update-learn-days.js

# 检查是否有学习记录
mysql -u root -p word_learning -e "SELECT COUNT(*) FROM learn_records;"
```

### 7.5 端口被占用

**问题**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决**:
```bash
# 查找占用端口的进程
lsof -i :3000

# 或使用
netstat -ano | findstr :3000

# 杀死进程
kill -9 <PID>
```

---

## 📞 技术支持

如遇到部署问题,请:
1. 查看服务器日志: `pm2 logs word-learning-api`
2. 查看数据库日志: `sudo tail -f /var/log/mysql/error.log`
3. 检查Nginx日志: `sudo tail -f /var/log/nginx/error.log`

---

## 🔄 更新部署

```bash
# 1. 拉取最新代码
git pull origin master

# 2. 更新后端依赖
cd server
npm install

# 3. 重启服务
pm2 restart word-learning-api

# 4. 重新上传小程序代码
# 使用微信开发者工具上传新版本
```

---

**部署完成!** 🎉

现在您的单词学习小程序已经成功部署并可以正常使用了。
