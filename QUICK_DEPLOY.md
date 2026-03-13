# ⚡ 快速部署参考卡片

> **完整详细指南请查看**: [COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md)

---

## 🚀 一键复制命令（适用于 Ubuntu 20.04/22.04）

### 1. 连接服务器
```bash
ssh root@your-server-ip
```

### 2. 更新系统
```bash
apt update && apt upgrade -y
```

### 3. 安装 Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
```

### 4. 安装 Git
```bash
apt install -y git
```

### 5. 克隆项目
```bash
mkdir -p /var/www/life-moments
cd /var/www/life-moments
git clone https://github.com/luozhifa2000/alldc.git .
cd all2
```

### 6. 配置环境变量
```bash
cp .env.example .env
# 生成 JWT 密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# 编辑 .env 文件，替换 JWT_SECRET
nano .env
```

### 7. 安装依赖和初始化
```bash
npm install
npm run db:init
npm run build
```

### 8. 安装 PM2 并启动后端
```bash
npm install -g pm2
pm2 start server/server.cjs --name "life-moments-api"
pm2 save
pm2 startup
# 复制输出的命令并执行
```

### 9. 安装 Nginx
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 10. 配置 Nginx
```bash
nano /etc/nginx/sites-available/life-moments
```

粘贴配置（替换 `your-server-ip`）：
```nginx
server {
    listen 80;
    server_name your-server-ip;
    
    location / {
        root /var/www/life-moments/all2/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
```

### 11. 启用 Nginx 配置
```bash
ln -s /etc/nginx/sites-available/life-moments /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 12. 配置防火墙（阿里云安全组）
在阿里云控制台开放端口：
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

### 13. 验证部署
```bash
# 检查后端
pm2 status
curl http://localhost:3000/health

# 访问浏览器
# http://your-server-ip
```

---

## 🔄 后续更新

```bash
cd /var/www/life-moments/all2
git pull origin main
npm install
npm run build
pm2 restart life-moments-api
```

或使用自动化脚本：
```bash
./deploy.sh
```

---

## 🆘 常见问题

| 问题 | 解决方案 |
|------|---------|
| 无法访问网站 | 检查阿里云安全组是否开放 80 端口 |
| API 无响应 | `pm2 logs life-moments-api` 查看日志 |
| 前端空白页 | 重新运行 `npm run build` |
| 数据库错误 | `npm run db:init` 重新初始化 |

---

## 📚 相关文档

- **完整部署指南**: [COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md) - 1200+ 行详细说明
- **本地开发**: [START.md](./START.md)
- **部署总结**: [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)
- **修复说明**: [FIX_ALL_SUMMARY.md](./FIX_ALL_SUMMARY.md)

---

**预计部署时间**: 30-60 分钟

