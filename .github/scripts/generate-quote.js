const axios = require("axios");
const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY が設定されていません。");
  process.exit(1);
}

const BMAC_LINK = "https://www.buymeacoffee.com/kgninja";
const SITE_BASE_URL = "https://kg-ninja.github.io/YU-GEKI-Gemini"; // 格言ブログのURLに合わせてください

// フォールバック関数: Summaryが見つからない場合に英語の行からエッセンスを生成しようとする
function getFallbackEssence(fullText) {
  const lines = fullText.split('\n');
  let fallbackText = "Check out the latest AI quote!"; // デフォルトのフォールバックテキスト
  if (lines.length > 0) {
    let potentialEnglishLine = "";
    // 最後の行から英字が含まれる行を探す (英語の格言と仮定)
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
  return fallbackText.substring(0, 80) + (fallbackText.length > 80 ? "..." : "");
}

async function main() {
  const prompt = `
日本唯一無二の格言とそれに対応する英語訳を生成してください（それぞれ50文字程度）。
次に、その格言の非常に短い英語の要約（ツイート用、10～20語程度）を「Summary:」という接頭辞を付けて、改行してから生成してください。
「Summary:」の行の後は、何も出力しないでください。他の前置きや説明文は一切含めないでください。
前回の出力とは全く異なる格言を生成してください。人と自然の調和や禅の精神、人間愛を説いて。どんな格言でも最後に"#KGNINJA"という署名を入れてください。

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

  // デバッグ用にAPIからの生レスポンスを出力したい場合は、以下のコメントを解除してください
  // console.log("--- RAW API Response Text START ---");
  // console.log(apiGeneratedText);
  // console.log("--- RAW API Response Text END ---");

  let displayQuote = "Today's quote is taking a break due to AI whims. Please check back later!";
  let tweetEssence = "Check out the latest AI quote!";

  if (apiGeneratedText) {
    const summaryMarker = "\nSummary:";
    const summaryIndex = apiGeneratedText.indexOf(summaryMarker);

    if (summaryIndex !== -1) {
      displayQuote = apiGeneratedText.substring(0, summaryIndex).trim();
      let potentialEssence = apiGeneratedText.substring(summaryIndex + summaryMarker.length).trim();
      tweetEssence = potentialEssence.split('\n')[0].trim();
      
      if (tweetEssence === "") {
          if (potentialEssence.split('\n').length > 1 && potentialEssence.split('\n')[1].trim() !== "") {
              tweetEssence = potentialEssence.split('\n')[1].trim();
          } else {
              tweetEssence = getFallbackEssence(displayQuote);
          }
      }
    } else {
      displayQuote = apiGeneratedText.trim();
      tweetEssence = getFallbackEssence(displayQuote);
    }
  }

  const today = new Date().toISOString().split("T")[0]; // UTCでの今日の日付

  const [year, month, day] = today.split('-');
  // 注意: YU-GEKI-Gemini (格言ブログ) 用のファイル名とパスです。
  // Funwariyosoブログの場合は `gemini-quote.html` の部分を `funwari-forecast.html` などに変更してください。
  const postPath = `/${year}/${month}/${day}/gemini-quote.html`; 
  const postPermalink = `${SITE_BASE_URL}${postPath}`;

  // ツイートするテキストを準備 (英語のエッセンスを使用)
  const tweetText = `AI Quote of the Day: "${tweetEssence}" #KGNINJA See more 👇`;

  // テキストとURLをエンコード
  const encodedTweetText = encodeURIComponent(tweetText);
  const encodedPostPermalink = encodeURIComponent(postPermalink);

  // 動的なTwitter共有URLをここで直接生成
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

🐦 [Share on X](${dynamicTwitterShareUrl}) `;

  const outDir = path.join(process.cwd(), "_posts");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  // 注意: YU-GEKI-Gemini (格言ブログ) 用のファイル名です。
  // Funwariyosoブログの場合は `${today}-gemini-quote.md` の部分を `${today}-funwari-forecast.md` などに変更してください。
  const outPath = path.join(outDir, `${today}-gemini-quote.md`); 
  fs.writeFileSync(outPath, md);

  console.log("✅ Quote saved:", outPath); // メッセージをQuoteに修正
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
  process.exit(1);
});
