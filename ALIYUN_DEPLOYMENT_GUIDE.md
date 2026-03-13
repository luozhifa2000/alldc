# 🚀 阿里云服务器部署指南

Life Moments 项目完整部署文档

---

## 📋 前置要求

### 服务器配置
- **操作系统**: Ubuntu 20.04+ / CentOS 7+
- **内存**: 至少 1GB RAM
- **存储**: 至少 10GB 可用空间
- **端口**: 需要开放 80 (HTTP) 和 443 (HTTPS)

### 本地准备
- Git 已安装
- SSH 密钥已配置（用于连接服务器）

---

## 🔧 步骤 1: 服务器环境准备

### 1.1 连接到阿里云服务器

```bash
ssh root@your-server-ip
# 或使用你的用户名
ssh username@your-server-ip
```

### 1.2 安装 Node.js (v18+)

```bash
# 使用 NodeSource 仓库安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # 应该显示 v18.x.x
npm --version
```

### 1.3 安装 PM2（进程管理器）

```bash
sudo npm install -g pm2

# 验证安装
pm2 --version
```

### 1.4 安装 Nginx（可选，用于反向代理）

```bash
sudo apt update
sudo apt install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 📦 步骤 2: 部署应用代码

### 2.1 克隆代码到服务器

```bash
# 创建应用目录
cd /var/www
sudo mkdir -p life-moments
sudo chown -R $USER:$USER life-moments
cd life-moments

# 克隆代码
git clone https://github.com/luozhifa2000/alldc.git .
```

### 2.2 安装依赖

```bash
npm install
```

### 2.3 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**`.env` 文件内容**:
```env
# 数据库配置
DATABASE_URL="file:./prisma/dev.db"

# JWT 密钥（请修改为随机字符串）
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# 服务器端口
PORT=3000

# 前端 URL（用于 CORS）
FRONTEND_URL="http://your-domain.com"
```

**生成安全的 JWT_SECRET**:
```bash
# 生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 初始化数据库

```bash
npm run db:init
```

---

## 🏗️ 步骤 3: 构建前端

### 3.1 构建生产版本

```bash
npm run build
```

这会在 `dist/` 目录生成优化后的静态文件。

---

## 🚀 步骤 4: 启动应用

### 4.1 使用 PM2 启动后端服务器

```bash
# 启动后端
pm2 start server/server.cjs --name "life-moments-api"

# 查看状态
pm2 status

# 查看日志
pm2 logs life-moments-api
```

### 4.2 配置 PM2 开机自启

```bash
# 保存当前 PM2 进程列表
pm2 save

# 生成开机启动脚本
pm2 startup

# 按照提示执行命令（通常是一条 sudo 命令）
```

---

## 🌐 步骤 5: 配置 Nginx 反向代理

### 5.1 创建 Nginx 配置文件

```bash
sudo nano /etc/nginx/sites-available/life-moments
```

**配置内容**:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/life-moments/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 反向代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
```

### 5.2 启用配置并重启 Nginx

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/life-moments /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 🔒 步骤 6: 配置 HTTPS（推荐）

### 6.1 安装 Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 获取 SSL 证书

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

按照提示完成配置，Certbot 会自动修改 Nginx 配置。

### 6.3 自动续期

```bash
# 测试自动续期
sudo certbot renew --dry-run

# Certbot 会自动添加 cron 任务
```

---

## 📝 步骤 7: 更新前端 API 配置

### 7.1 修改前端 API 地址

编辑 `src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-domain.com/api';
```

或者在构建前设置环境变量：

```bash
# 创建 .env.production
echo "VITE_API_BASE_URL=https://your-domain.com/api" > .env.production

# 重新构建
npm run build
```

---

## ✅ 步骤 8: 验证部署

### 8.1 检查后端服务

```bash
# 检查 PM2 状态
pm2 status

# 检查后端健康
curl http://localhost:3000/health
```

### 8.2 检查前端访问

在浏览器访问：
- `http://your-domain.com` - 应该看到登录页面
- `http://your-domain.com/health` - 应该返回健康状态

### 8.3 测试完整流程

1. 注册新账号
2. 登录
3. 创建 Moment
4. 查看 Dashboard

---

## 🔄 后续更新部署

### 方法 1: 手动更新

```bash
# 连接服务器
ssh username@your-server-ip

# 进入项目目录
cd /var/www/life-moments

# 拉取最新代码
git pull origin main

# 安装新依赖（如果有）
npm install

# 重新构建前端
npm run build

# 重启后端服务
pm2 restart life-moments-api
```

### 方法 2: 使用部署脚本

创建 `deploy.sh`:

```bash
#!/bin/bash
cd /var/www/life-moments
git pull origin main
npm install
npm run build
pm2 restart life-moments-api
echo "✅ 部署完成！"
```

使用：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🐛 故障排查

### 后端无法启动

```bash
# 查看日志
pm2 logs life-moments-api

# 检查端口占用
sudo lsof -i :3000

# 手动启动测试
cd /var/www/life-moments
node server/server.cjs
```

### 前端无法访问

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查文件权限
ls -la /var/www/life-moments/dist
```

### 数据库问题

```bash
# 检查数据库文件
ls -la /var/www/life-moments/prisma/dev.db

# 重新初始化（会清空数据！）
npm run db:init
```

---

## 📊 监控和维护

### PM2 监控

```bash
# 实时监控
pm2 monit

# 查看详细信息
pm2 show life-moments-api

# 查看日志
pm2 logs --lines 100
```

### 日志管理

```bash
# PM2 日志轮转
pm2 install pm2-logrotate

# 配置日志大小限制
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔐 安全建议

1. **修改默认端口**: 不要使用 22 作为 SSH 端口
2. **配置防火墙**: 只开放必要端口（80, 443）
3. **定期更新**: 保持系统和依赖包更新
4. **备份数据库**: 定期备份 `prisma/dev.db`
5. **使用强密码**: JWT_SECRET 使用强随机字符串

---

**部署完成！** 🎉

如有问题，请查看日志或联系技术支持。

