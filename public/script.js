const chatMessagesElement = document.getElementById("chat-messages");
const chatMessageTemplateElement = document.getElementById("chat-message-template");
const inputFormElement = document.getElementById("input-form");
const promptTextInputElement = document.getElementById("prompt-text-input");

inputFormElement.onsubmit = async (event) => {
  // フォームが送信されたときのページ遷移を防ぐ
  event.preventDefault();

  const promptText =
    promptTextInputElement.value.trim() +
    "を用いた主菜を含む一食の献立を3つ提案してください。ただし、献立はわかりやすく表に整理して要素ごとに改行して表示してください。";
  if (promptText === "") return;
  promptTextInputElement.value = "";

  const yourChatMessage = { content: promptText };
  addChatMessageElement("you", yourChatMessage);

  // サーバーにリクエストを送信し、AIからの返答を取得
  const aiChatMessage = await postChat({ promptText });

  // 取得した返答を画面に描画
  addChatMessageElement("ai", aiChatMessage);

  // 取得した返答をstring形式で利用（例えばコンソールに出力）
  const responseString = aiChatMessage.content;
  console.log(responseString); // これで返答をstring形式で取得できます

  // 献立を3つに分割（改行文字 "\n\n" を基準に分割する例）
  const menuItems = responseString.split("###");

  // 分割した献立をそれぞれ個別に保存または処理
  const menu1 = menuItems[1];
  const menu2 = menuItems[2];
  const menu3 = menuItems[3];

  console.log("献立 1:", menu1);
  console.log("献立 2:", menu2);
  console.log("献立 3:", menu3);

  // 必要に応じて他の処理を追加
};

// メッセージを画面に描画する
function addChatMessageElement(author, chatMessage) {
  const fragment = chatMessageTemplateElement.content.cloneNode(true);
  const contentElement = fragment.querySelector(".chat-message__content");
  const rootElement = fragment.querySelector(".chat-message");
  const authorElement = fragment.querySelector(".chat-message__author");
  rootElement.classList.add(`chat-message--${author}`);
  const authorLabelMap = { you: "あなた", ai: "AI" };
  authorElement.textContent = authorLabelMap[author];
  const deleteButtonElement = fragment.querySelector(".chat-message__delete-button");
  contentElement.textContent = chatMessage.content;
  deleteButtonElement.onclick = () => {
    rootElement.remove();
  };
  chatMessagesElement.appendChild(fragment);
}

// AIと対話する関数
async function postChat(request) {
  const response = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  // レスポンスをJSONとして解析
  return await response.json();
}
