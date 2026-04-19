# Rush Hour Slip を Play ストアに出す手順

## 結論

このリポジトリは `web/` 配下だけで完結する静的ゲームです。  
Play ストア公開の第一候補は `Capacitor` です。

`TWA` でも公開は可能ですが、HTTPS 配信中の PWA、本番ドメイン、Digital Asset Links の整備が前提になります。  
このゲームは「オフライン完結」「1本目を早く出す」が主眼なので、ローカルアセットをそのまま Android に同梱できる `Capacitor` の方が安全です。

## 現状確認

- 画面実装は `web/index.html` / `web/styles.css` / `web/script.js`
- データ保存は `localStorage` のみ
  - 最高到達ステージ
  - BGM ON / OFF
- 外部 API、広告 SDK、分析 SDK、ログイン、クラウド同期は未使用
- ゲームの主要フローはオフラインで成立
- 画面は縦持ち前提

## Mini-Spec

- Goal: `Rush Hour Slip` を Android アプリとして AAB 化し、Play Console のテスト配信に載せる
- Scope: Android ラップ、署名、AAB 生成、Play Console 登録、ストア申請の準備
- Constraints: 既存の Web 実装を大きく壊さない / 外部 API や広告 SDK を入れない / 危険権限を増やさない
- AC:
  - `web/` を Android アプリに同梱できる
  - `app-release.aab` を生成できる
  - Play Console のストア情報と実装内容が矛盾しない
  - プライバシーポリシーと Data safety の回答を整合させられる
- Unknown:
  - 開発者名、公開用メールアドレス、公開用 URL は未確定

## 事前に入れるもの

- Node.js LTS
- Android Studio
  - Android SDK
  - Platform Tools
  - Emulator または実機接続環境
- Java 21
  - もしくは Android Studio 同梱の `jbr` を使う

このワークスペースでは `node`、`npm`、`adb` が確認でき、Android Studio 同梱の Java 21 でも debug ビルドが通っています。

## この repo の現在値

- appId: `jp.shinshin.rushhourslip`
- appName: `Rush Hour Slip`
- webDir: `web`
- Android プロジェクト: `android/`
- debug APK 出力先: `android/app/build/outputs/apk/debug/app-debug.apk`

## 実装手順

### 1. Web ゲームを npm 管理にする

```powershell
npm init -y
```

### 2. Capacitor を追加する

```powershell
npm install @capacitor/core @capacitor/cli @capacitor/android
node node_modules/@capacitor/cli/bin/capacitor init "Rush Hour Slip" "jp.shinshin.rushhourslip" --web-dir web
```

- アプリ ID は `jp.shinshin.rushhourslip` のような一意な値にする
- 後から変えると面倒なので、公開名とパッケージ名はここで固める

### 3. `web/` をそのまま同梱する設定にする

生成された `capacitor.config.*` を、少なくとも次の意図になるよう調整します。

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "jp.shinshin.rushhourslip",
  appName: "Rush Hour Slip",
  webDir: "web",
  bundledWebRuntime: false
};

