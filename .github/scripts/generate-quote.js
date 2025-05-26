---
# 📦 Gemini格言ブログ自動化スターターパック（BuyMeACoffee＆Twitter付き、日本語＋英語対応）
# GitHub Pages + GitHub Actionsで完結する構成
# 毎日午前2時（日本時間）にGemini APIで日本語＋英語の格言を生成し、自動投稿します

name: Daily Gemini Quote Blog

on:
  schedule:
    - cron: '0 17 * * *'  # 日本時間 02:00 = UTC 17:00
  workflow_dispatch:

jobs:
  generate-quote:
    runs-on: ubuntu-latest

    steps:
      - name: 📥 リポジトリをチェックアウト
        uses: actions/checkout@v3

      - name: 🛠 Node.js セットアップ
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: 📦 依存パッケージのインストール（axios）
        run: npm install axios

      - name: ✨ Gemini APIで格言（日本語＋英語）を生成しMarkdownに保存
        run: |
          echo "const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BMAC_LINK = \"https://www.buymeacoffee.com/kgninja";
const TWITTER_SHARE_URL = \"https://twitter.com/intent/tweet?text=今日のAI格言はこちら！&url=https://KG-NINJA.github.io/\";

async function main() {
  const prompt = \"1つの日本語の格言と、それに対応する英語訳をセットで、50文字前後の短い名言として生成してください。前後の説明や記号を省き、純粋な日本語と英語の格言だけを出力してください。\";

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }]
    }
  );

  const quote = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  const today = new Date().toISOString().split(\"T\")[0];
  const md = `---\ntitle: \"Geminiのひらめき ${today}\"\ndate: ${today}\ntags: [AI, 格言]\n---\n\n${quote}\n\n---\n\n☕️ [Buy Me a Coffee](${BMAC_LINK})\n\n🐦 [Xでシェアする](${TWITTER_SHARE_URL})\n`;

  const outDir = path.join(process.cwd(), \"_posts\");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outPath = path.join(outDir, `${today}-gemini-quote.md`);
  fs.writeFileSync(outPath, md);

  console.log(\"✅ Gemini quote with BMAC/Twitter saved:\", outPath);
}

main().catch(err => {
  console.error(\"❌ Gemini API error:\", err);
  process.exit(1);
});" > .github/scripts/generate-quote.js

      - name: ✅ Gitへコミット＆プッシュ
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git add _posts/*.md
          git commit -m "🧠 Gemini格言を自動投稿"
          git push
add: generate-quote.js for Gemini blog automation
