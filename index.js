const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// 環境変数の設定
const ESA_API_KEY = process.env.ESA_API_KEY;
const ESA_TEAM_NAME = process.env.ESA_TEAM_NAME;
const PORT = process.env.PORT || 3000;

// 設定の確認
if (!ESA_API_KEY || !ESA_TEAM_NAME) {
  console.error('必要な環境変数が設定されていません。');
  process.exit(1);
}

// ESA.ioからデータを取得する関数
async function fetchEsaDocuments() {
  try {
    const response = await axios.get(
      `https://api.esa.io/v1/teams/${ESA_TEAM_NAME}/posts`,
      {
        headers: {
          Authorization: `Bearer ${ESA_API_KEY}`,
        },
        params: {
          per_page: 100, // 取得する記事数を調整可能
        },
      }
    );
    return response.data.posts;
  } catch (error) {
    console.error('ESA APIエラー:', error.message);
    throw new Error('ESAからデータを取得できませんでした');
  }
}

// MCPフォーマットにデータを変換する関数
function transformToMCP(documents) {
  return documents.map(doc => {
    return {
      id: doc.number,
      title: doc.name,
      content: doc.body_md,
      updated_at: doc.updated_at,
      created_at: doc.created_at,
      tags: doc.tags,
      category: doc.category,
      url: doc.url
    };
  });
}

// ルートへのアクセスでウェルカムメッセージを表示
app.get('/', (req, res) => {
  res.send(`
    <h1>ESA MCP Server</h1>
    <p>サーバーが正常に動作しています。</p>
    <p>API エンドポイント:</p>
    <ul>
      <li><a href="/mcp-data">/mcp-data</a> - ESAのデータをMCP形式で取得</li>
      <li>/search (POST) - ESAデータの検索</li>
    </ul>
  `);
});

// esa.ioからデータを取得してMCPフォーマットで返すエンドポイント
app.get('/mcp-data', async (req, res) => {
  try {
    const documents = await fetchEsaDocuments();
    const mcpData = transformToMCP(documents);
    res.json(mcpData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MCPデータ検索エンドポイント
app.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'クエリが必要です' });
    }
    
    // ESAからドキュメントを取得
    const documents = await fetchEsaDocuments();
    const mcpData = transformToMCP(documents);
    
    // 簡易的な検索機能（タイトルと内容にキーワードが含まれるドキュメントを抽出）
    const searchResults = mcpData.filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) || 
      doc.content.toLowerCase().includes(query.toLowerCase())
    );
    
    // 検索結果を返す
    res.json({ 
      count: searchResults.length,
      results: searchResults 
    });
  } catch (error) {
    console.error('エラー:', error);
    res.status(500).json({ error: '処理中にエラーが発生しました' });
  }
});

// サーバーの起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});