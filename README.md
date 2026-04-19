# Rush Hour Slip

満員電車の人波を左右にすり抜けてホームを目指す、Play ストア前提の日本語カジュアルゲーム試作です。

## 現在の方針

- 1画面ゲームのコアループを先に完成させる
- 日本語UI、縦持ち、オフライン完結を前提にする
- 外部API、有料SDK、広告SDK、分析SDKは使わない
- Web プロトタイプから始めて、あとで Android ラップしやすい形に保つ

## 収録内容

- `web/index.html`: タイトル / プレイ / 結果シーンを持つゲーム画面
- `web/styles.css`: モバイル向けUI、ガラス調パネル、ゲーム用レイアウト
- `web/script.js`: ゲームループ、入力、衝突判定、シーン別BGM
- `web/manifest.webmanifest`: 日本語設定の PWA マニフェスト
- `web/sw.js`: オフライン用の簡易 Service Worker
- `web/icon.svg`: 仮アイコン
- `web/privacy.html`: アプリ内表示と公開 URL 転用を想定したプライバシーポリシー素案
- `capacitor.config.json`: Android ラップ用の Capacitor 設定
- `android/`: Play ストア向け Android プロジェクト
- `package.json`: Capacitor 操作用の npm スクリプト
- `docs/play-store-capacitor.md`: Android ラップと Play ストア提出の手順

## ローカル確認

- 最低限の動作は `web/index.html` をブラウザで開くと確認できます
- Service Worker とオフラインキャッシュは `http://` / `https://` で配信したときに有効です

## Play ストア化の前提

- 現段階では Web プロトタイプ
- Android 化するなら Capacitor か TWA でラップする想定
- ストア提出前に必要なもの:
  - Android アイコン / スプラッシュ
  - パッケージ名と署名
  - プライバシー文言の整理
  - 実機での縦持ち / オフライン確認

## 次の作業

- Play ストア向けの具体手順は `docs/play-store-capacitor.md` を参照
- 公開用のプライバシーポリシー文面は `web/privacy.html` を土台にする
- Android Studio を開くときは `npm run android:open` を使える
