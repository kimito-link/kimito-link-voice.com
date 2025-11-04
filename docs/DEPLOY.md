# KimiLink Voice デプロイガイド

このガイドでは、KimiLink Voiceを様々な環境にデプロイする方法を説明します。

## 📋 デプロイ前のチェックリスト

- [ ] すべての必要な画像ファイルを`images/`フォルダに配置
- [ ] `.env`ファイルを作成し、必要な環境変数を設定
- [ ] Twitter Developer Portalでアプリを登録
- [ ] OAuth 2.0の設定を完了
- [ ] ドメインとSSL証明書を準備（本番環境）

## 🌐 静的ホスティング（推奨初心者向け）

### 1. GitHub Pages

#### 手順:
```bash
# GitHubリポジトリを作成
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/kimitolink-voice.git
git push -u origin main

# GitHub Pagesを有効化
# Settings > Pages > Source > main branch > Save
```

#### 設定:
- カスタムドメインを設定可能
- 自動SSL証明書
- 無料

### 2. Netlify

#### 手順:
```bash
# Netlify CLIをインストール
npm install -g netlify-cli

# ログイン
netlify login

# デプロイ
netlify deploy --prod
```

#### netlify.toml設定:
```toml
[build]
  publish = "."
  command = "echo 'No build command'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### 3. Vercel

#### 手順:
```bash
# Vercel CLIをインストール
npm install -g vercel

# デプロイ
vercel --prod
```

#### vercel.json設定:
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## 🖥️ VPS/専用サーバー

### Ubuntu/Debian

#### 1. Nginxのインストール:
```bash
# システム更新
sudo apt update && sudo apt upgrade -y

# Nginxインストール
sudo apt install nginx -y

# ファイアウォール設定
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### 2. サイトファイルの配置:
```bash
# プロジェクトディレクトリを作成
sudo mkdir -p /var/www/kimitolink-voice

# ファイルをコピー
sudo cp -r * /var/www/kimitolink-voice/

# 権限設定
sudo chown -R www-data:www-data /var/www/kimitolink-voice
sudo chmod -R 755 /var/www/kimitolink-voice
```

#### 3. Nginx設定:
```bash
sudo nano /etc/nginx/sites-available/kimitolink-voice
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name kimitolink-voice.com www.kimitolink-voice.com;

    root /var/www/kimitolink-voice;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静的ファイルのキャッシュ
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip圧縮
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

#### 4. サイトを有効化:
```bash
sudo ln -s /etc/nginx/sites-available/kimitolink-voice /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL証明書（Let's Encrypt）:
```bash
# Certbotインストール
sudo apt install certbot python3-certbot-nginx -y

# SSL証明書取得
sudo certbot --nginx -d kimitolink-voice.com -d www.kimitolink-voice.com

# 自動更新設定
sudo certbot renew --dry-run
```

### CentOS/RHEL

```bash
# Nginxインストール
sudo yum install epel-release -y
sudo yum install nginx -y

# 以降はUbuntuと同様の手順
```

## 🐳 Docker

### Dockerfile:
```dockerfile
FROM nginx:alpine

# 静的ファイルをコピー
COPY . /usr/share/nginx/html

# Nginx設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml:
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./images:/usr/share/nginx/html/images
    restart: always
```

### デプロイ:
```bash
# イメージをビルド
docker-compose build

# コンテナを起動
docker-compose up -d

# ログを確認
docker-compose logs -f
```

## ☁️ クラウドプラットフォーム

### AWS S3 + CloudFront

#### 1. S3バケット作成:
```bash
aws s3 mb s3://kimitolink-voice
```

#### 2. ファイルアップロード:
```bash
aws s3 sync . s3://kimitolink-voice --exclude ".git/*" --exclude "node_modules/*"
```

#### 3. 静的ウェブサイトホスティング有効化:
```bash
aws s3 website s3://kimitolink-voice --index-document index.html
```

#### 4. CloudFront設定:
- ディストリビューション作成
- SSL証明書設定
- カスタムドメイン設定

### Google Cloud Storage

```bash
# バケット作成
gsutil mb gs://kimitolink-voice

# ファイルアップロード
gsutil -m rsync -r . gs://kimitolink-voice

# 公開設定
gsutil iam ch allUsers:objectViewer gs://kimitolink-voice
```

## 🔒 セキュリティ設定

### HTTPセキュリティヘッダー

Nginx設定に追加:
```nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.twitter.com;" always;
```

### ファイアウォール設定

UFW（Ubuntu）:
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 📊 モニタリング

### 1. Uptime監視
- [UptimeRobot](https://uptimerobot.com/) - 無料
- [Pingdom](https://www.pingdom.com/)

### 2. エラー追跡
- [Sentry](https://sentry.io/)
```javascript
// script.jsに追加
<script src="https://browser.sentry-cdn.com/7.0.0/bundle.min.js"></script>
<script>
  Sentry.init({ dsn: 'YOUR_DSN' });
</script>
```

### 3. アクセス解析
- Google Analytics
- Plausible Analytics

## 🔄 継続的デプロイ（CI/CD）

### GitHub Actions

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🧪 デプロイ後のテスト

```bash
# サイトが正常に動作しているか確認
curl -I https://kimitolink-voice.com

# SSL証明書の確認
openssl s_client -connect kimitolink-voice.com:443 -servername kimitolink-voice.com

# パフォーマンステスト
lighthouse https://kimitolink-voice.com --view
```

## 📝 トラブルシューティング

### よくある問題

1. **画像が表示されない**
   - パスが正しいか確認
   - 画像ファイルの権限を確認
   - ブラウザのキャッシュをクリア

2. **CSSが適用されない**
   - パスが正しいか確認
   - MIMEタイプの設定を確認

3. **JavaScriptエラー**
   - ブラウザのコンソールでエラーを確認
   - CORS設定を確認

## 🆘 サポート

問題が発生した場合:
1. [GitHub Issues](https://github.com/yourusername/kimitolink-voice/issues)
2. Twitter: @streamerfunch
3. Twitter: @idolfunch

## 📚 参考資料

- [Nginx公式ドキュメント](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Netlify ドキュメント](https://docs.netlify.com/)
- [Vercel ドキュメント](https://vercel.com/docs)
