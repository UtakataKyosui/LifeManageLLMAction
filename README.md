# LifeManageLLMAction

BOOTHの新着商品を自動監視し、購入期間をGoogleカレンダーに登録、終了前にLINE通知するシステムです。

## 📋 概要

このプロジェクトは、BOOTH出品者の新着商品情報をGmailから取得し、購入期間をGoogleカレンダーに自動登録します。購入期限が近づくとLINEで通知を送信します。

### 主な機能

- 📧 Gmailから新着BOOTH商品メールを自動取得
- 🔍 出品者名・キーワードによるフィルタリング
- 🌐 Playwrightによる商品ページスクレイピング
- 📅 Googleカレンダーへの購入期間自動登録
- 🔔 LINE Messaging APIによる期限通知（1日前/12時間前/3時間前/1時間前）
- ⏰ GitHub Actionsで1時間ごとに自動実行

## 🏗️ システムアーキテクチャ

```mermaid
sequenceDiagram
    participant GHA as GitHub Actions
    participant Gmail as Gmail API
    participant BOOTH as BOOTH Website
    participant GCal as Google Calendar
    participant LINE as LINE Messaging API
    
    Note over GHA: 1時間ごとに実行
    GHA->>Gmail: 新着BOOTHメールを検索
    Gmail-->>GHA: メール一覧取得
    
    loop 各メール
        GHA->>GHA: URL抽出 & フィルタリング<br/>(出品者: MAHA5JP<br/>キーワード: 音成モカ)
        GHA->>BOOTH: 商品ページスクレイピング
        BOOTH-->>GHA: 購入期間情報
        GHA->>GCal: イベント登録/更新
        GHA->>GHA: 通知タイミング計算<br/>(1日前/12時間前/3時間前/1時間前)
    end
    
    GHA->>GCal: 既存イベント確認
    loop 通知対象イベント
        GHA->>LINE: 通知送信
    end
```

## 🛠️ 技術スタック

- **言語**: TypeScript
- **ランタイム**: Node.js 20
- **パッケージマネージャ**: npm
- **モノレポ管理**: [moonrepo](https://moonrepo.dev/)
- **バージョン管理**: [proto](https://moonrepo.dev/proto)
- **テストフレームワーク**: Vitest
- **ワークフロー定義**: [ghats](https://github.com/koki-develop/ghats) (TypeScript)
- **ブラウザ自動化**: Playwright
- **CI/CD**: GitHub Actions
- **ローカルテスト**: [act](https://github.com/nektos/act)

### 外部API

- Gmail API
- Google Calendar API
- LINE Messaging API

## 📁 プロジェクト構成

```
LifeManageLLMAction/
├── .github/
│   └── workflows/
│       ├── src/
│       │   └── booth-monitor.ts      # ghatsワークフロー定義
│       ├── booth-monitor-test.yml    # テスト用ワークフロー
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── booth-monitor/
│       ├── src/
│       │   ├── main.ts               # エントリーポイント
│       │   ├── gmail/                # Gmail API操作
│       │   ├── booth/                # BOOTHスクレイピング
│       │   ├── calendar/             # Google Calendar操作
│       │   ├── line/                 # LINE Messaging API
│       │   └── notification/         # 通知スケジューラ
│       ├── tests/
│       │   ├── unit/                 # 単体テスト
│       │   └── integration/          # 統合テスト
│       ├── moon.yml
│       ├── package.json
│       ├── tsconfig.json
│       └── vitest.config.ts
├── docs/
│   └── ACT_TESTING.md                # actテストガイド
├── .prototools                       # protoバージョン管理
├── .moon/                            # moonrepo設定
├── package.json                      # ルートpackage.json
└── tsconfig.json                     # ルートTypeScript設定
```

## 🚀 セットアップ

### 前提条件

- Node.js 20以上
- [proto](https://moonrepo.dev/docs/proto/install) インストール済み
- Docker Desktop (actテスト用)

### 1. リポジトリクローン

```bash
git clone https://github.com/YOUR_USERNAME/LifeManageLLMAction.git
cd LifeManageLLMAction
```

### 2. 依存関係のインストール

```bash
# protoで指定バージョンのツールをインストール
proto use

# 依存関係インストール
npm install
```

### 3. API認証情報の設定

詳細は[実装計画書](/.gemini/antigravity/brain/650f80cd-4c6f-4141-8bc4-7920afd47025/implementation_plan.md)の「API認証設定ガイド」を参照してください。

#### 必要なシークレット

GitHub Secretsに以下を設定:

- `GOOGLE_SERVICE_ACCOUNT_KEY`: Google Cloud サービスアカウントキー(JSON)
- `GOOGLE_CALENDAR_ID`: カレンダーID
- `LINE_CHANNEL_ACCESS_TOKEN`: LINE Channel Access Token
- `LINE_USER_ID`: LINE送信先ユーザーID

#### 環境変数

GitHub Variables に以下を設定:

- `BOOTH_SHOP_NAME`: 監視対象出品者名（例: `MAHA5JP`）
- `BOOTH_KEYWORDS`: 監視キーワード（例: `音成モカ`）

## 🧪 開発ワークフロー

### テスト駆動開発 (TDD)

このプロジェクトはTDD方式で開発します。

```bash
# テスト実行
moon run booth-monitor:test

# ウォッチモード
moon run booth-monitor:test:watch

# カバレッジレポート
moon run booth-monitor:test:coverage
```

### ビルド

```bash
# booth-monitorパッケージのビルド
moon run booth-monitor:build
```

### リント

```bash
# ESLint実行
moon run booth-monitor:lint
```

### ワークフロー生成

```bash
# ghatsでワークフローYAML生成
npm run build:workflows
```

## 🐳 GitHub Actionsのローカルテスト

`act`を使用してGitHub Actionsワークフローをローカルでテストできます。

### クイックスタート

```bash
# Dockerを起動後
act workflow_dispatch \
  -W .github/workflows/booth-monitor-test.yml \
  --secret-file .secrets.act \
  --var BOOTH_SHOP_NAME=MAHA5JP \
  --var BOOTH_KEYWORDS=音成モカ
```

詳細は[docs/ACT_TESTING.md](docs/ACT_TESTING.md)を参照してください。

## 📝 開発状況

現在の実装状況は[タスク管理](/.gemini/antigravity/brain/650f80cd-4c6f-4141-8bc4-7920afd47025/task.md)を参照してください。

### Phase 1: プロジェクト初期化 ✅
- moonrepo/proto設定
- TypeScriptプロジェクト構成
- 依存関係インストール
- 実装計画書作成

### Phase 2: コアモジュール実装 🚧
- Gmail API連携モジュール
- BOOTHスクレイピングモジュール
- フィルタリングモジュール
- Google Calendar連携モジュール
- LINE Messaging API連携モジュール
- 通知スケジューラモジュール

### Phase 3: メインロジック統合 ⏳
### Phase 4: GitHub Actions設定 🚧
### Phase 5: 検証 ⏳

## 📚 ドキュメント

- [実装計画書](/.gemini/antigravity/brain/650f80cd-4c6f-4141-8bc4-7920afd47025/implementation_plan.md)
- [タスク管理](/.gemini/antigravity/brain/650f80cd-4c6f-4141-8bc4-7920afd47025/task.md)
- [actテストガイド](docs/ACT_TESTING.md)

## 🤝 コントリビューション

このプロジェクトはTDD、Conventional Commits、moonrepoを採用しています。
詳細は[ユーザールール](/.gemini/antigravity/brain/650f80cd-4c6f-4141-8bc4-7920afd47025/implementation_plan.md)を参照してください。

## 📄 ライセンス

MIT License



