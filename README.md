# Life Moments

A private personal journaling application to track meaningful moments and their impact on your life progress.

## 🚀 快速开始

### 本地开发
```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:init

# 启动后端（终端1）
npm run server

# 启动前端（终端2）
npm run dev
```

访问: http://localhost:5174

### 阿里云部署
详见 [ALIYUN_DEPLOYMENT_GUIDE.md](./ALIYUN_DEPLOYMENT_GUIDE.md)

## 📚 文档

- [快速启动](./START.md) - 本地开发指南
- [阿里云部署](./ALIYUN_DEPLOYMENT_GUIDE.md) - 完整部署指南
- [部署总结](./DEPLOYMENT_SUMMARY.md) - 部署步骤总结
- [修复总结](./FIX_ALL_SUMMARY.md) - 最新修复说明
- [测试报告](./COMPREHENSIVE_TEST_REPORT.md) - 完整测试报告

## 🛠️ 技术栈

### 后端
- Node.js 18+ + Express
- SQLite (better-sqlite3)
- JWT 认证
- PM2 进程管理

### 前端
- React 18 + Vite
- Tailwind CSS v4
- Lucide React (图标)
- Framer Motion (动画)
- date-fns (日期处理)

### 部署
- Nginx (反向代理)
- Let's Encrypt (HTTPS)
- 阿里云 ECS

## ✨ 主要功能

- ✅ 用户注册和登录（JWT 认证）
- ✅ 创建和管理 Moments
- ✅ 富文本内容（文本 + 图片）
- ✅ 生活进度计算（复利公式）
- ✅ 响应式设计
- ✅ 本地 SQLite 数据库

## 📦 项目结构

```
all2/
├── server/           # 后端服务器
│   └── server.cjs    # Express 服务器
├── src/              # 前端源码
│   ├── app/          # React 组件
│   ├── lib/          # 工具库
│   └── styles/       # 样式文件
├── prisma/           # 数据库
│   ├── schema.prisma # 数据库模型
│   └── dev.db        # SQLite 数据库文件
├── scripts/          # 工具脚本
├── dist/             # 构建输出
└── docs/             # 文档
```

## 🔐 环境变量

复制 `.env.example` 到 `.env` 并修改：

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
FRONTEND_URL="http://localhost:5174"
```

## 📝 License

MIT