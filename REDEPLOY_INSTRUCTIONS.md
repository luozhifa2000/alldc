# 重新部署 Edge Function

我已经更新了 Edge Function 代码，添加了更好的错误日志和处理。

## 需要重新部署

### 步骤：

1. **打开 Supabase Functions**
   - 访问：https://supabase.com/dashboard/project/vhrzyhqnlngrtvfedzmr/functions/server

2. **编辑函数**
   - 点击 "server" 函数
   - 点击 "Edit function" 或类似按钮

3. **替换代码**
   - 打开文件：`all2/supabase/functions/server/index.tsx`
   - 复制所有内容
   - 粘贴到 Supabase 编辑器中（替换现有代码）

4. **保存并部署**
   - 点击 "Deploy" 或 "Save"

5. **检查环境变量**
   确保设置了以下环境变量：
   - `SUPABASE_URL`: https://vhrzyhqnlngrtvfedzmr.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY`: (从 Settings > API 获取 service_role key)
   
   如果没有 SERVICE_ROLE_KEY，也可以使用：
   - `SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocnp5aHFubG5ncnR2ZmVkem1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTYyNjQsImV4cCI6MjA4ODc5MjI2NH0.fM0uGHgoKnD3WVmrJkLivYV66YzlFyTbq8YhZaVOVRg

## 更新内容

1. 添加了详细的控制台日志
2. 改进了错误处理
3. 添加了环境变量的默认值
4. 使用 `maybeSingle()` 代替 `single()` 避免错误

## 部署后测试

运行测试脚本：
```bash
cd all2
node scripts/test-api.cjs
```

或者手动测试注册：
```bash
curl -X POST https://vhrzyhqnlngrtvfedzmr.supabase.co/functions/v1/server/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocnp5aHFubG5ncnR2ZmVkem1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTYyNjQsImV4cCI6MjA4ODc5MjI2NH0.fM0uGHgoKnD3WVmrJkLivYV66YzlFyTbq8YhZaVOVRg" \
  -d '{"email":"test@lifemoments.com","nickname":"Test User","password":"test123456"}'
```

## 查看日志

如果仍有问题，查看函数日志：
https://supabase.com/dashboard/project/vhrzyhqnlngrtvfedzmr/functions/server/logs

