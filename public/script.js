const chatMessagesElement = document.getElementById("chat-messages");
const chatMessageTemplateElement = document.getElementById(
  "chat-message-template"
);

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

const buttons = document.querySelectorAll("button")
buttons.forEach(button => {button.addEventListener('click', async function(){
    buttonText = button.textContent || button.innerText;
    const promptText = buttonText.trim()+"を用いた主菜を含む一食の献立を3つ提案してください";

    const yourChatMessage = { content: promptText };
    addChatMessageElement("you", yourChatMessage);

    const aiChatMessage = await postChat({ promptText });
    addChatMessageElement("ai", aiChatMessage);
    });
}
);
