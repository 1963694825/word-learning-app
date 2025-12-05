# 英语单词学习小程序

## 项目简介
一款基于微信小程序的英语单词学习应用,采用科学的间隔重复算法(SRS)帮助用户高效记忆单词。

## 技术栈

### 后端
- Node.js + Koa.js
- MySQL + Sequelize ORM
- Redis
- JWT认证

### 前端
- 微信小程序原生框架
- ECharts图表库

## 项目结构

```
word-learning-app/
├── server/              # 后端项目
│   ├── src/
│   │   ├── controllers/ # 控制器
│   │   ├── services/    # 业务逻辑
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # 路由
│   │   ├── middlewares/ # 中间件
│   │   ├── utils/       # 工具函数
│   │   └── config/      # 配置文件
│   ├── tests/           # 测试文件
│   ├── scripts/         # 脚本文件
│   └── data/            # 数据文件
└── miniprogram/         # 前端小程序
    ├── pages/           # 页面
    ├── components/      # 组件
    ├── utils/           # 工具函数
    ├── services/        # API服务
    ├── store/           # 状态管理
    ├── config/          # 配置
    ├── assets/          # 静态资源
    └── styles/          # 样式文件
```

## 快速开始

### 后端启动

```bash
cd server
npm install
cp .env.example .env
# 编辑 .env 配置数据库等信息
npm run dev
```

### 前端启动

1. 下载微信开发者工具
2. 导入 miniprogram 目录
3. 配置 AppID
4. 启动项目

## 开发文档

- [功能需求文档](../英语单词学习小程序-功能需求文档.md)
- [技术架构文档](../技术架构文档.md)
- [UI设计规范](../UI设计规范.md)
- [开发步骤文档](../开发步骤文档.md)

## License

MIT
