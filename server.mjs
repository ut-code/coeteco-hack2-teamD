import { ChatOpenAI } from "@langchain/openai";
import { DallEAPIWrapper } from "@langchain/openai";
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ChatOpenAI } from '@langchain/openai';

const prisma = new PrismaClient();
const chatModel = new ChatOpenAI({
    model: "gpt-4o"
  });

const imgModel = new DallEAPIWrapper({
    n: 1, // Default
    modelName: "dall-e-3", // Default 
    size: "1792x1024"
});

const app = express();

app.use(express.static("./public"));
app.use(express.json());

app.post("/chat", async (request, response) => {
  console.log(`/chatへのリクエスト:${request}`)
  const promptText = request?.body?.promptText;
  if (typeof promptText !== "string") {
    response.sendStatus(400);
    return;
  }

  try {
    const aiMessageChunk = await chatModel.invoke(promptText);
    response.json({ content: aiMessageChunk.content });
  } catch (error) {
    console.error('Failed to generate response:', error); // エラーの詳細をログ出力
    response.status(500).json({ error: 'Failed to generate response', details: error.message });
  }
});

app.get('/products', async (req, res) => {
  console.log('Received request for /products');
  try {
    const products = await prisma.products.findMany(); // テーブル名を確認
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error); // エラーの詳細をログ出力
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

// アプリケーションのシャットダウン時に接続をクリーンアップ
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});

app.post("/generate", async (request, response) => {
  console.log(`/generateへのリクエスト:${request}`,request)
  //const promptText = `${request.body.key1} ${request.body.key2}`;
  const promptText = request?.body?.key1[`menu${request.body.key2}`];
  console.log(`imgModelへのプロンプト${promptText}`)
  // クライアントから送られてきたデータは無条件で信用しない
  if (typeof promptText !== "string") {
    response.sendStatus(400);
    return;
  }
  const imageURL = await imgModel.invoke(promptText);
  console.log("Generated Image URL:", imageURL);
  response.json({ content: imageURL });
});

app.listen(3000);
console.log("Server started at http://localhost:3000");
