# 🔐 登录测试指南

## ✅ 问题已修复

**问题**: 前端 API 路径包含 `/server` 前缀（Supabase 遗留）
**修复**: 已移除所有 `/server` 前缀，现在使用正确的本地 API 路径

## 📝 测试账号

已为你创建好测试账号：

- **Email**: test@lifemoments.com
- **Password**: test123456
- **Nickname**: Test User

## 🧪 如何测试

### 1. 确保服务器正在运行

**终端 1 - 后端**:
```bash
cd all2
npm run server
```

应该看到：
```
🚀 Life Moments Server
📍 Server: http://localhost:3000
```

**终端 2 - 前端**:
```bash
cd all2
npm run dev
```

应该看到：
```
➜  Local:   http://localhost:5174/
```

### 2. 访问应用

打开浏览器访问：**http://localhost:5174**

### 3. 登录测试

1. 点击"登录"按钮
2. 输入：
   - Email: `test@lifemoments.com`
   - Password: `test123456`
3. 点击"登录"

**预期结果**: 成功登录并跳转到 Dashboard

### 4. 如果还是无法登录

#### 检查浏览器控制台
按 F12 打开开发者工具，查看 Console 和 Network 标签页

#### 检查 API 请求
在 Network 标签中，应该看到：
- 请求 URL: `http://localhost:3000/auth/login`
- 状态码: 200
- 响应包含 `token` 和 `user`

#### 清除浏览器缓存
1. 按 Ctrl+Shift+Delete (Windows) 或 Cmd+Shift+Delete (Mac)
2. 清除缓存和 Cookie
3. 刷新页面

#### 重新创建账号
如果测试账号有问题，可以注册新账号：
1. 点击"注册"
2. 填写任意邮箱、昵称和密码（至少6位）
3. 注册成功后会自动登录

## 🔍 验证 API 连接

在终端运行：
```bash
cd all2
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@lifemoments.com","password":"test123456"}'
```

应该返回包含 `token` 的 JSON 响应。

## ✨ 修复的内容

### 修改前（错误）:
```typescript
apiCall('/server/auth/login', ...)  // ❌ 404 错误
apiCall('/server/moments', ...)     // ❌ 404 错误
```

### 修改后（正确）:
```typescript
apiCall('/auth/login', ...)         // ✅ 正确
apiCall('/moments', ...)            // ✅ 正确
```

## 📊 完整的 API 端点列表

### 认证
- `POST /auth/register` - 注册
- `POST /auth/login` - 登录
- `POST /auth/send-code` - 发送验证码
- `POST /auth/verify-code` - 验证码登录
- `GET /auth/me` - 获取当前用户

### Moments
- `GET /moments` - 获取列表
- `POST /moments` - 创建
- `GET /moments/progress` - 获取进度
- `GET /moments/:id` - 获取详情
- `PUT /moments/:id` - 更新
- `DELETE /moments/:id` - 删除

## 🎯 下一步

登录成功后，你可以：
1. ✅ 查看 Dashboard
2. ✅ 创建新的 Moment
3. ✅ 查看生活进度
4. ✅ 编辑和删除 Moments

祝测试顺利！🎉

