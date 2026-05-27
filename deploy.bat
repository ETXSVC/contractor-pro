@echo off
echo.
echo  Deploying Contractor Pro to xtghost.net...
echo.

cd /d "d:\Builders Stream Progect\contractor-pro"

:: ── CONFIG ──────────────────────────────────────────────────────────────────
set VPS=212.28.191.134
set REGISTRY=212.28.191.134:5000
set IMAGE=%REGISTRY%/contractor-pro

:: Change JWT_SECRET before going to production!
set JWT_SECRET=vV4E6pGvJ9fQh2LXK7zN1cDbR3yT8uWmX5aZ0sQeL8nC4vH2gJ9kP7rT1wY6uB3

set DB_USER=contractor
set DB_PASS=contractor_pass
set DB_NAME=contractor_pro
set DB_URL=postgresql://%DB_USER%:%DB_PASS%@contractor-db:5432/%DB_NAME%
:: ────────────────────────────────────────────────────────────────────────────

echo [1/4] Building Docker image...
docker build -t %IMAGE% .
if %errorlevel% neq 0 ( echo BUILD FAILED & pause & exit /b 1 )

echo.
echo [2/4] Pushing to VPS registry...
docker push %IMAGE%
if %errorlevel% neq 0 ( echo PUSH FAILED & pause & exit /b 1 )

echo.
echo [3/4] Ensuring database is running on VPS...
ssh root@%VPS% "docker network create contractor-net 2>/dev/null; docker run -d --name contractor-db --network contractor-net --restart unless-stopped -e POSTGRES_USER=%DB_USER% -e POSTGRES_PASSWORD=%DB_PASS% -e POSTGRES_DB=%DB_NAME% -v contractor_pgdata:/var/lib/postgresql/data postgres:16-alpine 2>/dev/null; echo Database ready"
if %errorlevel% neq 0 ( echo DB SETUP FAILED & pause & exit /b 1 )

echo.
echo [4/4] Deploying app container on VPS...
ssh root@%VPS% "docker pull %IMAGE%:latest && docker stop contractor-pro 2>/dev/null; docker rm contractor-pro 2>/dev/null; docker run -d --name contractor-pro --network contractor-net --restart unless-stopped -p 3000:3000 -e NODE_ENV=production -e DATABASE_URL=%DB_URL% -e JWT_SECRET=%JWT_SECRET% %IMAGE%:latest"
if %errorlevel% neq 0 ( echo VPS UPDATE FAILED & pause & exit /b 1 )

echo.
echo  Done! Site is live at https://xtghost.net
echo.
pause
