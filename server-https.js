const https = require('https');
const fs = require('fs');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Self-signed certificate (for development only)
const httpsOptions = {
  key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
wQNhM5Z/oTXXj2jR8d8UcAq5dKiDggJhZOjXqcVMzXF2H2wKGr8Qp9f7E8HJVL
OOJtx3sB6XPpShTF1xFM3vHD3qjOHnBJT7eKlgOjLpFnJgGKHbcZj2Jm2rI+x8
-----END PRIVATE KEY-----`,
  cert: `-----BEGIN CERTIFICATE-----
MIIDBTCCAe2gAwIBAgIJAMZWkjHbR1+JMA0GCSqGSIb3DQEBCwUAMBkxFzAVBgNV
BAMMDmxvY2FsaG9zdC50ZXN0MB4XDTE5MDUwNzE1MDMwNVoXDTI5MDUwNDE1MDMw
NVowGTEXMBUGA1UEAwwObG9jYWxob3N0LnRlc3QwggEiMA0GCSqGSIb3DQEBAQUA
-----END CERTIFICATE-----`
};

app.prepare().then(() => {
  const server = https.createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(3001, (err) => {
    if (err) throw err;
    console.log('🔒 HTTPS Server ready on https://localhost:3001');
    console.log('🎤 Speech recognition will work on this HTTPS server!');
  });
});
