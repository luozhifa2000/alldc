# Life Moments 测试计划

## 前置条件

1. ✅ 数据库已迁移
2. ⏳ Edge Function 已部署
3. ✅ 前端开发服务器运行中 (http://localhost:5173)

## 测试流程

### 1. 用户注册测试

**步骤：**
1. 访问 http://localhost:5173
2. 点击注册按钮
3. 填写信息：
   - Email: test@lifemoments.com
   - Nickname: Test User
   - Password: test123456
4. 提交注册

**预期结果：**
- 注册成功
- 自动登录
- 跳转到 Dashboard

### 2. 用户登录测试（密码登录）

**步骤：**
1. 退出登录
2. 点击登录
3. 选择密码登录
4. 输入：
   - Email: test@lifemoments.com
   - Password: test123456
5. 提交

**预期结果：**
- 登录成功
- 跳转到 Dashboard

### 3. 用户登录测试（邮箱验证码）

**步骤：**
1. 退出登录
2. 点击登录
3. 选择邮箱验证码登录
4. 输入 Email: test2@lifemoments.com
5. 点击发送验证码
6. 查看控制台获取验证码（开发模式）
7. 输入验证码
8. 提交

**预期结果：**
- 登录成功
- 如果是新邮箱，自动创建账号
- 跳转到 Dashboard

### 4. 创建 Moment 测试

**步骤：**
1. 在 Dashboard 点击 "Create Moment" 或 "+"
2. 填写信息：
   - 短描述: "完成了第一个项目"
   - 富文本内容: 添加文本块和图片
   - 影响值: +0.5%
   - 影响类型: 正面
3. 提交

**预期结果：**
- Moment 创建成功
- 返回 Dashboard
- 看到新创建的 Moment
- 生活进度分数更新

### 5. Dashboard 功能测试

**步骤：**
1. 查看生活进度分数
2. 查看开始日期
3. 滚动查看 Moments 列表
4. 点击某个 Moment 查看详情

**预期结果：**
- 显示正确的进度分数
- 显示用户注册日期
- Moments 按时间倒序排列
- 可以正常查看详情

### 6. Moment 详情和编辑测试

**步骤：**
1. 点击某个 Moment 进入详情页
2. 查看富文本内容和图片
3. 点击编辑
4. 修改内容
5. 保存

**预期结果：**
- 详情页正确显示所有内容
- 编辑功能正常
- 保存后内容更新
- 生活进度重新计算

### 7. 删除 Moment 测试

**步骤：**
1. 在 Moment 详情页
2. 点击删除按钮
3. 确认删除

**预期结果：**
- Moment 被删除
- 返回 Dashboard
- 列表中不再显示该 Moment
- 生活进度重新计算

### 8. 响应式设计测试

**步骤：**
1. 在浏览器中打开开发者工具
2. 切换到移动设备视图
3. 测试所有页面

**预期结果：**
- 所有页面在移动设备上正常显示
- 交互功能正常
- 布局适配良好

## 测试账号

### 主测试账号
- Email: test@lifemoments.com
- Password: test123456
- Nickname: Test User

### 备用测试账号
- Email: test2@lifemoments.com
- 登录方式: 邮箱验证码

## 已知问题

1. **Edge Function 未部署**
   - 当前前端会调用 API 失败
   - 需要先部署 Edge Function

2. **图片上传**
   - 需要配置 Supabase Storage
   - 需要创建 "moments" bucket

## 下一步

1. 部署 Edge Function
2. 配置 Supabase Storage
3. 运行完整测试
4. 修复发现的 bug
5. 部署到生产环境

