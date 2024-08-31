const chatMessagesElement = document.getElementById("chat-messages");
const chatMessageTemplateElement = document.getElementById(
  "chat-message-template"
);
const submitButtonElement = document.getElementById("submit-button");

// メッセージを画面に描画する
function addChatMessageElement(author, chatMessage) {
  // template 要素 (HTMLTemplateElement) は content プロパティを持ち、cloneNode メソッドで複製して利用できる
  // 引数に true を渡すと子孫要素も複製される
  const fragment = chatMessageTemplateElement.content.cloneNode(true);
  // querySelector メソッドを用いると呼ばれたクラス内の要素を CSS のセレクタの記法で検索できる
  const contentElement = fragment.querySelector(".chat-message__content");
  const rootElement = fragment.querySelector(".chat-message");
  const authorElement = fragment.querySelector(".chat-message__author");
  rootElement.classList.add(`chat-message--${author}`);
  const authorLabelMap = { you: "あなた", ai: "AI" };
  authorElement.textContent = authorLabelMap[author];
  const deleteButtonElement = fragment.querySelector(
    ".chat-message__delete-button"
  );
  contentElement.textContent = chatMessage.content;
  deleteButtonElement.onclick = () => {
    rootElement.remove();
  };
  chatMessagesElement.appendChild(fragment);
}

async function postChat(request) {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    return await response.json();
}

const createButton = document.getElementById("selectButton");
const choiceOfIngredients = ["豚肉", "牛肉", "魚", "卵", "鶏肉"]; //選択肢の食材の配列

choiceOfIngredients.forEach((ingredient) => { //choiceOfIngredientsの配列からそれぞれのボタンを作成
  const newButton = document.createElement("button");
  newButton.textContent = ingredient;
  newButton.type = "button";
  newButton.classList.add("select-btn")
  createButton.appendChild(newButton);
});

selectedIngredients = []
const selectButtons = document.querySelectorAll(".select-btn")
selectButtons.forEach(selectButton => {selectButton.addEventListener('click', function(){
  ingredient = selectButton.textContent;
  if (selectedIngredients.includes(ingredient)) {
    console.log(`${ingredient}はすでに選択されています`)
  } else {
    selectedIngredients.push(ingredient);
  }
  console.log(ingredient);
  console.log(selectedIngredients);
  });
});

submitButtonElement.onclick = async () => {
    const promptText = selectedIngredients.join("と") + "を用いた主菜を含む一食の献立を3つ提案してください";
    const aiMessageChunk = await postChat({ promptText });
    addChatMessageElement("you", { content: promptText });
    addChatMessageElement("ai", aiMessageChunk);
    selectedIngredients = [];
    const responseString = aiMessageChunk.content;

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
};
