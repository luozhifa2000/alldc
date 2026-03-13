#!/bin/bash

# Life Moments 部署脚本
# 用于阿里云服务器快速部署和更新

set -e  # 遇到错误立即退出

echo "🚀 开始部署 Life Moments..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="/var/www/life-moments"

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 1. 拉取最新代码
echo -e "${YELLOW}📥 拉取最新代码...${NC}"
git pull origin main

# 2. 安装依赖
echo -e "${YELLOW}📦 安装依赖...${NC}"
npm install

# 3. 构建前端
echo -e "${YELLOW}🏗️  构建前端...${NC}"
npm run build

# 4. 重启后端服务
echo -e "${YELLOW}🔄 重启后端服务...${NC}"
pm2 restart life-moments-api || pm2 start server/server.cjs --name "life-moments-api"

# 5. 显示状态
echo -e "${YELLOW}📊 服务状态:${NC}"
pm2 status

echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}访问: http://your-domain.com${NC}"

