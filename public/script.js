const chatMessagesElement = document.getElementById("chat-messages");
const menu1Element = document.getElementById("menu1");
const menu2Element = document.getElementById("menu2");
const menu3Element = document.getElementById("menu3");
const chatMessageTemplateElement = document.getElementById("chat-message-template");
const submitButtonElement = document.getElementById("submit-button");
const syokuzai = ["ピーマン", '塩', '豆苗', '長なす', 'じゃがいも(メークイン）', '玉ねぎ(アーリーレッド)', '大根', 'ごぼう', 'インゲン', 'にんじん', '長芋', '大根', '枝豆', 'スナップエンドウ', 'ズッキーニ', 'ゴーヤ', 'とうもろこし', 'きぬさや', '大和芋', 'さつまいも(紅はるか)', '舞茸', 'えのき茸', 'なめこ', 'エリンギ', 'ブラウンマッシュルーム', 'ホワイトマッシュルーム', '肉厚生しいたけ', '生しいたけ', '霜降りひらたけ', '生きくらげ', '長ねぎ2本・1束', '長ねぎ', 'にら', 'にんにくの芽', 'ししとう', 'しょうが', 'にんにく', '大葉(しそ)', 'みょうが', 'きざみ小ねぎ', 'きざみ長ねぎ', 'パセリ', '糸みつば', '小ねぎ'];
let name_data = [];
let nedan_data = [];
let RemainedIngredientsList = [];


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

// 材料の配列からsyokuzaiの要素を減算する関数
function reduceIngredients(ingredientsText, syokuzai) {
  const ingredientsList1 = ingredientsText.split('・').map(item => item.trim());
  const reducedList = ingredientsList1.filter(item => !syokuzai.includes(item));
  return reducedList.join('・');
}

// 材料の配列からsyokuzaiの要素を残す関数
function remainIngredients(ingredientsText, syokuzai) {
  const ingredientsList2 = ingredientsText.split('・').map(item => item.trim());
  const remainList = ingredientsList2.filter(item => syokuzai.includes(item));
  console.log(remainList);
  return remainList.join('・');
}

// 材料と価格の詳細リストを取得する関数
function getDetailedIngredients(ingredientsText) {
  const ingredientsList3 = ingredientsText.split('・').map(item => item.trim());
  console.log(ingredientsText);
  console.log(ingredientsList3);
  let localDetailedList = ``; // localDetailedListに変更
  let sum_price=0;

  ingredientsList3.forEach(item => {
    let index = name_data.indexOf(item);
    if (index !== -1) {
      localDetailedList += `<li>${item} - ${nedan_data[index]}円</li>`;
      sum_price += Number(nedan_data[index]);
    }
  });
  localDetailedList += `<li>合計 - ${sum_price}円</li>`

  console.log(localDetailedList); // ログで内容を確認
  return `<ul>${localDetailedList}</ul>`;
}

// レシピリクエストを送信する関数
async function sendRecipeRequest(menu) {
  const promptText = `${menu} この献立の料理のレシピの材料を送信してください。ただし数量や料理名は表示しないかつ、材料は必ず・で箇条書きしてください。食材の書き方は${name_data}の書き方に基づいてください。`;

  const aiResponse = await postChat({ promptText });
  console.log(aiResponse);

  // レスポンスをページ上の指定された場所に表示
  const response = aiResponse.content;
  const reducedIngredientsList = reduceIngredients(response, syokuzai);
  const remainIngredientsList = remainIngredients(response, syokuzai);

  // 残りの材料の詳細リストを生成
  let detailedIngredientsList = getDetailedIngredients(reducedIngredientsList);
  RemainedIngredientsList = getDetailedIngredients(remainIngredientsList);



  // detailedListに含まれる内容だけを表示
  document.getElementById('response-display').innerHTML = `
    <div class="recipe-box">${detailedIngredientsList}
    <span style="color: red;">${remainIngredientsList}</span>
    </div>
  `;

  console.log("詳細な材料リスト:", detailedIngredientsList);
  console.log(RemainedIngredientsList)
}

