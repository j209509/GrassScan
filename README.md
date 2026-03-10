# GrassScan

GrassScan は、小型株の異常な出来高や値動きを見つけるためのデモファーストな監視ダッシュボードです。  
Next.js 15 / TypeScript / Tailwind CSS / shadcn/ui ベースで、デモモードと Twelve Data ライブモードを切り替えてローカル実行できます。

## 現在の構成

- ランディングページ
- サインアップ / ログイン / ログアウト UI
- ダッシュボード
- 銘柄詳細ページ
- ウォッチリスト
- 内部スキャン画面
- モックデータによるデモモード
- Twelve Data を使う軽量なライブモード

## セットアップ

1. 依存関係をインストールします。

```bash
npm install
```

2. 必要に応じて `.env.local` を作成します。

```bash
MARKET_DATA_PROVIDER=twelve-data
MARKET_DATA_API_KEY=YOUR_TWELVE_DATA_API_KEY
DEMO_MODE=false
```

3. 開発サーバーを起動します。

```bash
npm run dev
```

4. ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 環境変数

- `MARKET_DATA_PROVIDER`
  - `twelve-data` を指定すると Twelve Data アダプターを使います。
- `MARKET_DATA_API_KEY`
  - Twelve Data の API キーです。
- `DEMO_MODE`
  - `true` なら常にデモモードです。
  - `false` ならライブ優先で動きます。キー不備や制限時は自動でデモ補完またはデモ fallback へ切り替わります。

## ライブモードの考え方

ライブモードは、固定銘柄をそのまま見せるのではなく、厳選した小型株ユニバースを内部で走査し、その時点でスコアが高い銘柄だけを前面に表示する構成です。

- 内部では curated live universe を走査します。
- ダッシュボードは既定で上位結果だけを表示します。
- 検索、フィルター、並び替えを使うと対象結果を広げられます。
- 銘柄詳細の履歴データは、その銘柄ページを開いたときだけ取得します。
- API キーがない、無効、またはライブ取得に失敗した場合は、自動でデモデータへ切り替えます。
- 一部だけ取得できた場合は、ライブ表示を維持しつつ不足分をデモデータで補完します。

画面上の表示:

- `ライブデータ`
  - Twelve Data の値を反映しています。
- `デモモード`
  - モックデータを表示しています。
- `API制限のため一部データをデモ表示しています`
  - ライブ取得の一部が rate limit に達したため、取得できた分だけライブ、残りはデモ補完です。

## 無料プラン向けの節約ポイント

Twelve Data 無料プランは minute credits が小さいため、次の方針で API 使用量を抑えています。

- overview で走査するライブ銘柄は 7 銘柄です。
- ダッシュボード既定表示は、そのうち上位 5 件だけです。
- overview は `quote` のみを使います。
- 日足履歴の取得は銘柄詳細ページでのみ行います。
- サーバー側メモリキャッシュを使うため、短時間の再読込では API を叩き直しません。
- Twelve Data へのリクエストは直列化しており、同時多発で飛ばないようにしています。

## キャッシュ仕様

- overview スナップショット: 約 2 分
- 銘柄詳細スナップショット: 約 3 分
- quote キャッシュ: 約 2 分
- 日足履歴キャッシュ: 約 15 分

短時間で何度もページを開き直しても、キャッシュ有効中は同じデータを再利用します。  
開発モードではターミナルに次のようなログが出ます。

- `cache hit: ...`
- `cache miss: ...`
- `cache join: ...`
- `live api call: ...`

これで、実際に Twelve Data を叩いたのか、キャッシュを返したのかを確認できます。

## ライブユニバースの編集

ライブモードで走査する curated universe は次のファイルで管理しています。

- `lib/market/live-universe.ts`

このファイルの `curatedLiveUniverse` に銘柄を追加すると、将来的にライブ走査対象を広げられます。  
ダッシュボード既定表示件数は同じファイルの `LIVE_DASHBOARD_RESULT_LIMIT` です。

## 制限事項

- 認証はローカル UI のみです。実バックエンドは未接続です。
- データベースはありません。
- 決済、cron、ニュース API は未実装です。
- Twelve Data 無料プランでは取得回数に制限があるため、全市場は走査していません。
- ライブモードは curated live universe を対象にした小型株スキャナーです。
- ウォッチリストのうち overview の対象外銘柄は、必要に応じてデモデータで補完されます。

## 無料プランで安全に試す手順

1. `.env.local` に以下を設定します。

```bash
MARKET_DATA_PROVIDER=twelve-data
MARKET_DATA_API_KEY=YOUR_TWELVE_DATA_API_KEY
DEMO_MODE=false
```

2. 開発サーバーを起動します。

```bash
npm run dev
```

3. [http://localhost:3000/dashboard](http://localhost:3000/dashboard) を開きます。

4. ヘッダーの表示が `ライブデータ` になっていることを確認します。

5. ターミナルで最初のアクセス時に `cache miss` と `live api call` が出ることを確認します。

6. 2 分以内に同じページを数回リロードします。
   `cache hit` が出て、`live api call` が増えていないことを確認します。

7. 任意の銘柄詳細ページを 1 つ開きます。
   そのときだけ詳細用の `live api call` が追加で出ることを確認します。

8. API キーを無効な値に変えてサーバーを再起動すると、自動で `デモモード` 表示へ切り替わります。

## 利用コマンド

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
```

## 主要フォルダ / ファイル

- `app/`
  - App Router のページ、API ルート
- `components/`
  - UI コンポーネント、画面クライアント、provider
- `lib/`
  - モックデータ、スコアリング、ライブプロバイダー、キャッシュ
- `tests/`
  - スコア計算とキャッシュのテスト
- `lib/market/live-universe.ts`
  - curated live universe と既定表示件数
- `lib/market/providers/twelve-data-provider.ts`
  - Twelve Data アダプター本体
- `lib/market/server-cache.ts`
  - サーバー側キャッシュと直列リクエスト制御
- `components/market/dashboard-client.tsx`
  - 上位結果中心のダッシュボード表示
- `README.md`
  - セットアップと運用メモ
