import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ChatOpenAI } from '@langchain/openai';

const prisma = new PrismaClient(); // PrismaClient のインスタンスを一度だけ作成
const chatModel = new ChatOpenAI({
  model: "gpt-4o"
});
const app = express();

app.use(express.static("./public"));
app.use(express.json());

app.post("/chat", async (request, response) => {
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
