@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM === 博客一键推送脚本 ===
REM 双击即可：自动 add -> commit -> push，GitHub Actions 随后自动构建发布

set "GIT_HOME=C:\Users\donghuaxiong\.workbuddy\binaries\PortableGit\versions\1.2.0"
set "PATH=%GIT_HOME%\cmd;%GIT_HOME%\mingw64\bin;%GIT_HOME%\usr\bin;%PATH%"

cd /d "%~dp0"

echo.
echo ===== 博客发布 =====
echo.

echo [1/4] 检查 SSH 是否可用...
ssh -o BatchMode=yes -o ConnectTimeout=10 -T git@github.com 2>&1 | findstr /C:"successfully authenticated" >nul
if errorlevel 1 (
    echo [错误] GitHub SSH 认证失败。
    echo 请确认已把 SSH 公钥添加到：
    echo https://github.com/settings/keys
    echo.
    pause
    exit /b 1
)
echo        OK

echo [2/4] 暂存改动...
git add -A
if errorlevel 1 (
    echo [错误] git add 失败。
    pause
    exit /b 1
)

echo [3/4] 提交改动...
set "MSG="
set /p MSG=提交说明（直接回车用默认 "update posts"）:
if "!MSG!"=="" set MSG=update posts
git commit -m "!MSG!"
if errorlevel 1 echo        （没有新改动，跳过提交，直接推送）

echo [4/4] 推送到 GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo [错误] 推送失败。常见原因：
    echo   1. 仓库还没建：https://github.com/new 建 dddhhhxxx.github.io
    echo   2. 仓库名/用户名写错：当前 remote 是
    git remote get-url origin
    pause
    exit /b 1
)

echo.
echo ===== 推送成功 =====
echo 站点：   https://dddhhhxxx.github.io
echo 进度：   https://github.com/dddhhhxxx/dddhhhxxx.github.io/actions
echo.
echo 注意：第一次推送后需要到上面「进度」页面确认工作流跑绿，
echo       并在仓库 Settings - Pages 里把 Source 选成 GitHub Actions。
echo.
pause
