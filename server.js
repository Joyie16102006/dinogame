const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.data': 'application/octet-stream',
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';

  let filePath = path.join(PUBLIC_DIR, decodeURIComponent(reqUrl));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.end('404 Not Found');
      return;
    }

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    };

    let ext = path.extname(filePath).toLowerCase();

    if (ext === '.br') {
      headers['Content-Encoding'] = 'br';
      const baseExt = path.extname(filePath.slice(0, -3)).toLowerCase();
      if (baseExt === '.js') {
        headers['Content-Type'] = 'application/javascript';
      } else if (baseExt === '.wasm') {
        headers['Content-Type'] = 'application/wasm';
      } else if (baseExt === '.data') {
        headers['Content-Type'] = 'application/octet-stream';
      } else {
        headers['Content-Type'] = mimeTypes[baseExt] || 'application/octet-stream';
      }
    } else {
      headers['Content-Type'] = mimeTypes[ext] || 'application/octet-stream';
    }

    headers['Content-Length'] = stats.size;

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Unity WebGL server running on http://localhost:${PORT}`);
});
