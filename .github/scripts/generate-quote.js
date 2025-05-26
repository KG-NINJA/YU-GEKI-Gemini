const axios = require("axios");
const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY が設定されていません。");
  process.exit(1);
}

const BMAC_LINK = "https://www.buymeacoffee.com/kgninja";
const TWITTER_SHARE_URL = "https://twitter.com/intent/tweet?text=今日のAI格言はこちら！&url=https://KG-NINJA.github.io/";

async function main() {
  const prompt = "1つの日本語の格言と、それに対応する英語訳をセットで、50文字前後の短い名言として生成してください。前後の説明や記号を省き、純粋な日本語と英語の格言だけを出力してください。";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  // APIリクエストを実行
  const res = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }]
  });

  // レスポンスから格言を抽出
  const quote = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  const today = new Date().toISOString().split("T")[0];

  // Markdownコンテンツを生成
  const md = `---\ntitle: "Geminiのひらめき ${today}"\ndate: ${today}\ntags: [AI, 格言]\n---\n\n${quote}\n\n---\n\n☕️ [Buy Me a Coffee](${BMAC_LINK})\n\n🐦 [Xでシェアする](${TWITTER_SHARE_URL})\n`;

  // ファイル保存ディレクトリを作成（存在しない場合）
  const outDir = path.join(process.cwd(), "_posts");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true }); // recursive: true で親ディレクトリも作成
  }

  // ファイルパスを生成し、Markdownファイルとして保存
  const outPath = path.join(outDir, `${today}-gemini-quote.md`);
  fs.writeFileSync(outPath, md);

  console.log("✅ Gemini quote saved:", outPath);
}

// ▼▼▼ エラーハンドリング部分を修正 ▼▼▼
main().catch(err => {
  console.error("❌ Gemini API リクエストでエラーが発生しました。"); // エラー発生を明確に

  if (err.response) {
    // APIサーバーから応答があり、エラーステータスコードが返ってきた場合
    console.error("ステータスコード:", err.response.status);
    // console.error("レスポンスヘッダー:", JSON.stringify(err.response.headers, null, 2)); // ヘッダー情報は多いので、必要に応じてコメントを外してください
    console.error("APIからのエラー詳細:", JSON.stringify(err.response.data, null, 2)); // ★これが最も重要な情報です
  } else if (err.request) {
    // リクエストは行われたが、APIサーバーから応答がなかった場合 (ネットワークの問題など)
    console.error("APIサーバーからの応答がありませんでした。リクエスト情報:", err.request);
  } else {
    // リクエストをセットアップする段階で何か問題があった場合
    console.error("リクエスト設定時のエラー:", err.message);
  }

  // 必要であれば、エラーオブジェクト全体やスタックトレースも出力
  // console.error("エラーオブジェクト全体:", err);
  // console.error("スタックトレース:", err.stack);

  process.exit(1);
});
// ▲▲▲ エラーハンドリング部分の修正はここまで ▲▲▲
