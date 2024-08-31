const chatMessagesElement = document.getElementById("chat-messages");
const chatMessageTemplateElement = document.getElementById(
  "chat-message-template"
);
const inputFormElement = document.getElementById("input-form");
const promptTextInputElement = document.getElementById("prompt-text-input");

inputFormElement.onsubmit = async (event) => {
    // フォームが送信されたときのページ遷移を防ぐ
    event.preventDefault();

    const promptText = promptTextInputElement.value.trim();
    if (promptText === "") return;
    promptTextInputElement.value = "";

    const yourChatMessage = { content: promptText };
    addChatMessageElement("you", yourChatMessage);

    const aiChatMessage = await postChat({ promptText });
    addChatMessageElement("ai", aiChatMessage);
  };

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
  newButton.classList.add("select-btn");
  createButton.appendChild(newButton); 
});

const selectedIngredients = [];
const showSelectedIngredients = document.getElementById("selectedIngredients");

document.addEventListener('click', function(event) {
  if (event.target.matches('.select-btn')) {
    const ingredient = event.target.textContent;
    if (selectedIngredients.includes(ingredient)) {
      console.log(`${ingredient}はすでに選択されています`);
    } else {
      selectedIngredients.push(ingredient);

      const selectedIngredientsList = document.createElement("li");
      selectedIngredientsList.textContent = ingredient;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "削除";
      deleteButton.classList.add("delete-btn");
      deleteButton.dataset.ingredient = ingredient; // 削除ボタンに食材情報を追加

      selectedIngredientsList.appendChild(deleteButton);
      showSelectedIngredients.appendChild(selectedIngredientsList);

      console.log(ingredient);
      console.log(selectedIngredients);
    }
  } else if (event.target.matches('.delete-btn')) {
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
