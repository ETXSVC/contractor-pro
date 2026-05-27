@echo off
echo.
echo  Deploying Contractor Pro to xtghost.net...
echo.

cd /d "d:\Builders Stream Progect\contractor-pro"

echo [1/3] Building Docker image...
docker build -t 212.28.191.134:5000/contractor-pro .
if %errorlevel% neq 0 ( echo BUILD FAILED & pause & exit /b 1 )

echo.
echo [2/3] Pushing to VPS registry...
docker push 212.28.191.134:5000/contractor-pro
if %errorlevel% neq 0 ( echo PUSH FAILED & pause & exit /b 1 )

echo.
echo [3/3] Updating container on VPS...
ssh root@212.28.191.134 "docker pull 212.28.191.134:5000/contractor-pro:latest && docker stop contractor-pro && docker rm contractor-pro && docker run -d --name contractor-pro --restart unless-stopped -p 3000:3000 -e NODE_ENV=production 212.28.191.134:5000/contractor-pro:latest"
if %errorlevel% neq 0 ( echo VPS UPDATE FAILED & pause & exit /b 1 )

echo.
echo  Done! Site is live at https://xtghost.net
echo.
pause
