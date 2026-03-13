# Life Moments 部署指南

## 1. 数据库部署

### 方法1：使用Supabase Dashboard (推荐)
1. 访问 https://supabase.com/dashboard/project/vhrzyhqnlngrtvfedzmr
2. 进入 SQL Editor
3. 复制 `supabase/migrations/001_initial_schema.sql` 的内容
4. 粘贴并执行

### 方法2：使用Supabase CLI
```bash
cd all2
npx supabase db push
```

## 2. 部署Edge Function

### 使用Supabase CLI
```bash
cd all2
npx supabase functions deploy server
```

### 设置环境变量
在Supabase Dashboard中设置以下环境变量：
- `SUPABASE_URL`: https://vhrzyhqnlngrtvfedzmr.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY`: (从Supabase Dashboard获取)

## 3. 部署前端到Vercel

### 准备工作
1. 确保 `.env` 文件包含正确的环境变量
2. 构建项目测试：
```bash
cd all2
npm run build
```

### 部署到Vercel
```bash
cd all2
npx vercel --prod
```

或者通过Vercel Dashboard导入GitHub仓库

### Vercel环境变量设置
在Vercel项目设置中添加：
- `VITE_SUPABASE_URL`: https://vhrzyhqnlngrtvfedzmr.supabase.co
- `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- `VITE_API_BASE_URL`: https://vhrzyhqnlngrtvfedzmr.supabase.co/functions/v1

## 4. 测试

### 创建测试账号
- Email: test@lifemoments.com
- Password: test123456
- Nickname: Test User

### 测试流程
1. 注册新账号
2. 登录
3. 创建Moment
4. 查看Dashboard
5. 编辑/删除Moment
6. 测试邮箱验证码登录

## 5. 故障排查

### 数据库连接问题
- 检查Supabase项目是否激活
- 验证DATABASE_URL是否正确

### Edge Function问题
- 查看Supabase Functions日志
- 确认CORS设置正确

### 前端问题
- 检查浏览器控制台错误
- 验证API_BASE_URL配置
- 确认token存储正常

