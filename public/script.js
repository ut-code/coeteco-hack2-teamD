const chatMessagesElement = document.getElementById("chat-messages");
const menu1Element = document.getElementById("menu1");
const menu2Element = document.getElementById("menu2");
const menu3Element = document.getElementById("menu3");
const chatMessageTemplateElement = document.getElementById(
  "chat-message-template"
);
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
  return await response.json();
}

// 変更された displayMenu 関数
function displayMenu(menu1, menu2, menu3) {
  menu1Element.innerHTML = formatMenu(menu1);
  menu2Element.innerHTML = formatMenu(menu2);
  menu3Element.innerHTML = formatMenu(menu3);

  // クリックイベントの追加
  menu1Element.onclick = () => sendRecipeRequest(menu1);
  menu2Element.onclick = () => sendRecipeRequest(menu2);
  menu3Element.onclick = () => sendRecipeRequest(menu3);
}

// 献立のテキストを改行形式でフォーマットする関数
function formatMenu(menu) {
  return menu.replace(/#/g, '<br/>#');
}

// レシピリクエストを送信する関数
async function sendRecipeRequest(menu) {
  const promptText = `${menu} この献立のレシピを送信してください。`;

  const aiResponse = await postChat({ promptText });

  // レスポンスをページ上の指定された場所に表示
  displayRecipeResponse(aiResponse.content);
}

// レシピのレスポンスをHTMLで整形して表示する関数
function displayRecipeResponse(response) {
  const responseDisplayElement = document.getElementById('response-display');

  // レスポンスを適切にHTMLフォーマットに変換
  const formattedResponse = formatResponse(response);

  responseDisplayElement.innerHTML = formattedResponse;
}

// レスポンスをHTMLフォーマットに変換する関数
function formatResponse(response) {
  // 改行を <br> タグに変換
  let formatted = response.replace(/\n/g, '<br/>');

  // リスト形式に変換 (例: "1. ..." -> "<ul><li>...</li></ul>")
  formatted = formatted.replace(/(\d+)\.\s+/g, '<li>$&</li>');
  formatted = '<ul>' + formatted + '</ul>';

  // 必要に応じて追加のフォーマット処理を行う
  // 例えば、段落ごとに <p> タグを追加するなど

  return formatted;
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

submitButtonElement.onclick = async () => {
    const cookTime = document.getElementById("cook-time-slider").value;
    const peopleNumber = document.getElementById("people-number-slider").value;
    const otherRequest = document.getElementById("more-request-message").value;
    const otherMenu = document.getElementById("tuika").value;

    const menuCheckedBoxes = document.querySelectorAll('input[name="dish"]:checked');

    // チェックがついたチェックボックスの値を配列に変換
    const menuList = Array.from(menuCheckedBoxes).map(checkbox => checkbox.value);
  
    // 配列をコンソールに出力
    console.log(menuList);

    const promptText = selectedIngredients.join("と") + "を用いた主菜を含む一食の献立を3つ提案してください。ただし、一つ一つの献立の始めには###を、終わりには---をつけて、わかりやすく表示してください。また、材料やレシピは表示せず、料理名のみ出力してください。ただし、献立の条件を以下のようにします。#調理時間は"+cookTime+"分以内であること。 #" + peopleNumber + "人分であること。 #" + menuList.join("と")+ "と他" + otherMenu + "品で構成されていること。 #" + otherRequest;
    const aiChatMessage = await postChat({ promptText });
    addChatMessageElement("you", { content: promptText });
    addChatMessageElement("ai", aiChatMessage);
    const responseString = aiChatMessage.content;
    console.log(responseString); // これで返答をstring形式で取得できます

    // 献立を3つに分割（改行文字 "\n\n" を基準に分割する例）
    const menuItems = responseString.match(/###([\s\S]*?)---/g).map(item => item.replace(/###|---/g, '').trim());

    // 分割した献立をそれぞれ個別に保存または処理
    const menu1 = menuItems[0];
    const menu2 = menuItems[1];
    const menu3 = menuItems[2];

    console.log("献立 1:", menu1);
    console.log("献立 2:", menu2);
    console.log("献立 3:", menu3);

    // 必要に応じて他の処理を追加
    // 3つの献立をページの下部に表示
    displayMenu(menu1, menu2, menu3);
};


  const cookTimeSlider = document.getElementById("cook-time-slider");
  const peopleNumberSlider = document.getElementById("people-number-slider");
  const cookTimeDisplay = document.getElementById('cook-time-display');
  const peopleNumberDisplay = document.getElementById('people-number-display');

  // 初期表示
  cookTimeDisplay.textContent = cookTimeSlider.value + "分以内";
  peopleNumberDisplay.textContent = peopleNumberSlider.value + "人";

  // イベントリスナーを追加
  cookTimeSlider.addEventListener('input', function() {
      cookTimeDisplay.textContent = this.value + "分以内";
  });

  peopleNumberSlider.addEventListener('input', function() {
      peopleNumberDisplay.textContent = this.value + "人";
  });