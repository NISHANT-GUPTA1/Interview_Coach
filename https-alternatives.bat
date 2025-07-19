@echo off
echo 🔒 Alternative HTTPS Setup for Windows

echo.
echo If mkcert doesn't work, try this manual method:
echo.

echo 1. Download OpenSSL for Windows:
echo    https://slproweb.com/products/Win32OpenSSL.html
echo.

echo 2. Generate certificates manually:
echo    openssl genrsa -out localhost-key.pem 2048
echo    openssl req -new -x509 -key localhost-key.pem -out localhost.pem -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
echo.

echo 3. Or use Node.js built-in HTTPS:
echo    Create server-https.js and run: node server-https.js
echo.

echo 4. Or use browser flags (Chrome):
echo    chrome.exe --user-data-dir=/tmp/foo --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=http://localhost:3000
echo.

echo 5. Or deploy to get automatic HTTPS:
echo    - Vercel: vercel.com
echo    - Netlify: netlify.com
echo    - GitHub Pages with custom domain
echo.

pause
