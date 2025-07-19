const https = require('https');
const fs = require('fs');

console.log('🔍 Testing HTTPS server startup...');

// Check if certificates exist
try {
  const key = fs.readFileSync('./localhost+2-key.pem');
  const cert = fs.readFileSync('./localhost+2.pem');
  console.log('✅ SSL certificates found and loaded');
  
  const httpsOptions = { key, cert };
  
  // Test server on port 3001
  const server = https.createServer(httpsOptions, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTPS Test Server Working!\n');
  });
  
  server.listen(3001, (err) => {
    if (err) {
      console.error('❌ Failed to start on port 3001:', err.message);
      // Try port 3002
      server.listen(3002, (err2) => {
        if (err2) {
          console.error('❌ Failed to start on port 3002:', err2.message);
        } else {
          console.log('🎉 HTTPS test server started on port 3002!');
          console.log('📍 Test URL: https://localhost:3002');
          console.log('🔒 HTTPS is working correctly!');
        }
      });
    } else {
      console.log('🎉 HTTPS test server started on port 3001!');
      console.log('📍 Test URL: https://localhost:3001');
      console.log('🔒 HTTPS is working correctly!');
    }
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down test server...');
    server.close();
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Certificate error:', error.message);
  console.log('💡 Make sure you have run: mkcert localhost 127.0.0.1 ::1');
}
