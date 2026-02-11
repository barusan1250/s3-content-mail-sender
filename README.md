# S3 Content Mail Sender

S3バケットからテキストと音声ファイルを取得し、SMTP経由でメール送信するAWS Lambda関数。  
テキストはメール本文に、音声は添付ファイルとして送信されます。

## セットアップ

```bash
npm install
cp .env.example .env
# .env を編集して設定値を入力 (Gmailや外部SMTPを使う場合はその情報を設定)
```

## ローカルテスト (MinIO + Mailpit)

```bash
# MinIO + Mailpit 起動
docker compose up -d

# 実行 (SMTP経由でMailpitに送信)
npm run invoke
```

- MinIO Console: <http://localhost:9021> (minioadmin / minioadmin)
- Mailpit WebUI: <http://localhost:8025> (送信メール確認用)

## 環境変数

| 変数 | 説明 | 例 |
|---|---|---|
| `S3_BUCKET_NAME` | S3バケット名 | `mail-content` |
| `S3_TEXT_KEY` | テキストのS3キー | `sample-mail.txt` |
| `S3_AUDIO_KEY` | 音声のS3キー (省略可) | `audio.wav` |
| `AWS_REGION` | S3リージョン | `ap-northeast-1` |
| `S3_ENDPOINT` | S3エンドポイント (MinIO用) | `http://localhost:9020` |
| `AWS_USE_PATH_STYLE_ENDPOINT` | パススタイル (MinIO用) | `true` |
| `AWS_ACCESS_KEY_ID` | S3アクセスキー | - |
| `AWS_SECRET_ACCESS_KEY` | S3シークレットキー | - |
| `SMTP_HOST` | SMTPホスト | `localhost` |
| `SMTP_PORT` | SMTPポート | `1025` |
| `SMTP_USER` | SMTPユーザー名 | - |
| `SMTP_PASS` | SMTPパスワード | - |
| `SMTP_SECURE` | SSL使用 (465ポートならtrue) | `false` |
| `MAIL_FROM_EMAIL` | 送信元メールアドレス | `sender@example.com` |
| `MAIL_TO_EMAILS` | 送信先 (カンマ区切り) | `a@example.com` |
| `MAIL_SUBJECT` | メール件名 | `S3 Content Mail` |
| `MAIL_DRY_RUN` | ログ出力のみ | `false` |

## AWS デプロイ (SAM)

```bash
sam build
sam deploy --guided
```

## プロジェクト構成

```
├── handler.js          # Lambda handler + CLI entrypoint
├── lib/
│   └── workflow.js     # メール送信ワークフロー
├── utils/
│   ├── s3.js           # S3操作ユーティリティ
│   └── mail.js         # SMTPメール送信ユーティリティ
├── init/
│   └── sample-mail.txt # ローカルテスト用サンプル
├── docker-compose.yml  # MinIO + Mailpit 環境
├── template.yaml       # SAMテンプレート
└── Makefile            # SAMビルド設定
```
