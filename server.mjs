import express from "express";
import { ChatOpenAI } from "@langchain/openai";

// LangChain の ChatOpenAI クラスは OPENAI_API_KEY 環境変数を自動的に参照する
const chatModel = new ChatOpenAI();

const app = express();

app.use(express.static("./public"));
app.use(express.json());

app.post("/chat", async (request, response) => {
  const promptText = request?.body?.promptText;
  // クライアントから送られてきたデータは無条件で信用しない
  if (typeof promptText !== "string") {
    response.sendStatus(400);
    return;
  }

  const aiMessageChunk = await chatModel.invoke(promptText);
  response.json({ content: aiMessageChunk.content });
});
app.listen(3000);
console.log("Server started at http://localhost:3000");
