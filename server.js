// KimiLink Voice Server
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// 環境変数読み込み
dotenv.config();

// Expressアプリ初期化
const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// ルート設定
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API エンドポイント（仮実装）
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'KimiLink Voice is running!' });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🎤 KimiLink Voice Server is running on http://localhost:${PORT}`);
    console.log(`🎨 Powered by キミトリンク工房`);
});
