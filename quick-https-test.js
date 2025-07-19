const https = require('https');
const fs = require('fs');

// Very simple HTTPS test
const options = {
  key: fs.readFileSync('./localhost+2-key.pem'),
  cert: fs.readFileSync('./localhost+2.pem')
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>HTTPS Test</title></head>
      <body>
        <h1>🎉 HTTPS is Working!</h1>
        <p>✅ SSL certificates are valid</p>
        <p>🔒 Secure connection established</p>
        <p>🎤 Speech recognition will work on this server!</p>
        <hr>
        <p><strong>Next step:</strong> Stop this test server (Ctrl+C) and run the full Next.js HTTPS server</p>
      </body>
    </html>
  `);
});

console.log('🔍 Testing basic HTTPS server...');
server.listen(3001, () => {
  console.log('🎉 Test HTTPS server running!');
  console.log('📍 URL: https://localhost:3001');
  console.log('🚀 Open this URL to test the certificate');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('❌ Port 3001 busy, trying 3002...');
    server.listen(3002, () => {
      console.log('🎉 Test HTTPS server running on port 3002!');
      console.log('📍 URL: https://localhost:3002');
    });
  } else {
    console.error('❌ Server error:', err);
  }
});
