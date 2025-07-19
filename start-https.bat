@echo off
echo 🚀 Starting HTTPS Server for Speech Recognition...
echo.
echo Method 1: Using custom HTTPS server
echo node https-server.js
echo.
echo Method 2: Using Next.js with HTTPS
echo npm run dev-https-simple
echo.
echo Method 3: Using http-server with certificates
echo npx http-server .next -S -C localhost+2.pem -K localhost+2-key.pem -p 8080
echo.
echo 📝 Pick one method and run it manually:
echo.
echo ✅ Certificates are ready at:
dir *.pem
echo.
echo 🌐 Once server starts, go to: https://localhost:3001
echo 🎤 Speech recognition will work perfectly!
echo.
pause