// 初期化時にデータを取得
fetchProducts().then(() => {
  // データ取得後の処理があればここに記述
});

// レシピのレスポンスをHTMLで整形して表示する関数
function displayRecipeResponse(response) {
  const responseDisplayElement = document.getElementById('response-display');

  // レスポンスをsyokuzaiに含まれる要素を減算する
  const reducedIngredients = reduceIngredients(response, syokuzai);
  const remainIngredientsList = remainIngredients(response, syokuzai);

  // 残りの材料の詳細リストを生成
  const detailedIngredientsList = getDetailedIngredients(remainIngredientsList);

  // detailedListに含まれる内容だけを表示
  responseDisplayElement.innerHTML = `
    <div class="recipe-box">${detailedIngredientsList}</div>
  `;

  // レスポンスをそのまま表示する
  console.log("詳細な材料リスト:", detailedIngredientsList);
}



// レスポンスをHTMLフォーマットに変換する関数
function formatResponse(response) {
  // 改行を <br> タグに変換
  let formatted = response.replace(/\n/g, '<br/>');

  // ・で区切られた材料をリスト形式に変換
  formatted = formatted.split('・').map(item => `<li>${item.trim()}</li>`).join('');
  formatted = '<ul>' + formatted + '</ul>';

  return formatted;
}


// displayMenu 関数
function displayMenu(menu1, menu2, menu3) {
  menu1Element.innerHTML = formatMenu(menu1);
  menu2Element.innerHTML = formatMenu(menu2);
  menu3Element.innerHTML = formatMenu(menu3);

  // クリックイベントの追加
  menu1Element.onclick = () => sendRecipeRequest(menu1);
  menu2Element.onclick = () => sendRecipeRequest(menu2);
  menu3Element.onclick = () => sendRecipeRequest(menu3);

  // 献立の配列をconsole.logで表示
  console.log("献立の配列:", [menu1, menu2, menu3]);
}

// 献立のテキストを改行形式でフォーマットする関数
function formatMenu(menu) {
  return menu.replace(/#/g, '<br/>#');
}

// ボタン作成のコード
const createButton = document.getElementById("selectButton");
const choiceGenre = ["肉類", "野菜・果実類", "魚類", "乾物・海藻類", "きのこ・山菜類", "卵類", "いも類", "パン類", "ごはん類", "乳製品類", "豆・豆腐・豆腐加工品類", "麺類", "その他食材"];
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
  const cookTime = document.getElementById("cook-time-slider").value;
  const peopleNumber = document.getElementById("people-number-slider").value;
  const otherRequest = document.getElementById("more-request-message").value;
  const otherMenu = document.getElementById("tuika").value;

  const menuCheckedBoxes = document.querySelectorAll('input[name="dish"]:checked');

  // チェックがついたチェックボックスの値を配列に変換
  const menuList = Array.from(menuCheckedBoxes).map(checkbox => checkbox.value);

  // 配列をコンソールに出力
  console.log(menuList);

  const promptText = `${selectedIngredients.join("と")}を用いた主菜を含む一食の献立を3つ提案してください。ただし、一つ一つの献立の始めには###を、終わりには---をつけて、わかりやすく表示してください。また、材料やレシピは表示せず、料理名のみ出力してください。ただし、献立の条件を以下のようにします。#調理時間は${cookTime}分以内であること。 #${peopleNumber}人分であること。 #${menuList.join("と")}と他${otherMenu}品で構成されていること。 #${otherRequest}`;
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

async function fetchProducts() {
  try {
    const response = await fetch('http://localhost:3000/products');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let data = await response.json();
    name_data = data.map(item => item.name);
    nedan_data = data.map(item => item.price);

    console.log('Name data:', name_data);
    console.log('Nedan data:', nedan_data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// 初期化時にデータを取得
fetchProducts();
