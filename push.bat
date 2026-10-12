@echo off
REM === 博客一键推送脚本 ===
REM 前置条件（只需做一次）：
REM   1. GitHub 上已建好空仓库 dddhhhxxx.github.io
REM   2. 已把 SSH 公钥加到 GitHub -> Settings -> SSH and GPG keys
REM 之后每次写完文章，双击本文件即可发布

set "GIT_HOME=C:\Users\donghuaxiong\.workbuddy\binaries\PortableGit\versions\1.2.0"
set "PATH=%GIT_HOME%\cmd;%GIT_HOME%\mingw64\bin;%GIT_HOME%\usr\bin;%PATH%"

cd /d "%~dp0"

echo.
echo [1/3] 检查改动...
git add -A

echo [2/3] 提交改动...
set /p MSG=请输入提交说明（直接回车用默认说明）:
if "%MSG%"=="" set MSG=update posts
git commit -m "%MSG%" || echo (没有需要提交的改动，直接推送)

echo [3/3] 推送到 GitHub...
git push -u origin main

echo.
echo 完成。1~2 分钟后访问 https://dddhhhxxx.github.io 查看效果
echo 部署进度：https://github.com/dddhhhxxx/dddhhhxxx.github.io/actions
pause