export default config;
```

重要なのは `webDir: "web"` です。  
このリポジトリはビルド済み静的ファイルが `web/` にあるので、まずは変換せず同梱します。

### 4. Android プロジェクトを生成する

```powershell
node node_modules/@capacitor/cli/bin/capacitor add android
node node_modules/@capacitor/cli/bin/capacitor copy android
npm run android:open
```

Android Studio が開いたら、最低限ここを確認します。

- アプリ名
- `applicationId` / パッケージ名
- `versionCode` と `versionName`
- 縦固定
- アイコン / Adaptive Icon
- 不要権限を足していないこと

このゲームは現状、カメラ、位置情報、連絡先、通知、ログイン権限を必要としません。  
不要な権限は付けないでください。

CLI でビルドする場合、Java 17 ではなく Java 21 を使ってください。  
この環境では Android Studio 同梱の `C:\Program Files\Android\Android Studio\jbr` で通りました。

### 5. 実機テストする

確認ポイントはこの順が安全です。

1. 初回起動でタイトル画面が崩れない
2. タップ / スワイプでレーン移動できる
3. BGM の ON / OFF が反映される
4. ベストステージが再起動後も残る
5. 端末をオフラインにしても遊べる
6. バックキーや復帰で操作不能にならない
7. 画面回転が入ってもレイアウト破綻しない

### 6. 署名付き AAB を作る

Play ストア提出は `AAB` が前提です。  
Android Studio の `Generate Signed Bundle / APK` を使うか、Gradle で `bundleRelease` を実行します。

```powershell
cd android
.\gradlew bundleRelease
```

一般的な出力先:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

アップロード鍵は必ず安全に保管してください。  
Play App Signing を使う前提でも、手元のアップロード鍵は更新時に必要です。

## Play Console 側の手順

### 1. アプリを作成

- アプリ名
- デフォルト言語
- アプリ or ゲーム
- 無料 or 有料

### 2. ストア掲載情報を用意

最低限必要になるもの:

- アプリ名
- 短い説明
- 詳細説明
- 512x512 のアプリアイコン
- フィーチャーグラフィック
- スクリーンショット 2 枚以上

このゲームは縦画面なので、スクリーンショットも縦で統一した方が説明しやすいです。

### 3. App content を埋める

この repo の現状から見た初期方針です。

- Ads: `No`
- Data safety: 外部送信なし、共有なし、端末内保存のみで回答する想定
- Privacy policy: `web/privacy.html` の内容を公開 HTTPS URL に載せ、その URL を登録
- Content rating: 実内容に合わせて回答
- Target audience: 実際の想定年齢に合わせて回答

注意:
`Capacitor` 以外の SDK やトラッキングを追加したら、Data safety は必ず見直してください。

### 4. Play App Signing を有効にする

新規公開では Play App Signing を前提に進めるのが安全です。  
提出時に AAB をアップロードし、Google 側の署名管理フローを使います。

### 5. テストトラックで出す

推奨順:

1. Internal testing
2. Closed testing
3. Production

新しい個人デベロッパーアカウントでは、本番公開前にクローズドテストが必要になる場合があります。  
公式ヘルプでは「本番申請前に、少なくとも 12 人のオプトイン済みテスターが 14 日間連続で参加しているクローズドテスト」が要件と案内されています。

## このゲームで先に埋めるとよい文言

### 短い説明案

満員駅をすり抜け、停車中の列車へ飛び込む縦持ち 1 画面ランゲーム。

### 詳細説明案

Rush Hour Slip は、通勤ラッシュの駅構内を左右にすり抜けながらホーム奥の停車位置を目指す、短時間周回型のカジュアルゲームです。  
タップとスワイプだけでレーンを切り替え、柱、ベンチ、案内板、人波を抜けて列車のドア位置へ滑り込みます。  
ステージが進むほど通路密度が上がり、先読みとレーン選択が問われます。  
オフラインで遊べて、広告や外部ログインはありません。

## 公開前チェック

- 起動直後に遊び方が分かる
- リトライ導線が詰まらない
- BGM を切った状態が保持される
- オフラインで主要フローが完走する
- 危険権限を要求していない
- ストア文言と実際の内容が一致している
- プライバシーポリシー URL が公開されている
- AAB を Internal testing で実機配布してから本番へ進む

## 詰まりやすい点

- `TWA` を選ぶと、ゲーム公開とは別に PWA 配信基盤の面倒を見ることになる
- パッケージ名を途中で変えると、署名やストア登録の手戻りが増える
- プライバシーポリシーは「あとで」ではなく最初に決めた方が早い
- Data safety は「データを送っていないこと」を実装と一致させる必要がある

## この repo で次にやるべきこと

1. `npm run android:open` で Android Studio から `android/` を開く
2. 実機で縦持ち・タップ操作・オフラインを確認する
3. アイコン、スプラッシュ、スクリーンショットを作る
4. 署名鍵を作って `Generate Signed Bundle / APK` から AAB を出す
5. Internal testing に AAB を上げる
