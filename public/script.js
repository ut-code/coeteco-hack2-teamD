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
const choiceGenre = ["肉類", "野菜・果実類", "魚類", "乾物・海藻類", "きのこ・山菜類", "卵類", "いも類", "パン類", "ごはん類", "乳製品類", "豆・豆腐・豆腐加工品類", "麺類", "その他食材"];

// 各ジャンルに対応する食材リストをオブジェクトで定義
const ingredients = {
  "肉類": ["牛肉", "豚肉", "鶏肉", "ひき肉"],
  "野菜・果実類": ["キャベツ", "人参", "レタス", "白菜", "玉ねぎ", "長ネギ", "もやし", "トマト", "きゅうり", "なす", "ピーマン", "かぼちゃ", "大根", "レンコン", "アボカド"],
  "魚類": ["鮭・サーモン", "マグロ", "さば", "さんま", "ツナ缶", "エビ・カニ", "イカ・タコ", "貝類", "練り物"],
  "乾物・海藻類": ["昆布", "ひじき", "わかめ", "お麩", "春雨"],
  "きのこ・山菜類": ["しいたけ", "まいたけ", "しめじ", "エリンギ", "えのき", "山菜"],
  "卵類": ["卵"],
  "いも類": ["じゃがいも", "さつまいも", "里芋", "長芋・山芋", "こんにゃく"],
  "パン類": ["食パン", "クロワッサン"],
  "ごはん類": ["白米", "玄米", "もち米", "餅", "五穀米"],
  "乳製品類": ["牛乳", "チーズ", "ヨーグルト", "生クリーム"],
  "豆・豆腐・豆腐加工品類": ["豆腐", "納豆", "油揚げ", "厚揚げ"],
  "麺類": ["うどん", "そば", "そうめん", "中華麺", "パスタ・スパゲティ"],
};

// ジャンルボタンを作成
choiceGenre.forEach((genre) => {
  const newButton = document.createElement("button");
  newButton.textContent = genre;
  newButton.type = "button";
  newButton.classList.add(genre);
  createButton.appendChild(newButton);

  // 各ジャンルボタンのクリックイベントを設定
  newButton.onclick = () => {
    // 既存の食材ボタンを削除
    const existingButtons = document.querySelectorAll(".select-btn");
    existingButtons.forEach(btn => btn.remove());

    // ジャンルに対応する食材のボタンを生成
    if (ingredients[genre]) {
      ingredients[genre].forEach((item) => {
        const ingredientButton = document.createElement("button");
        ingredientButton.textContent = item;
        ingredientButton.type = "button";
        ingredientButton.classList.add("select-btn");
        createButton.appendChild(ingredientButton);
      });
    }
  };
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
    const promptText = selectedIngredients.join("と") + "を用いた主菜を含む一食の献立を3つ提案してください。ただし、一つ一つの献立の始めには###を、終わりには---をつけて、わかりやすく表示してください。また、材料やレシピは表示せず、料理名のみ出力してください。";
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
