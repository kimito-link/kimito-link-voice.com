// 簡易HTTPサーバー
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'demo.html' : req.url);
    
    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif'
    };
    
    const contentType = contentTypes[ext] || 'text/plain';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🎉 蒼凪しずく生誕祭デモサーバー起動！`);
    console.log(`📺 http://localhost:${PORT} でアクセスしてください`);
    console.log(`\n🎬 録画の準備：`);
    console.log(`1. OBSやGame Barで画面録画を開始`);
    console.log(`2. ブラウザでデモページを開く`);
    console.log(`3. 自動アニメーションを録画`);
    console.log(`\n💡 Ctrl+C でサーバー停止`);
});
