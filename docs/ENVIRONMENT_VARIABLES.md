# 環境変数設定ガイド

このプロジェクトで必要な環境変数の設定方法を説明します。

## 必要な環境変数

### GitHub Secrets (本番環境)

GitHub Actionsで使用するシークレットです。リポジトリの Settings → Secrets and variables → Actions で設定してください。

| Secret名 | 説明 | 取得方法 |
|---------|------|---------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID | Google Cloud Console の「認証情報」から作成 |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret | 同上 |
| `GOOGLE_REFRESH_TOKEN` | OAuth 2.0 Refresh Token | プロジェクト内スクリプト `npm run token:gen` で生成 |
| `GOOGLE_CALENDAR_ID` | カレンダーID | Google Calendarの設定から「カレンダーの統合」セクションで確認 |
| `DISCORD_WEBHOOK_URL` | Discord Webhook URL | Discordチャンネル設定からWebhookを作成してURLをコピー |

### GitHub Variables (本番環境)

GitHub Actionsで使用する環境変数です。リポジトリの Settings → Secrets and variables → Actions → Variables で設定してください。

| 変数名 | 説明 | 例 |
|-------|------|-----|
| `BOOTH_SHOP_NAME` | 監視対象出品者名 | `MAHA5JP` |
| `BOOTH_KEYWORDS` | 監視キーワード（カンマ区切り） | `音成モカ,オトナリモカ` |

### ローカル開発用 (.env ファイル)

ローカルでテストする場合は、`.env`ファイルを作成してください。

```bash
# .env (packages/booth-monitor/.env)
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_USER_ID=your_line_user_id
BOOTH_SHOP_NAME=MAHA5JP
BOOTH_KEYWORDS=音成モカ,オトナリモカ
```

> [!WARNING]
> `.env`ファイルは`.gitignore`に追加されています。絶対にコミットしないでください。

## 詳細な設定手順

### 1. Google Cloud Platform

#### OAuth 2.0 Client IDの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択 (`98677992892`)
3. 「APIとサービス」→「OAuth同意画面」を設定
   - User Type: **External** (外部)
   - アプリ情報: 任意に入力
   - テストユーザー: **自分のGoogleアカウントを追加** (必須)
4. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuth クライアント ID」
   - アプリケーションの種類: **Web アプリケーション**
   - 名前: 任意 (例: `booth-monitor-client`)
   - 承認済みのリダイレクト URI: **`http://localhost`** を追加 (トレイリングスラッシュなし)
5. 作成後、**クライアント ID** と **クライアント シークレット** を控える

#### リフレッシュトークンの取得

プロジェクトに含まれるスクリプトを使用してリフレッシュトークンを取得します。

1. ローカル環境で以下のコマンドを実行:
   ```bash
   npm run token:gen
   ```
2. プロンプトに従って `Client ID` と `Client Secret` を入力
3. 生成されたURLにブラウザでアクセスし、自分のアカウントでログイン・許可
   - 「このアプリはGoogleで確認されていません」と出た場合は「詳細」→「(安全ではないページ)に移動」を選択
4. リダイレクトされたURL (`http://localhost/?code=...`) から `code=` の後ろの文字列をコピー
5. コンソールに貼り付けてEnter
6. 表示された `GOOGLE_REFRESH_TOKEN` を控える

#### GitHub Secretsへの設定

取得した以下の3つをGitHub Secretsに設定してください。

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

#### カレンダーIDの取得

1. [Google Calendar](https://calendar.google.com/)にアクセス
2. 使用するカレンダーの設定を開く
3. 「カレンダーの統合」セクションの「カレンダーID」をコピー
4. サービスアカウントのメールアドレスをカレンダーに共有（編集権限）

### Discord通知が届かない

1. Webhook URLが正しいか確認
2. GitHub Secretsに `DISCORD_WEBHOOK_URL` が正しく設定されているか確認

### Google Calendarにイベントが作成されない

1. サービスアカウントのメールアドレスがカレンダーに共有されているか確認
2. 共有権限が「編集権限」になっているか確認
3. Calendar APIが有効化されているか確認

### "API has not been used in project" エラー

Google Cloud ConsoleでAPIが無効になっている場合に発生します。
エラーメッセージに表示されるURL、または以下の手順で有効化してください：

1. [Google Cloud Console APIライブラリ](https://console.cloud.google.com/apis/library)にアクセス
2. 使用しているプロジェクトを選択
3. **Gmail API** と **Google Calendar API** を検索し、「有効にする」をクリック
