const https = require('https');
const fs = require('fs');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
let port = 3001;

// Read the mkcert certificates
let httpsOptions;
try {
  httpsOptions = {
    key: fs.readFileSync('./localhost+2-key.pem'),
    cert: fs.readFileSync('./localhost+2.pem'),
  };
  console.log('✅ SSL certificates loaded successfully');
} catch (error) {
  console.error('❌ Failed to load SSL certificates:', error.message);
  console.log('💡 Make sure you have run: mkcert localhost 127.0.0.1 ::1');
  process.exit(1);
}

const app = next({ dev, hostname });
const handle = app.getRequestHandler();

// Function to find available port
async function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(startPort, (err) => {
      if (err) {
        server.close();
        resolve(findAvailablePort(startPort + 1));
      } else {
        const port = server.address().port;
        server.close();
        resolve(port);
      }
    });
    
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

app.prepare().then(async () => {
  console.log('🔍 Looking for available port starting from 3001...');
  
  // Find available port starting from 3001
  port = await findAvailablePort(3001);
  console.log(`🎯 Found available port: ${port}`);
  
  const server = https.createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  server.listen(port, (err) => {
    if (err) {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    }
    
    console.log('🎉 HTTPS Server ready!');
    console.log('');
    console.log('� Server Details:');
    console.log(`📍 URL: https://localhost:${port}`);
    console.log(`🌐 Network: https://127.0.0.1:${port}`);
    console.log('');
    console.log('🎤 Speech Recognition Features:');
    console.log('✅ HTTPS enabled - Speech recognition will work!');
    console.log('✅ Microphone access available');
    console.log('✅ Multilingual TTS ready');
    console.log('');
    console.log('📝 Test Steps:');
    console.log(`1. Open: https://localhost:${port}`);
    console.log('2. Accept certificate (click "Advanced" → "Proceed")');
    console.log('3. Go to interview page');
    console.log('4. Select Hindi/Tamil/Telugu language');
    console.log('5. Questions will speak in selected language!');
    console.log('6. Test speech recognition - it will work!');
    console.log('');
    console.log('🚀 Ready for testing!');
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down HTTPS server...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
});
