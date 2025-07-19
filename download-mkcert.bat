@echo off
echo 🔽 Downloading mkcert directly...

echo.
echo 1. Go to: https://github.com/FiloSottile/mkcert/releases
echo 2. Download: mkcert-v1.4.4-windows-amd64.exe
echo 3. Rename it to: mkcert.exe
echo 4. Move it to your project folder
echo.

echo 📁 Or download it automatically:
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe' -OutFile 'mkcert.exe'"

echo.
echo ✅ Now run these commands:
echo    .\mkcert.exe -install
echo    .\mkcert.exe localhost 127.0.0.1 ::1
echo.

pause
