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

const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`;

  const res = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }]
  });

  const quote = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  const today = new Date().toISOString().split("T")[0];
  const md = `---\ntitle: "Geminiのひらめき ${today}"\ndate: ${today}\ntags: [AI, 格言]\n---\n\n${quote}\n\n---\n\n☕️ [Buy Me a Coffee](${BMAC_LINK})\n\n🐦 [Xでシェアする](${TWITTER_SHARE_URL})\n`;

  const outDir = path.join(process.cwd(), "_posts");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outPath = path.join(outDir, `${today}-gemini-quote.md`);
  fs.writeFileSync(outPath, md);

  console.log("✅ Gemini quote saved:", outPath);
}

main().catch(err => {
  console.error("❌ Gemini API error:", err);
  process.exit(1);
});
