import express from "express";
import { ChatOpenAI } from "@langchain/openai";
import { DallEAPIWrapper } from "@langchain/openai";

// LangChain の ChatOpenAI クラスは OPENAI_API_KEY 環境変数を自動的に参照する
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
  console.log(`chatModelへのプロンプト${promptText}`)
  // クライアントから送られてきたデータは無条件で信用しない
  if (typeof promptText !== "string") {
    response.sendStatus(400);
    return;
  }

  const aiMessageChunk = await chatModel.invoke(promptText);
  response.json({ content: aiMessageChunk.content });
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
