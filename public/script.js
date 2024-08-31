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
const buttonElement = ["豚肉", "牛肉", "魚", "卵"];

buttonElement.forEach((food) => {
  const newButton = document.createElement("button");
  newButton.textContent = food;
  newButton.type = "button"; 
  newButton.classList.add("select-btn")
  createButton.appendChild(newButton); 
});

selectedIngredients = []
const selectButtons = document.querySelectorAll(".select-btn")
selectButtons.forEach(selectButton => {selectButton.addEventListener('click', function(){
  ingredient = selectButton.textContent;
  selectedIngredients.push(ingredient);
  console.log(ingredient);
  console.log(selectedIngredients);
  });
});
