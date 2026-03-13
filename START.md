# 🚀 Life Moments - 快速启动指南

## ⚡ 首次使用必读

### 第一步：初始化数据库

```bash
cd all2
npm run db:init
```

你会看到：
```
✅ Removed existing database
📊 Creating tables...
✅ Database initialized successfully!
```

### 第二步：启动应用

打开两个终端窗口：

#### 终端 1 - 启动后端服务器

```bash
cd all2
npm run server
```

你会看到：
```
🚀 Life Moments Server
📍 Server: http://localhost:3000
💚 Health: http://localhost:3000/health
📊 Database: /Users/.../all2/prisma/dev.db
```

#### 终端 2 - 启动前端

```bash
cd all2
npm run dev
```

你会看到：
```
VITE v6.3.5  ready in 1072 ms

➜  Local:   http://localhost:5173/
```

## 🌐 访问应用

打开浏览器访问：**http://localhost:5173** 或 **http://localhost:5174**

（如果 5173 端口被占用，Vite 会自动使用 5174）

## 创建测试账号

1. 点击"注册"
2. 输入：
   - Email: test@lifemoments.com
   - Nickname: Test User
   - Password: test123456
3. 点击"注册"

## 测试 API

在新终端运行：

```bash
cd all2
node scripts/test-local-api.cjs
```

## 重置数据库

```bash
cd all2
npm run db:init
```

## 故障排查

### 端口被占用

如果 3000 端口被占用，修改 `.env` 文件中的 `PORT=3001`

### 数据库错误

运行 `npm run db:init` 重新初始化数据库

### 前端无法连接后端

1. 确保后端正在运行（终端 1）
2. 检查 `.env` 中的 `VITE_API_BASE_URL=http://localhost:3000`
3. 重启前端（Ctrl+C 然后 `npm run dev`）

## 下一步

查看完整文档：`LOCAL_DEPLOYMENT.md`

