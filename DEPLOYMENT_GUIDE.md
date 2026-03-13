# Life Moments 完整部署指南

## 当前状态

✅ 数据库已迁移  
✅ 前端代码已完成  
✅ 后端 API 已完成  
✅ 前端构建成功  
⏳ Edge Function 需要重新部署  
⏳ 前端需要部署到 Vercel  

## 第一步：重新部署 Edge Function

### 为什么需要重新部署？
我更新了代码，添加了更好的错误处理和日志记录。

### 操作步骤：

1. 访问：https://supabase.com/dashboard/project/vhrzyhqnlngrtvfedzmr/functions/server

2. 编辑 `server` 函数

3. 复制 `all2/supabase/functions/server/index.tsx` 的全部内容

4. 粘贴到 Supabase 编辑器（替换现有代码）

5. 点击 "Deploy"

6. 确认环境变量已设置：
   - `SUPABASE_URL`: https://vhrzyhqnlngrtvfedzmr.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY`: (从 Settings > API 获取)

### 测试部署：

```bash
cd all2
node scripts/test-api.cjs
```

## 第二步：部署前端到 Vercel

### 方法1：使用 Vercel CLI (推荐)

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
cd all2
vercel --prod
```

### 方法2：通过 Vercel Dashboard

1. 访问：https://vercel.com/new

2. 导入 Git 仓库或上传项目

3. 配置项目：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. 添加环境变量：
   - `VITE_SUPABASE_URL`: https://vhrzyhqnlngrtvfedzmr.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocnp5aHFubG5ncnR2ZmVkem1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTYyNjQsImV4cCI6MjA4ODc5MjI2NH0.fM0uGHgoKnD3WVmrJkLivYV66YzlFyTbq8YhZaVOVRg
   - `VITE_API_BASE_URL`: https://vhrzyhqnlngrtvfedzmr.supabase.co/functions/v1

5. 点击 "Deploy"

## 第三步：配置 Supabase Storage (可选)

如果需要图片上传功能：

1. 访问：https://supabase.com/dashboard/project/vhrzyhqnlngrtvfedzmr/storage/buckets

2. 创建新 bucket：
   - 名称：`moments`
   - Public: ✅ 勾选
   - File size limit: 50MB

3. 配置 Policies（已在 SQL 迁移中完成）

## 第四步：创建测试账号

部署完成后，访问你的 Vercel URL 并创建测试账号：

### 测试账号1（密码登录）
- Email: test@lifemoments.com
- Password: test123456
- Nickname: Test User

### 测试账号2（邮箱验证码登录）
- Email: demo@lifemoments.com
- 使用邮箱验证码登录

## 第五步：完整功能测试

### 测试清单：

- [ ] 用户注册
- [ ] 密码登录
- [ ] 邮箱验证码登录
- [ ] 创建 Moment（文本）
- [ ] 创建 Moment（带图片）
- [ ] 查看 Dashboard
- [ ] 查看生活进度
- [ ] 查看 Moment 详情
- [ ] 编辑 Moment
- [ ] 删除 Moment
- [ ] 退出登录
- [ ] 移动端适配

## 故障排查

### Edge Function 错误

查看日志：
https://supabase.com/dashboard/project/vhrzyhqnlngrtvfedzmr/functions/server/logs

常见问题：
- 环境变量未设置
- 数据库表不存在
- CORS 问题

### 前端错误

打开浏览器控制台查看错误信息

常见问题：
- API URL 配置错误
- 环境变量未设置
- Token 存储问题

### 数据库错误

检查 Supabase SQL Editor：
https://supabase.com/dashboard/project/vhrzyhqnlngrtvfedzmr/sql/new

验证表是否存在：
```sql
SELECT * FROM users LIMIT 1;
SELECT * FROM moments LIMIT 1;
```

## 最终交付

部署成功后，提供以下信息：

1. **生产环境 URL**：(Vercel 提供的 URL)
2. **测试账号**：
   - Email: test@lifemoments.com
   - Password: test123456
3. **API 端点**：https://vhrzyhqnlngrtvfedzmr.supabase.co/functions/v1/server
4. **数据库**：Supabase PostgreSQL
5. **存储**：Supabase Storage (moments bucket)

## 下一步优化建议

1. 配置自定义域名
2. 添加 Google Analytics
3. 优化图片加载（懒加载）
4. 添加 PWA 支持
5. 实现真实的邮件发送（SendGrid/Resend）
6. 使用真实的 JWT 库
7. 添加单元测试
8. 添加 E2E 测试

