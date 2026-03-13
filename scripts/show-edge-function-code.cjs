/**
 * Display Edge Function code for manual deployment
 */

const fs = require('fs');
const path = require('path');

const functionPath = path.join(__dirname, '../supabase/functions/server/index.tsx');
const code = fs.readFileSync(functionPath, 'utf8');

console.log('\n==============================================');
console.log('Edge Function 部署代码');
console.log('==============================================\n');

console.log('请按以下步骤部署：\n');
console.log('1. 访问: https://supabase.com/dashboard/project/vhrzyhqnlngrtvfedzmr/functions');
console.log('2. 点击 "Create a new function"');
console.log('3. 函数名称输入: server');
console.log('4. 复制下面的代码并粘贴到编辑器中');
console.log('5. 点击 "Deploy"\n');

console.log('==============================================');
console.log('代码开始：');
console.log('==============================================\n');
console.log(code);
console.log('\n==============================================');
console.log('代码结束');
console.log('==============================================\n');

console.log('部署后，请设置以下环境变量：');
console.log('- SUPABASE_URL: https://vhrzyhqnlngrtvfedzmr.supabase.co');
console.log('- SUPABASE_SERVICE_ROLE_KEY: (从 Settings > API 获取)\n');

