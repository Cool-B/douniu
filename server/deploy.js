// 自动化部署脚本 — 编译 + 推送 CloudRun
const { execSync } = require('child_process');
const path = require('path');

const SERVER_NAME = 'douniu';
const ENV_ID = 'douniu-d4gyqnvp26732ea37';
const PORT = 3000;
const ROOT = __dirname;

function run(cmd, label) {
  console.log(`\n▶ ${label}`);
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

(async () => {
  // Step 1: 编译 TypeScript
  run('npm run build', '编译 TypeScript');

  // Step 2: 推送到 CloudRun
  run(
    `npx tcb cloudrun deploy --serviceName ${SERVER_NAME} --port ${PORT} --env-id ${ENV_ID} --force`,
    '部署到 CloudRun'
  );

  console.log('\n✅ 部署完成！');
})().catch((e) => {
  console.error('\n❌ 部署失败:', e.message);
  process.exit(1);
});
