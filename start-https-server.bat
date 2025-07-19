@echo off
echo 🚀 Starting HTTPS Interview Coach Server
echo.

echo 📁 Checking certificates...
if exist "localhost+2.pem" (
    echo ✅ Certificate found: localhost+2.pem
) else (
    echo ❌ Certificate not found! Run mkcert first.
    pause
    exit
)

if exist "localhost+2-key.pem" (
    echo ✅ Key found: localhost+2-key.pem
) else (
    echo ❌ Key file not found! Run mkcert first.
    pause
    exit
)

echo.
echo 🔧 Starting HTTPS server...
echo 📝 Access your app at: https://localhost:3001
echo 🎤 Speech recognition will work with HTTPS!
echo.

node https-server.js

pause
