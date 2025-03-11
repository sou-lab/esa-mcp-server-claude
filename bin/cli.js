#!/usr/bin/env node

const inquirer = require('inquirer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 設定ファイルのパス
const configDir = path.join(process.env.HOME || process.env.USERPROFILE, '.esa-mcp-server');
const configPath = path.join(configDir, 'config.json');

// 設定ディレクトリがなければ作成
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// 設定ファイルの読み込み
let config = {};
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error('設定ファイルの読み込みに失敗しました:', error);
  }
}

// メイン処理
async function main() {
  // 既存の設定があるか確認
  const hasConfig = config.ESA_API_KEY && config.ESA_TEAM_NAME;
  
  if (!hasConfig) {
    // 設定が存在しない場合は、ユーザーに入力を求める
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'ESA_API_KEY',
        message: 'esa.io APIキーを入力してください:',
        default: config.ESA_API_KEY || '',
      },
      {
        type: 'input',
        name: 'ESA_TEAM_NAME',
        message: 'esa.ioのチーム名を入力してください:',
        default: config.ESA_TEAM_NAME || '',
      },
      {
        type: 'input',
        name: 'PORT',
        message: 'サーバーのポート番号を入力してください:',
        default: config.PORT || '3000',
      }
    ]);
    
    // 設定を保存
    config = { ...config, ...answers };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('設定が保存されました');
  }
  
  // アクション選択
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '何をしますか？',
      choices: [
        { name: 'サーバーを起動', value: 'start' },
        { name: '設定を変更', value: 'config' },
        { name: '終了', value: 'exit' }
      ]
    }
  ]);
  
  if (action === 'exit') {
    console.log('プログラムを終了します');
    return;
  }
  
  if (action === 'config') {
    // 設定変更処理（再帰的に main を呼び出す）
    config = {}; // 設定をリセット
    return main();
  }
  
  if (action === 'start') {
    // 環境変数を設定してサーバーを起動
    const env = { ...process.env, ...config };
    
    // サーバーの実行
    const serverPath = path.join(__dirname, '..', 'index.js');
    const server = spawn('node', [serverPath], { 
      env,
      stdio: 'inherit' // 標準出力/エラーを親プロセスに転送
    });
    
    console.log(`サーバーを起動しました: http://localhost:${config.PORT}`);
    
    // プロセス終了時のハンドリング
    process.on('SIGINT', () => {
      server.kill('SIGINT');
      console.log('\nサーバーを停止しました');
      process.exit();
    });
  }
}

main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});