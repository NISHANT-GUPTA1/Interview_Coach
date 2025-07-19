const https = require('https');
const fs = require('fs');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001;

// Read the mkcert certificates
const httpsOptions = {
  key: fs.readFileSync('./localhost+2-key.pem'),
  cert: fs.readFileSync('./localhost+2.pem'),
};

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
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
    if (err) throw err;
    console.log('🔒 HTTPS Server ready!');
    console.log(`🚀 Open: https://localhost:${port}`);
    console.log('🎤 Speech recognition will work perfectly on this HTTPS server!');
    console.log('');
    console.log('📝 Test steps:');
    console.log('1. Go to https://localhost:3001');
    console.log('2. Accept the certificate (click "Advanced" → "Proceed")');
    console.log('3. Go to interview page');
    console.log('4. Select Hindi/Tamil/Telugu language');
    console.log('5. Test speech recognition - it should work!');
  });
});
