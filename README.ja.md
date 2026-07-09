<p align="center">
  <img src="media/marketplace-icon.png" alt="Logo" width="128" />
</p>

<h1 align="center">Copilot Memory Explorer</h1>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=cat5th.copilot-memory-explorer">
    <img src="https://img.shields.io/badge/VS%20Code-1.96%2B-blue?logo=visualstudiocode" alt="VS Code" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  </a>
  <a href="https://github.com/harvey-woo/copilot-memory-explorer">
    <img src="https://img.shields.io/github/stars/harvey-woo/copilot-memory-explorer?style=social" alt="Stars" />
  </a>
  <br/>
  <a href="README.md">English</a> ·
  <a href="README.zh-cn.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

VS Code のネイティブ UI で GitHub Copilot のメモリファイルを閲覧・管理します。

GitHub Copilot は会話の中で「メモリ」を蓄積し、プロジェクトのコンテキスト、コーディングの好み、アーキテクチャの決定などの長期的な情報を記録します。これらのメモリはローカルの Markdown ファイルとして保存されますが、閲覧や管理のための組み込みインターフェースはありません。

**Copilot Memory Explorer** はそのギャップを埋めます。VS Code ネイティブのサイドバービューを提供し、チャットセッションごとに整理されたすべての Copilot メモリを閲覧・管理できます。

## デモ

<p align="center">
  <img src="docs/usage-demo.webp" alt="使用デモ" width="720" />
</p>

## 機能

- **ネイティブ TreeView** — VS Code ネイティブのコンテキストメニュー付きサイドバービュー
- **セッション閲覧** — メモリエントリがあるすべてのチャットセッションを閲覧
- **ファイルツリー** — セッションディレクトリを再帰的にスキャン、ファイルとサブディレクトリを表示
- **Markdown プレビュー** — ファイルをクリックしてプレビューパネルでレンダリングされた Markdown を表示
- **画像プレビュー** — プレビューパネルで画像を表示
- **コンテキストメニュー** — 右クリックでパスをコピー、Finder で表示、削除、新規メモリ作成
- **並び替え** — ビューのタイトルバーから名前または日付で並び替え
- **新規メモリ** — サイドバーから直接新しいメモリファイルを作成

## 使い方

1. アクティビティバーの **Copilot Memories** アイコンをクリック
2. セッションを閲覧し、展開してメモリファイルを表示
3. ファイルをクリックしてエディタとプレビューパネルで開く
4. 右クリックでコンテキストメニューオプションを表示

## 要件

- VS Code 1.96+
- GitHub Copilot（メモリ生成用）

## リリースノート

バージョン履歴は [CHANGELOG.md](CHANGELOG.md) を参照してください。

## ライセンス

[MIT](LICENSE)