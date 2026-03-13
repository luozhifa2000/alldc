# Life Moments - 本地部署指南

## 🎉 简化部署方案

我已经将项目改造为**完全本地部署**，使用 SQLite 数据库，无需任何云服务！

## 📋 系统要求

- Node.js 18+ 
- npm 或 yarn

## 🚀 一键启动

### 1. 安装依赖（如果还没安装）

```bash
cd all2
npm install
```

### 2. 初始化数据库

```bash
npm run db:init
```

### 3. 启动服务器

```bash
npm run server
```

服务器将在 `http://localhost:3000` 启动

### 4. 启动前端（新终端窗口）

```bash
npm run dev
```

前端将在 `http://localhost:5173` 启动

### 5. 同时启动前端和后端

```bash
npm run dev:all
```

## 📝 测试账号

访问 `http://localhost:5173` 并注册一个新账号，或使用以下测试账号：

- **Email**: test@lifemoments.com
- **Password**: test123456

## 🗂️ 项目结构

```
all2/
├── server/              # Express 后端服务器
│   └── index.js        # 主服务器文件
├── prisma/             # 数据库
│   └── dev.db          # SQLite 数据库文件
├── src/                # React 前端
│   ├── app/
│   │   ├── pages/      # 页面组件
│   │   └── components/ # UI 组件
│   └── lib/
│       └── api.ts      # API 客户端
├── scripts/
│   └── init-db.cjs     # 数据库初始化脚本
└── .env                # 环境变量
```

## 🔧 可用命令

```bash
# 开发
npm run dev              # 启动前端开发服务器
npm run server           # 启动后端服务器
npm run dev:all          # 同时启动前端和后端

# 数据库
npm run db:init          # 初始化/重置数据库

# 生产构建
npm run build            # 构建前端
```

## 🌐 API 端点

后端 API 运行在 `http://localhost:3000`

### 认证
- `POST /auth/register` - 注册
- `POST /auth/login` - 登录
- `POST /auth/send-code` - 发送验证码
- `POST /auth/verify-code` - 验证码登录
- `GET /auth/me` - 获取当前用户

### Moments
- `GET /moments` - 获取 moments 列表
- `POST /moments` - 创建 moment
- `GET /moments/:id` - 获取 moment 详情
- `PUT /moments/:id` - 更新 moment
- `DELETE /moments/:id` - 删除 moment
- `GET /moments/progress` - 获取生活进度

## 🔐 环境变量

`.env` 文件配置：

```env
# API 地址
VITE_API_BASE_URL=http://localhost:3000

# 数据库
DATABASE_URL="file:./prisma/dev.db"

# JWT 密钥（生产环境请更改）
JWT_SECRET=your-secret-key-change-in-production

# 服务器端口
PORT=3000
```

## 📊 数据库管理

数据库文件位于 `prisma/dev.db`

### 重置数据库

```bash
npm run db:init
```

### 查看数据库

使用 SQLite 客户端（如 DB Browser for SQLite）打开 `prisma/dev.db`

## 🐛 故障排查

### 端口被占用

如果 3000 或 5173 端口被占用，修改 `.env` 中的 `PORT` 或使用：

```bash
PORT=3001 npm run server
```

### 数据库错误

重新初始化数据库：

```bash
npm run db:init
```

### API 连接失败

确保：
1. 后端服务器正在运行（`npm run server`）
2. `.env` 中的 `VITE_API_BASE_URL` 正确
3. 重启前端开发服务器

## 🎯 功能清单

- ✅ 用户注册和登录
- ✅ 密码登录
- ✅ 邮箱验证码登录（开发模式下验证码会打印在控制台）
- ✅ 创建 Moment（文本和图片）
- ✅ 查看 Moments 列表
- ✅ 查看 Moment 详情
- ✅ 编辑和删除 Moment
- ✅ 生活进度计算（复利公式）
- ✅ 响应式设计

## 📦 生产部署

### 方案1：单机部署

1. 构建前端：
```bash
npm run build
```

2. 使用 serve 或 nginx 托管 `dist` 目录

3. 使用 PM2 运行后端：
```bash
npm install -g pm2
pm2 start server/index.js --name life-moments
```

### 方案2：Docker 部署

创建 `Dockerfile`（待实现）

## 🔄 下一步优化

- [ ] 添加图片上传到本地文件系统
- [ ] 实现真实的邮件发送
- [ ] 添加数据备份功能
- [ ] 添加用户头像
- [ ] 实现数据导出（JSON/CSV）
- [ ] 添加暗色模式
- [ ] PWA 支持

## 💡 技术栈

- **前端**: React 18 + Vite + TypeScript + Tailwind CSS v4
- **后端**: Node.js + Express
- **数据库**: SQLite + better-sqlite3
- **认证**: JWT + bcryptjs
- **UI**: Radix UI + Material-UI + Framer Motion

## 📞 支持

如有问题，请检查：
1. Node.js 版本 >= 18
2. 所有依赖已安装
3. 数据库已初始化
4. 端口未被占用

