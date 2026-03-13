# 部署 Edge Function 到 Supabase

## 方法1：使用 Supabase Dashboard (推荐)

### 步骤：

1. **访问 Supabase Dashboard**
   - 打开：https://supabase.com/dashboard/project/vhrzyhqnlngrtvfedzmr/functions

2. **创建新的 Edge Function**
   - 点击 "Create a new function"
   - 函数名称：`server`
   - 点击 "Create function"

3. **上传代码**
   - 将 `supabase/functions/server/index.tsx` 的内容复制
   - 粘贴到 Edge Function 编辑器中
   - 点击 "Deploy"

4. **配置环境变量**
   - 在 Function 设置中添加环境变量：
     - `SUPABASE_URL`: https://vhrzyhqnlngrtvfedzmr.supabase.co
     - `SUPABASE_SERVICE_ROLE_KEY`: (从 Settings > API 获取)

## 方法2：使用 Supabase CLI

### 安装 Supabase CLI：
```bash
npm install -g supabase
```

### 登录：
```bash
supabase login
```

### 链接项目：
```bash
cd all2
supabase link --project-ref vhrzyhqnlngrtvfedzmr
```

### 部署函数：
```bash
supabase functions deploy server
```

### 设置环境变量：
```bash
supabase secrets set SUPABASE_URL=https://vhrzyhqnlngrtvfedzmr.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 方法3：手动部署（临时方案）

由于 Edge Function 使用 Deno 运行时，我们可以先在本地测试，然后通过 Dashboard 手动部署。

### 测试 API 端点：

部署后，API 将在以下地址可用：
```
https://vhrzyhqnlngrtvfedzmr.supabase.co/functions/v1/server
```

### 测试端点：

```bash
# 健康检查
curl https://vhrzyhqnlngrtvfedzmr.supabase.co/functions/v1/server/make-server-4f970b1f/health

# 注册
curl -X POST https://vhrzyhqnlngrtvfedzmr.supabase.co/functions/v1/server/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","nickname":"Test User","password":"test123456"}'

# 登录
curl -X POST https://vhrzyhqnlngrtvfedzmr.supabase.co/functions/v1/server/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

## 注意事项

1. **CORS 配置**：已在代码中配置为允许所有来源（`origin: "*"`），生产环境建议限制为特定域名

2. **认证**：使用简单的 Base64 token，生产环境建议使用 JWT

3. **错误处理**：已添加基本错误处理，可根据需要增强

4. **日志**：使用 Hono logger 中间件记录所有请求

## 验证部署

部署成功后，访问：
```
https://vhrzyhqnlngrtvfedzmr.supabase.co/functions/v1/server/make-server-4f970b1f/health
```

应该返回：
```json
{"status":"ok"}
```

