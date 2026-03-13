# 🚀 Life Moments - 阿里云 ECS 完整部署指南（从零开始）

> **适用场景**：全新的、空白的阿里云 ECS 服务器  
> **操作系统**：Ubuntu 20.04 / 22.04 LTS  
> **预计时间**：30-60 分钟

---

## 📖 目录

1. [前置准备](#1-前置准备)
2. [连接服务器](#2-连接服务器)
3. [更新系统](#3-更新系统)
4. [创建部署用户](#4-创建部署用户可选但推荐)
5. [安装 Node.js](#5-安装-nodejs)
6. [安装 Git](#6-安装-git)
7. [克隆项目代码](#7-克隆项目代码)
8. [配置环境变量](#8-配置环境变量)
9. [安装项目依赖](#9-安装项目依赖)
10. [初始化数据库](#10-初始化数据库)
11. [构建前端](#11-构建前端)
12. [安装 PM2](#12-安装-pm2)
13. [启动后端服务](#13-启动后端服务)
14. [安装 Nginx](#14-安装-nginx)
15. [配置 Nginx](#15-配置-nginx)
16. [配置防火墙](#16-配置防火墙)
17. [配置 HTTPS](#17-配置-https可选但强烈推荐)
18. [验证部署](#18-验证部署)
19. [后续更新](#19-后续更新)
20. [故障排查](#20-故障排查)

---

## 1. 前置准备

### 1.1 阿里云 ECS 服务器要求

| 项目 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 1核 | 2核 |
| 内存 | 1GB | 2GB 或以上 |
| 存储 | 20GB | 40GB 或以上 |
| 操作系统 | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS |
| 带宽 | 1Mbps | 3Mbps 或以上 |

### 1.2 需要准备的信息

- ✅ **服务器公网 IP**：例如 `47.98.123.456`
- ✅ **SSH 登录密码**：购买 ECS 时设置的 root 密码
- ✅ **（可选）域名**：例如 `lifemoments.yourdomain.com`

### 1.3 本地工具

- **Windows 用户**：使用 PowerShell、CMD 或 [PuTTY](https://www.putty.org/)
- **Mac/Linux 用户**：使用终端（Terminal）

---

## 2. 连接服务器

### 2.1 使用 SSH 连接

打开终端（或 PowerShell），输入：

```bash
ssh root@your-server-ip
```

**示例**：
```bash
ssh root@47.98.123.456
```

### 2.2 首次连接

首次连接会提示：
```
The authenticity of host '47.98.123.456' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

输入 `yes` 并按回车。

### 2.3 输入密码

输入你的 root 密码（输入时不会显示，这是正常的），按回车。

### 2.4 连接成功

看到类似以下提示说明连接成功：
```
Welcome to Ubuntu 22.04 LTS
root@iZ2ze....:~#
```

---

## 3. 更新系统

**重要**：首先更新系统软件包，确保安全性。

```bash
# 更新软件包列表
apt update

# 升级已安装的软件包
apt upgrade -y
```

**预计时间**：2-5 分钟

---

## 4. 创建部署用户（可选但推荐）

为了安全，建议创建一个专门的用户来运行应用，而不是使用 root。

### 4.1 创建用户

```bash
# 创建用户 deployer
adduser deployer
```

按提示设置密码，其他信息可以直接按回车跳过。

### 4.2 授予 sudo 权限

```bash
usermod -aG sudo deployer
```

### 4.3 切换到新用户

```bash
su - deployer
```

**如果你选择继续使用 root 用户，可以跳过此步骤。**

---

## 5. 安装 Node.js

Life Moments 需要 Node.js 18 或更高版本。

### 5.1 添加 NodeSource 仓库

```bash
# 下载并执行 Node.js 18 安装脚本
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
```

### 5.2 安装 Node.js

```bash
sudo apt-get install -y nodejs
```

### 5.3 验证安装

```bash
node --version
npm --version
```

**期望输出**：
```
v18.x.x
9.x.x
```

---

## 6. 安装 Git

```bash
sudo apt install -y git
```

### 验证安装

```bash
git --version
```

**期望输出**：
```
git version 2.x.x
```

---

## 7. 克隆项目代码

### 7.1 创建项目目录

```bash
# 创建 Web 应用目录
sudo mkdir -p /var/www/life-moments

# 修改所有者为当前用户
sudo chown -R $USER:$USER /var/www/life-moments

# 进入目录
cd /var/www/life-moments
```

### 7.2 克隆代码

```bash
git clone https://github.com/luozhifa2000/alldc.git .
```

**注意**：最后的 `.` 表示克隆到当前目录。

### 7.3 进入项目目录

```bash
cd all2
```

### 7.4 验证文件

```bash
ls -la
```

你应该看到 `package.json`、`src/`、`server/` 等文件和目录。

---

## 8. 配置环境变量

### 8.1 复制环境变量模板

```bash
cp .env.example .env
```

### 8.2 生成 JWT 密钥

```bash
# 生成一个随机的 32 字节密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**复制输出的字符串**，例如：
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

### 8.3 编辑环境变量

```bash
nano .env
```

**修改以下内容**：

```env
# 数据库配置（SQLite，无需修改）
DATABASE_URL="file:./prisma/dev.db"

# JWT 密钥（替换为上一步生成的密钥）
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0"

# 服务器端口（默认 3000）
PORT=3000

# 前端 URL（如果有域名，改为你的域名）
FRONTEND_URL="http://your-server-ip"
```

**保存并退出**：
- 按 `Ctrl + O` 保存
- 按 `Enter` 确认
- 按 `Ctrl + X` 退出

---

## 9. 安装项目依赖

### 9.1 安装 npm 依赖

```bash
npm install
```

**预计时间**：3-5 分钟

**如果遇到权限错误**，运行：
```bash
sudo npm install --unsafe-perm
```

### 9.2 验证安装

```bash
ls -la node_modules | head -20
```

应该看到很多已安装的包。

---

## 10. 初始化数据库

Life Moments 使用 **SQLite** 数据库，**无需安装 MySQL 或 PostgreSQL**。

### 10.1 运行初始化脚本

```bash
npm run db:init
```

**期望输出**：
```
✅ Removed existing database
📊 Creating tables...
✅ Database initialized successfully!
📁 Database location: /var/www/life-moments/all2/prisma/dev.db
```

### 10.2 验证数据库文件

```bash
ls -lh prisma/dev.db
```

**期望输出**：
```
-rw-r--r-- 1 deployer deployer 20K Mar 13 10:30 prisma/dev.db
```

### 10.3 数据库说明

✅ **SQLite 是什么？**
- 一个文件型数据库，不需要单独的数据库服务器
- 数据库就是一个文件：`prisma/dev.db`
- 自动创建，零配置

✅ **数据库包含的表**：
- `users` - 用户表
- `moments` - Moments 表
- `moment_images` - 图片表
- `email_verification_codes` - 验证码表

---

## 11. 构建前端

### 11.1 构建生产版本

```bash
npm run build
```

**预计时间**：1-3 分钟

**期望输出**：
```
vite v5.x.x building for production...
✓ xxxx modules transformed.
dist/index.html                   x.xx kB
dist/assets/index-xxxxx.js       xxx.xx kB
✓ built in xxxs
```

### 11.2 验证构建产物

```bash
ls -la dist/
```

应该看到 `index.html` 和 `assets/` 目录。

---

## 12. 安装 PM2

PM2 是一个进程管理器，用于保持 Node.js 应用持续运行。

### 12.1 全局安装 PM2

```bash
sudo npm install -g pm2
```

### 12.2 验证安装

```bash
pm2 --version
```

**期望输出**：
```
5.x.x
```

---

## 13. 启动后端服务

### 13.1 使用 PM2 启动

```bash
pm2 start server/server.cjs --name "life-moments-api"
```

**期望输出**：
```
[PM2] Starting server/server.cjs in fork_mode (1 instance)
[PM2] Done.
┌─────┬──────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name                 │ mode    │ status  │ cpu      │
├─────┼──────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ life-moments-api     │ fork    │ online  │ 0%       │
└─────┴──────────────────────┴─────────┴─────────┴──────────┘
```

### 13.2 查看日志

```bash
pm2 logs life-moments-api --lines 20
```

**期望看到**：
```
🚀 Server running on http://localhost:3000
✅ Database connected
```

### 13.3 保存 PM2 配置

```bash
pm2 save
```

### 13.4 设置开机自启

```bash
pm2 startup
```

**复制输出的命令并执行**，例如：
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deployer --hp /home/deployer
```

### 13.5 验证服务

```bash
curl http://localhost:3000/health
```

**期望输出**：
```json
{"status":"ok","timestamp":"2026-03-13T..."}
```

---

## 14. 安装 Nginx

Nginx 用作反向代理和静态文件服务器。

### 14.1 安装 Nginx

```bash
sudo apt install -y nginx
```

### 14.2 启动 Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 14.3 验证安装

```bash
sudo systemctl status nginx
```

**期望看到**：
```
● nginx.service - A high performance web server
   Active: active (running)
```

按 `q` 退出状态查看。

### 14.4 测试访问

在浏览器中访问：`http://your-server-ip`

应该看到 Nginx 默认欢迎页面。

---

## 15. 配置 Nginx

### 15.1 创建配置文件

```bash
sudo nano /etc/nginx/sites-available/life-moments
```

### 15.2 粘贴以下配置

**如果没有域名，使用 IP 访问**：

```nginx
server {
    listen 80;
    server_name your-server-ip;  # 替换为你的服务器 IP，例如 47.98.123.456

    # 前端静态文件
    location / {
        root /var/www/life-moments/all2/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000/;
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

    # 日志
    access_log /var/log/nginx/life-moments-access.log;
    error_log /var/log/nginx/life-moments-error.log;
}
```

**如果有域名**，将 `server_name` 改为你的域名：
```nginx
server_name lifemoments.yourdomain.com;
```

**保存并退出**：
- 按 `Ctrl + O` 保存
- 按 `Enter` 确认
- 按 `Ctrl + X` 退出

### 15.3 启用配置

```bash
sudo ln -s /etc/nginx/sites-available/life-moments /etc/nginx/sites-enabled/
```

### 15.4 删除默认配置（可选）

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 15.5 测试配置

```bash
sudo nginx -t
```

**期望输出**：
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 15.6 重启 Nginx

```bash
sudo systemctl restart nginx
```

---

## 16. 配置防火墙

### 16.1 阿里云安全组配置

登录阿里云控制台，配置安全组规则：

1. 进入 **ECS 控制台**
2. 选择你的实例
3. 点击 **安全组** → **配置规则**
4. 添加以下入方向规则：

| 协议类型 | 端口范围 | 授权对象 | 说明 |
|---------|---------|---------|------|
| TCP | 22 | 0.0.0.0/0 | SSH 登录 |
| TCP | 80 | 0.0.0.0/0 | HTTP |
| TCP | 443 | 0.0.0.0/0 | HTTPS（如果配置） |

### 16.2 服务器防火墙配置（可选）

如果使用 UFW：

```bash
# 安装 UFW
sudo apt install -y ufw

# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP
sudo ufw allow 80/tcp

# 允许 HTTPS
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

---

## 17. 配置 HTTPS（可选但强烈推荐）

**前提**：你需要有一个域名，并且已经将域名解析到服务器 IP。

### 17.1 安装 Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 17.2 获取 SSL 证书

```bash
sudo certbot --nginx -d your-domain.com
```

**示例**：
```bash
sudo certbot --nginx -d lifemoments.yourdomain.com
```

### 17.3 按提示操作

1. 输入邮箱地址
2. 同意服务条款（输入 `Y`）
3. 选择是否重定向 HTTP 到 HTTPS（推荐选择 `2`）

### 17.4 自动续期

Certbot 会自动设置续期任务，验证：

```bash
sudo systemctl status certbot.timer
```

### 17.5 测试续期

```bash
sudo certbot renew --dry-run
```

---

## 18. 验证部署

### 18.1 检查后端服务

```bash
pm2 status
```

应该看到 `life-moments-api` 状态为 `online`。

### 18.2 检查 Nginx

```bash
sudo systemctl status nginx
```

应该看到 `active (running)`。

### 18.3 访问应用

在浏览器中访问：

- **HTTP**：`http://your-server-ip` 或 `http://your-domain.com`
- **HTTPS**：`https://your-domain.com`（如果已配置）

### 18.4 测试功能

1. **注册账号**：点击 "Sign Up" 创建新账号
2. **登录**：使用刚注册的账号登录
3. **创建 Moment**：点击 "New Moment" 创建第一个 moment
4. **上传图片**：测试图片上传功能
5. **查看列表**：返回 Dashboard 查看 moment 列表

### 18.5 检查日志

```bash
# 查看后端日志
pm2 logs life-moments-api

# 查看 Nginx 访问日志
sudo tail -f /var/log/nginx/life-moments-access.log

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/life-moments-error.log
```

---

## 19. 后续更新

当你的代码有更新时，按以下步骤重新部署：

### 19.1 连接服务器

```bash
ssh deployer@your-server-ip
cd /var/www/life-moments/all2
```

### 19.2 拉取最新代码

```bash
git pull origin main
```

### 19.3 安装新依赖（如果有）

```bash
npm install
```

### 19.4 重新构建前端

```bash
npm run build
```

### 19.5 重启后端

```bash
pm2 restart life-moments-api
```

### 19.6 验证

```bash
pm2 logs life-moments-api --lines 50
```

### 19.7 使用自动化脚本（推荐）

项目包含了一个自动化部署脚本：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 20. 故障排查

### 问题 1: 无法访问网站

**症状**：浏览器显示"无法访问此网站"

**排查步骤**：

1. **检查 Nginx 状态**：
```bash
sudo systemctl status nginx
```

2. **检查 Nginx 配置**：
```bash
sudo nginx -t
```

3. **检查防火墙**：
```bash
sudo ufw status
```

4. **检查阿里云安全组**：确保开放了 80 和 443 端口

5. **查看 Nginx 错误日志**：
```bash
sudo tail -100 /var/log/nginx/error.log
```

---

### 问题 2: 后端 API 无响应

**症状**：前端加载但无法登录或创建 moment

**排查步骤**：

1. **检查 PM2 状态**：
```bash
pm2 status
```

2. **查看后端日志**：
```bash
pm2 logs life-moments-api --lines 100
```

3. **检查端口占用**：
```bash
sudo lsof -i :3000
```

4. **手动测试 API**：
```bash
curl http://localhost:3000/health
```

5. **重启后端**：
```bash
pm2 restart life-moments-api
```

---

### 问题 3: 数据库错误

**症状**：日志显示数据库相关错误

**排查步骤**：

1. **检查数据库文件**：
```bash
ls -lh /var/www/life-moments/all2/prisma/dev.db
```

2. **检查文件权限**：
```bash
chmod 666 /var/www/life-moments/all2/prisma/dev.db
```

3. **重新初始化数据库**（⚠️ 会清空所有数据）：
```bash
cd /var/www/life-moments/all2
npm run db:init
pm2 restart life-moments-api
```

---

### 问题 4: 前端显示空白页

**症状**：访问网站只看到空白页

**排查步骤**：

1. **检查构建产物**：
```bash
ls -la /var/www/life-moments/all2/dist/
```

2. **重新构建**：
```bash
cd /var/www/life-moments/all2
npm run build
```

3. **检查 Nginx 配置中的路径**：
```bash
sudo nano /etc/nginx/sites-available/life-moments
# 确认 root 路径正确
```

4. **查看浏览器控制台**：按 F12 查看错误信息

---

### 问题 5: 图片上传失败

**症状**：无法上传图片或图片不显示

**排查步骤**：

1. **检查后端日志**：
```bash
pm2 logs life-moments-api
```

2. **检查磁盘空间**：
```bash
df -h
```

3. **检查数据库大小**：
```bash
du -h /var/www/life-moments/all2/prisma/dev.db
```

---

### 问题 6: PM2 进程崩溃

**症状**：PM2 显示进程状态为 `errored` 或 `stopped`

**排查步骤**：

1. **查看详细日志**：
```bash
pm2 logs life-moments-api --err --lines 200
```

2. **删除并重新启动**：
```bash
pm2 delete life-moments-api
pm2 start server/server.cjs --name "life-moments-api"
pm2 save
```

3. **检查环境变量**：
```bash
cat /var/www/life-moments/all2/.env
```

---

### 问题 7: Git 拉取失败

**症状**：`git pull` 时出现错误

**排查步骤**：

1. **检查本地修改**：
```bash
git status
```

2. **暂存本地修改**：
```bash
git stash
git pull origin main
git stash pop
```

3. **强制拉取**（⚠️ 会覆盖本地修改）：
```bash
git fetch origin
git reset --hard origin/main
```

---

### 问题 8: HTTPS 证书问题

**症状**：浏览器显示证书错误

**排查步骤**：

1. **检查证书状态**：
```bash
sudo certbot certificates
```

2. **手动续期**：
```bash
sudo certbot renew
```

3. **重新获取证书**：
```bash
sudo certbot --nginx -d your-domain.com --force-renewal
```

---

## 📊 常用命令速查

### PM2 命令

```bash
# 查看所有进程
pm2 list

# 查看日志
pm2 logs life-moments-api

# 重启进程
pm2 restart life-moments-api

# 停止进程
pm2 stop life-moments-api

# 删除进程
pm2 delete life-moments-api

# 查看进程详情
pm2 show life-moments-api

# 监控
pm2 monit
```

### Nginx 命令

```bash
# 测试配置
sudo nginx -t

# 重启
sudo systemctl restart nginx

# 重新加载配置
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx

# 查看日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 系统命令

```bash
# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看进程
ps aux | grep node

# 查看端口占用
sudo lsof -i :3000
sudo lsof -i :80

# 查看系统日志
sudo journalctl -xe
```

---

## 🔐 安全建议

### 1. 修改 SSH 端口（可选）

```bash
sudo nano /etc/ssh/sshd_config
# 修改 Port 22 为其他端口，如 2222
sudo systemctl restart sshd
```

### 2. 禁用 root 登录

```bash
sudo nano /etc/ssh/sshd_config
# 设置 PermitRootLogin no
sudo systemctl restart sshd
```

### 3. 配置 Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. 定期备份数据库

```bash
# 创建备份脚本
nano ~/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/deployer/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp /var/www/life-moments/all2/prisma/dev.db $BACKUP_DIR/dev_$DATE.db
# 保留最近 7 天的备份
find $BACKUP_DIR -name "dev_*.db" -mtime +7 -delete
```

```bash
chmod +x ~/backup-db.sh
# 添加到 crontab，每天凌晨 2 点备份
crontab -e
# 添加：0 2 * * * /home/deployer/backup-db.sh
```

### 5. 更新系统

```bash
# 定期运行
sudo apt update
sudo apt upgrade -y
```

---

## 📚 附录

### A. 完整的目录结构

```
/var/www/life-moments/all2/
├── server/              # 后端代码
│   └── server.cjs       # Express 服务器
├── src/                 # 前端源码
│   ├── app/             # React 组件
│   ├── lib/             # 工具库
│   └── styles/          # 样式文件
├── dist/                # 前端构建产物
│   ├── index.html
│   └── assets/
├── prisma/              # 数据库
│   ├── schema.prisma    # 数据库模型
│   └── dev.db           # SQLite 数据库文件
├── scripts/             # 工具脚本
│   └── init-db.cjs      # 数据库初始化脚本
├── .env                 # 环境变量
├── package.json         # 项目配置
└── deploy.sh            # 部署脚本
```

### B. 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | 数据库连接字符串 | `file:./prisma/dev.db` |
| `JWT_SECRET` | JWT 签名密钥 | 随机 64 位字符串 |
| `PORT` | 后端服务端口 | `3000` |
| `FRONTEND_URL` | 前端 URL | `http://your-domain.com` |

### C. 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 运行时 | Node.js | 18+ |
| 后端框架 | Express | 4.x |
| 数据库 | SQLite (better-sqlite3) | 3.x |
| 前端框架 | React | 18.x |
| 构建工具 | Vite | 5.x |
| 样式 | Tailwind CSS | 4.x |
| 进程管理 | PM2 | 5.x |
| Web 服务器 | Nginx | 1.18+ |

---

## ✅ 部署完成检查清单

部署完成后，请确认以下所有项目：

- [ ] 服务器可以通过 SSH 连接
- [ ] Node.js 18+ 已安装
- [ ] Git 已安装
- [ ] 项目代码已克隆到 `/var/www/life-moments/all2`
- [ ] 环境变量已配置（`.env` 文件）
- [ ] npm 依赖已安装
- [ ] 数据库已初始化（`prisma/dev.db` 存在）
- [ ] 前端已构建（`dist/` 目录存在）
- [ ] PM2 已安装并启动后端服务
- [ ] PM2 已设置开机自启
- [ ] Nginx 已安装并配置
- [ ] 防火墙已配置（开放 80, 443 端口）
- [ ] 阿里云安全组已配置
- [ ] 可以通过浏览器访问应用
- [ ] 可以注册和登录
- [ ] 可以创建 Moment
- [ ] 可以上传图片
- [ ] （可选）HTTPS 已配置

---

## 🎉 恭喜！

你已经成功将 Life Moments 部署到阿里云服务器！

### 下一步

1. **测试所有功能**：注册、登录、创建 moment、上传图片
2. **配置域名和 HTTPS**（如果还没有）
3. **设置数据库定期备份**
4. **监控服务器性能**：使用 `pm2 monit` 或其他监控工具
5. **定期更新代码**：使用 `./deploy.sh` 脚本

### 获取帮助

如果遇到问题：

1. 查看本文档的 [故障排查](#20-故障排查) 部分
2. 检查日志：`pm2 logs` 和 `/var/log/nginx/error.log`
3. 查看项目文档：`START.md`、`FIX_ALL_SUMMARY.md`

---

**祝你使用愉快！** 🚀

