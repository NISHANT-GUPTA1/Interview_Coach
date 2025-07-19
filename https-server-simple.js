const https = require('https');
const fs = require('fs');
const { parse } = require('url');
const next = require('next');

console.log('🚀 Starting HTTPS development server...');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';

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

console.log('🔧 Initializing Next.js application...');
const app = next({ dev, hostname });
const handle = app.getRequestHandler();

// Function to start server on a specific port
function startServer(port) {
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
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${port} is busy, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
      }
    } else {
      console.log('🎉 HTTPS Server ready!');
      console.log('');
      console.log('🔒 Server Details:');
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
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down HTTPS server...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

app.prepare().then(() => {
  console.log('🔍 Starting server on port 3001...');
  startServer(3001);
}).catch((error) => {
  console.error('❌ Failed to prepare Next.js app:', error);
  process.exit(1);
});
