// 斗牛后端一键部署脚本
const { execSync } = require('child_process');
const path = require('path');

const ROOT = __dirname;
const ENV = 'douniu-d4gyqnvp26732ea37';
const NAME = 'douniu';

function run(cmd, label) {
  console.log(`\n>>> ${label}`);
  console.log(`    $ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', shell: true });
}

(async () => {
  // Step 1: 装依赖
  run('npm install --include=dev', '安装依赖');

  // Step 2: 编译 TS
  const tsc = path.join(ROOT, 'node_modules', '.bin', 'tsc.cmd');
  run(`"${tsc}"`, '编译 TypeScript');

  // Step 3: 装 tcb（全局，只需跑一次）
  try {
    execSync('tcb --version', { stdio: 'pipe', shell: true });
    console.log('\n>>> tcb 已安装');
  } catch {
    run('npm install -g @cloudbase/cli', '安装 CloudBase CLI');
  }

  // Step 4: 检查登录状态
  try {
    execSync('tcb login --status', { stdio: 'pipe', shell: true });
    console.log('\n>>> 已登录 CloudBase');
  } catch {
    console.log('\n>>> 请先登录 CloudBase：');
    run('tcb login', '登录 CloudBase（会打开浏览器）');
  }

  // Step 5: 部署
  run(
    `tcb cloudrun deploy --serviceName ${NAME} --port 3000 --env-id ${ENV} --force`,
    '部署到云端'
  );

  console.log('\n✅ 部署完成！');
})().catch((e) => {
  console.error('\n❌ 失败:', e.message?.slice(0, 200));
  process.exit(1);
});
