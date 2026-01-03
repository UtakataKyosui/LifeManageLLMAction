# 環境変数設定ガイド

このプロジェクトで必要な環境変数の設定方法を説明します。

## 必要な環境変数

### GitHub Secrets (本番環境)

GitHub Actionsで使用するシークレットです。リポジトリの Settings → Secrets and variables → Actions で設定してください。

| Secret名 | 説明 | 取得方法 |
|---------|------|---------|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Google Cloud サービスアカウントキー(JSON全体) | [Google Cloud Console](https://console.cloud.google.com/) でサービスアカウントを作成し、JSONキーをダウンロード |
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

#### サービスアカウントの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」→「ライブラリ」で以下を有効化:
   - Gmail API
   - Google Calendar API
4. 「APIとサービス」→「認証情報」→「認証情報を作成」→「サービスアカウント」
5. サービスアカウント名を入力（例: `booth-monitor`）
6. 作成したサービスアカウントをクリック
7. 「キー」タブ→「鍵を追加」→「新しい鍵を作成」→「JSON」
8. ダウンロードしたJSONファイルの内容全体を`GOOGLE_SERVICE_ACCOUNT_KEY`に設定

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
