# 環境変数設定ガイド

このプロジェクトで必要な環境変数の設定方法を説明します。

## 必要な環境変数

### GitHub Secrets (本番環境)

GitHub Actionsで使用するシークレットです。リポジトリの Settings → Secrets and variables → Actions で設定してください。

| Secret名 | 説明 | 取得方法 |
|---------|------|---------|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Google Cloud サービスアカウントキー(JSON全体) | [Google Cloud Console](https://console.cloud.google.com/) でサービスアカウントを作成し、JSONキーをダウンロード |
| `GOOGLE_CALENDAR_ID` | カレンダーID | Google Calendarの設定から「カレンダーの統合」セクションで確認 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Channel Access Token | [LINE Developers](https://developers.line.biz/) でMessaging APIチャネルを作成し、Channel access tokenを発行 |
| `LINE_USER_ID` | LINE送信先ユーザーID | LINEアカウントのUser IDを取得（後述） |

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

### 2. LINE Messaging API

#### チャネルの作成

1. [LINE Developers](https://developers.line.biz/)にアクセス
2. プロバイダーを作成（既存のものを使用可）
3. 「新規チャネル作成」→「Messaging API」
4. チャネル情報を入力して作成

#### Channel Access Tokenの取得

1. 作成したチャネルの「Messaging API設定」タブ
2. 「Channel access token」セクションで「発行」をクリック
3. トークンをコピーして`LINE_CHANNEL_ACCESS_TOKEN`に設定

#### User IDの取得

**方法1: LINE Official Account Managerから**
1. チャネルのQRコードを読み取って友だち追加
2. 自分のアカウントから何かメッセージを送信
3. Webhook URLを設定してイベントログからUser IDを取得

**方法2: 簡易的な方法**
```bash
# 自分にテストメッセージを送信してUser IDを確認
# まず、自分のUser IDを推測して送信してみる
curl -X POST https://api.line.me/v2/bot/message/push \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer {Channel Access Token}' \
  -d '{
    "to": "U...",
    "messages": [{"type": "text", "text": "test"}]
  }'
```

## actテスト用環境変数

actでのローカルテストには、`.secrets.act`ファイルを使用します（既に作成済み）。

```bash
# .secrets.act
GOOGLE_SERVICE_ACCOUNT_KEY=dummy_service_account_key
GOOGLE_CALENDAR_ID=dummy_calendar_id
LINE_CHANNEL_ACCESS_TOKEN=dummy_line_token
LINE_USER_ID=dummy_user_id
```

actテスト時は、これらのダミー値で環境変数の設定が正しく行われるかを確認できます。

## トラブルシューティング

### Gmail APIのアクセス権限エラー

サービスアカウントでGmail APIを使用するには、Google Workspace管理者による設定が必要です。
個人アカウントの場合は、OAuth 2.0を使用する必要があります。

### LINE通知が届かない

1. Channel Access Tokenが正しいか確認
2. User IDが正しいか確認
3. LINEアカウントがチャネルと友だちになっているか確認
4. Webhook設定が正しいか確認

### Google Calendarにイベントが作成されない

1. サービスアカウントのメールアドレスがカレンダーに共有されているか確認
2. 共有権限が「編集権限」になっているか確認
3. Calendar APIが有効化されているか確認
