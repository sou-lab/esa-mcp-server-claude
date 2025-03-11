# ESA MCP Server

esa.ioのデータをModel Context Protocol (MCP)形式で提供するサーバーです。Cloud Desktop環境で使用するために設計されています。

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/sou-lab/esa-mcp-server-claude.git
cd esa-mcp-server-claude

# 依存関係をインストール
npm install

# CLIに実行権限を付与
chmod +x bin/cli.js

# 直接実行
node bin/cli.js

# または、ローカルにインストール
npm install -g .
```

## 必要な設定

初回起動時に以下の情報の入力を求められます：

- esa.io APIキー
- esa.ioチーム名
- サーバーのポート番号（デフォルト: 3000）

これらの設定は`~/.esa-mcp-server/config.json`に保存されます。

## 使用方法

```bash
# インストール済みの場合
esa-mcp-server

# または直接実行
node bin/cli.js
```

### API エンドポイント

- `GET /` - ウェルカムページ
- `GET /mcp-data` - ESAのデータをMCP形式で取得
- `POST /search` - ESAデータを検索

### 検索クエリの例

```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query":"プロジェクトA"}'
```

## Claude Desktopでの設定

Claude Desktopの`claude_desktop_config.json`に以下のように設定を追加します：

```json
{
  "mcpServers": {
    "esa": {
      "command": "/path/to/node",
      "args": [
        "/path/to/esa-mcp-server-claude/bin/cli.js"
      ],
      "env": {
        "ESA_API_KEY": "あなたのESA_APIキー",
        "ESA_TEAM_NAME": "あなたのチーム名",
        "PORT": "3000"
      }
    }
  }
}
```

各項目の説明：

- `command`: Nodeのパス（Mac/Linuxでは `which node` コマンドで確認可能）
- `args`: CLIスクリプトのパス
- `env`: 環境変数（APIキー、チーム名、ポート番号）

## ライセンス

ISC
