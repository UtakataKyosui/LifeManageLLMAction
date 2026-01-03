# 未解決の課題 / 今後の機能追加

## Google Calendar 連携機能の復活

### 現状
Google Calendarへのイベント自動登録機能は、認証周り（OAuth 2.0 Refresh Token）のセットアップが複雑であるため、一時的に無効化しています。
現在は Gmail での検知 と Discord への通知 のみが稼働しています。

### 対応に必要なこと
1. **OAuth 2.0 認証フローの確立**
   - Refresh Token を安定して取得・更新する仕組み。
   - または、Service Account で動作させるための Google Workspace 環境の用意（個人アカウントでは不可のため）。

2. **実装の復旧**
   - `src/main.ts` 内でコメントアウトされている `CalendarClient` 関連のコードを有効化する。
   - `GOOGLE_CALENDAR_ID` などの環境設定を行う。
