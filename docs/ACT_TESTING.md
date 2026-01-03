# GitHub Actions Testing with act

このプロジェクトでは、GitHub Actionsワークフローを`act`を使ってローカルでテストできます。

## 前提条件

- Docker Desktop がインストールされ、起動していること
- `act` がインストールされていること (`brew install act`)

## テスト方法

### 1. Dockerの起動

```bash
# Docker Desktopを起動してください
open -a Docker
```

### 2. ワークフローのテスト実行

```bash
# workflow_dispatchイベントでテスト実行
act workflow_dispatch \
  -W .github/workflows/booth-monitor-test.yml \
  --secret-file .secrets.act \
  --var BOOTH_SHOP_NAME=MAHA5JP \
  --var BOOTH_KEYWORDS=音成モカ \
  -P ubuntu-latest=catthehacker/ubuntu:act-latest
```

### 3. ドライラン(構文チェックのみ)

```bash
act workflow_dispatch \
  -W .github/workflows/booth-monitor-test.yml \
  --dryrun
```

## 設定ファイル

- `.secrets.act`: テスト用のシークレット値(ダミー値)
- `.env.act`: テスト用の環境変数

> [!WARNING]
> `.secrets.act`と`.env.act`は`.gitignore`に追加されています。
> 本番用の認証情報は絶対にコミットしないでください。

## ワークフロー生成

本プロジェクトでは`ghats`を使用してTypeScriptからワークフローYAMLを生成します。

```bash
# ワークフロー生成
npm run build:workflows
```

> [!NOTE]
> 現在、ghatsの設定に問題があり、自動生成が正常に動作していません。
> 一時的に手動で作成した`booth-monitor-test.yml`を使用しています。

## トラブルシューティング

### Dockerエラー

```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

→ Docker Desktopを起動してください。

### M1/M2 Macでのエラー

```
You are using Apple M-series chip...
```

→ `--container-architecture linux/amd64`オプションを追加してください:

```bash
act workflow_dispatch \
  -W .github/workflows/booth-monitor-test.yml \
  --container-architecture linux/amd64 \
  --secret-file .secrets.act \
  --var BOOTH_SHOP_NAME=MAHA5JP \
  --var BOOTH_KEYWORDS=音成モカ
```
