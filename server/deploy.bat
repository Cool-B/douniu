@echo off
chcp 65001 >nul
setlocal

echo.
echo ========================================
echo   斗牛后端 - 编译 + 部署到 CloudRun
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 编译 TypeScript...
call npx tsc
if errorlevel 1 (
  echo [X] 编译失败，请检查代码错误
  exit /b 1
)
echo [√] 编译完成
echo.

echo [2/3] 检查 dist 产物...
if not exist "dist\index.js" (
  echo [X] dist\index.js 不存在
  exit /b 1
)
echo [√] dist\index.js 已生成
echo.

echo [3/3] 部署到 CloudRun (douniu-d4gyqnvp26732ea37)...
echo 注意: --force 仍会问"确认覆盖"，请按回车确认
echo.
echo "" | tcb cloudrun deploy --serviceName douniu --port 3000 --env-id douniu-d4gyqnvp26732ea37 --force
if errorlevel 1 (
  echo [X] 部署失败
  exit /b 1
)

echo.
echo ========================================
echo   部署成功！
echo ========================================
echo.
echo 后端地址: https://douniu-286232-10-1457346560.sh.run.tcloudbase.com
echo.

endlocal
