@echo off
echo 🔒 Setting up HTTPS for local development...

REM Create certificates directory
if not exist "certs" mkdir certs

echo.
echo 📋 To enable HTTPS for speech recognition, you can use one of these methods:
echo.
echo Option 1 - Use mkcert (Recommended):
echo   1. Install mkcert: choco install mkcert (or download from GitHub)
echo   2. Run: mkcert -install
echo   3. Run: mkcert localhost 127.0.0.1 ::1
echo   4. Copy the generated files to certs/ folder
echo.
echo Option 2 - Use OpenSSL (if installed):
echo   openssl genrsa -out certs/key.pem 2048
echo   openssl req -new -x509 -key certs/key.pem -out certs/cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
echo.
echo Option 3 - Use Node.js HTTPS server:
echo   Create a simple HTTPS server with Node.js
echo.
echo 🚀 After getting certificates, run your app with HTTPS:
echo   npx http-server -S -C certs/cert.pem -K certs/key.pem -p 8080
echo.
echo 📝 Then access your app at: https://localhost:8080
echo ⚠️  You'll need to accept the self-signed certificate in your browser
echo.
pause
