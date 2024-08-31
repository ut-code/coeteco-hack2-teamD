const chatMessagesElement = document.getElementById("chat-messages");
const chatMessageTemplateElement = document.getElementById("chat-message-template");
const submitButtonElement = document.getElementById("submit-button");

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

  // 削除ボタンのクリックイベント
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
const choiceOfIngredients = ["豚肉", "牛肉", "魚", "卵", "鶏肉"]; // 選択肢の食材の配列

choiceOfIngredients.forEach((ingredient) => { // 食材ごとにボタンを作成
  const newButton = document.createElement("button");
  newButton.textContent = ingredient;
  newButton.type = "button";
  newButton.classList.add("select-btn"); // スタイルを適用
  createButton.appendChild(newButton);
});

let selectedIngredients = [];
const showSelectedIngredients = document.getElementById("selectedIngredients");

document.addEventListener('click', function(event) {
  if (event.target.matches('.select-btn')) { // 食材ボタンがクリックされた場合
    const ingredient = event.target.textContent;
    if (selectedIngredients.includes(ingredient)) {
      console.log(`${ingredient}はすでに選択されています`);
    } else {
      selectedIngredients.push(ingredient);

      const selectedIngredientsList = document.createElement("li");
      selectedIngredientsList.textContent = ingredient;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "×"; // ボタンをシンプルなアイコンに変更
      deleteButton.classList.add("delete-btn");
      deleteButton.dataset.ingredient = ingredient; // 削除ボタンに食材情報を追加

      selectedIngredientsList.appendChild(deleteButton);
      showSelectedIngredients.appendChild(selectedIngredientsList);

      console.log(ingredient);
      console.log(selectedIngredients);
    }
  } else if (event.target.matches('.delete-btn')) { // 削除ボタンがクリックされた場合
    const ingredient = event.target.dataset.ingredient;
    const index = selectedIngredients.indexOf(ingredient);

    if (index !== -1) {
      selectedIngredients.splice(index, 1); // 配列から食材を削除
      event.target.parentElement.remove(); // リストアイテムを削除
    }

    console.log(ingredient);
    console.log(selectedIngredients);
  }
});

submitButtonElement.onclick = async () => {
  const promptText = selectedIngredients.join("と") + "を用いた主菜を含む一食の献立を3つ提案してください";
  const aiMessageChunk = await postChat({ promptText });
  addChatMessageElement("you", { content: promptText });
  addChatMessageElement("ai", aiMessageChunk);
  selectedIngredients = [];
  showSelectedIngredients.innerHTML = ''; // 選択済み食材をクリア
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
