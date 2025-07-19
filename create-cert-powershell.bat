@echo off
echo 🔑 Creating self-signed certificates with OpenSSL alternative...

echo.
echo Creating a simple certificate for localhost...

powershell -Command "$cert = New-SelfSignedCertificate -DnsName 'localhost' -CertStoreLocation 'cert:\LocalMachine\My'; $pwd = ConvertTo-SecureString -String 'password' -Force -AsPlainText; Export-PfxCertificate -Cert $cert -FilePath localhost.pfx -Password $pwd; Export-Certificate -Cert $cert -FilePath localhost.crt"

echo.
echo ✅ Certificate created! Now use this with your HTTPS server.
echo.

pause
