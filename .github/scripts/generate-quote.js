const axios = require("axios");
const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY が設定されていません。");
  process.exit(1);
}

const BMAC_LINK = "https://www.buymeacoffee.com/kgninja";
const SITE_BASE_URL = "https://kg-ninja.github.io/YU-GEKI-Gemini"; // あなたのサイトのベースURL

async function main() {
  const prompt = `
短い日本語の格言と、それに対応する英語訳を生成してください（それぞれ50文字程度）。
次に、その格言の非常に短い英語の要約（ツイート用、10～20語程度）を「Summary:」という接頭辞を付けて、改行してから生成してください。
他の前置きや説明文は一切含めないでください。

例：
努力は必ず報われる。
Effort always pays off.
Summary: Hard work leads to success.
`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

  const res = await axios.post(apiUrl, {
    contents: [{ parts: [{ text: prompt }] }]
  });

  const apiGeneratedText = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  let displayQuote = "Today's quote is taking a break due to AI whims. Please check back later!"; // ブログページに表示する格言全文
  let tweetEssence = "Check out the latest AI quote!"; // ツイートするエッセンス (デフォルト)

  if (apiGeneratedText) {
    const parts = apiGeneratedText.split("\nSummary:"); // 「改行＋Summary:」で分割
    displayQuote = parts[0].trim(); // 「Summary:」より前の部分が格言全文 (日本語と英語を含む)
    
    if (parts.length > 1 && parts[1].trim() !== "") {
      tweetEssence = parts[1].trim(); // 「Summary:」より後の部分が英語の要約
    } else {
      // 要約がうまく取れなかった場合のフォールバック処理
      // displayQuote (日本語格言\n英語格言) から英語部分を推測して要約に使用
      const lines = displayQuote.split('\n');
      let fallbackText = "Check out the latest AI quote!"; // デフォルトのフォールバックテキスト
      if (lines.length > 0) {
        // 最後の行が英語格言であると仮定、または英字を含む行を探す
        let potentialEnglishLine = "";
        for (let i = lines.length - 1; i >= 0; i--) {
          if (/[a-zA-Z]/.test(lines[i]) && lines[i].trim() !== "") {
            potentialEnglishLine = lines[i].trim();
            break;
          }
        }
        if (potentialEnglishLine) {
            fallbackText = potentialEnglishLine;
        } else if (lines[0].trim() !== "") { // それでも見つからなければ最初の行
            fallbackText = lines[0].trim();
        }
      }
      // ツイートに適した長さに調整
      tweetEssence = fallbackText.substring(0, 80) + (fallbackText.length > 80 ? "..." : "");
    }
  }

  const today = new Date().toISOString().split("T")[0];

  // 1. 投稿のパーマリンクを生成
  const [year, month, day] = today.split('-');
  const postPath = `/${year}/${month}/${day}/gemini-quote.html`;
  const postPermalink = `${SITE_BASE_URL}${postPath}`;

  // 2. ツイートするテキストを準備 (英語のエッセンスを使用)
  const tweetText = `AI Quote of the Day: "${tweetEssence}" See more 👇`;

  // 3. テキストとURLをエンコード
  const encodedTweetText = encodeURIComponent(tweetText);
  const encodedPostPermalink = encodeURIComponent(postPermalink);

  // 4. 動的なTwitter共有URLを組み立て
  const dynamicTwitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedTweetText}&url=${encodedPostPermalink}`;

  const md = `---
title: "Gemini's Wisdom ${today}"
date: ${today}
tags: [AI, Quote, English]
layout: post
---

${displayQuote}
---

☕️ [Buy Me a Coffee](${BMAC_LINK})

🐦 [Share on X](${dynamicTwitterShareUrl})
`;

  const outDir = path.join(process.cwd(), "_posts");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, `${today}-gemini-quote.md`);
  fs.writeFileSync(outPath, md);

  console.log("✅ Gemini quote saved:", outPath);
  console.log("📝 Display Quote (for blog):\n", displayQuote);
  console.log("🐦 Tweet Essence (English for tweet):\n", tweetEssence);
}

main().catch(err => {
  console.error("❌ Gemini API request failed.");
  if (err.response) {
    console.error("Status Code:", err.response.status);
    console.error("API Error Details:", JSON.stringify(err.response.data, null, 2));
  } else if (err.request) {
    console.error("No response received from the API:", err.request);
  } else {
    console.error("Error setting up the request:", err.message);
  }
  // console.error("Full error object for debugging:", err); // デバッグ時にコメントを外す
  process.exit(1);
});
