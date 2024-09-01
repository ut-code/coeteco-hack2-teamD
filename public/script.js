const chatMessagesElement = document.getElementById("chat-messages");
const menu1Element = document.getElementById("menu1");
const menu2Element = document.getElementById("menu2");
const menu3Element = document.getElementById("menu3");
const chatMessageTemplateElement = document.getElementById("chat-message-template");
const submitButtonElement = document.getElementById("submit-button");
const imageElement = document.getElementById("image-element");
const imageUploadInput = document.getElementById("imageUploadInput");
const syokuzai = ["豚肉", "鯖", "ごはん", "味噌", "タマネギ", "人参", "じゃがいも", "砂糖", "塩", "醤油", "ごま油", "ミカン"];

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

async function postChat(request) {
  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Chat APIリクエストエラー:", error);
    return { content: "エラーが発生しました。後で再試行してください。" };
  }
}

async function recognizeIngredientsWithChatGPT(imageBase64) {
  const promptText = "画像にある食べ物を全て答えてください。ただし、答えには食材のみを表示してください。";
  const request = {
    promptText,
    "type": "image_url",
    "image_url": `data:image/jpeg;base64,${imageBase64}`
    
  };

  console.log("APIリクエスト:", request); // リクエスト内容を確認
  const aiResponse = await postChat(request);
  console.log("認識された食材 (ChatGPT):", aiResponse.content);

  return aiResponse.content;
}


// 画像を圧縮する関数
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let width = img.width;
      let height = img.height;

      // アスペクト比を保ちつつサイズを制限
      if (width > maxWidth) {
        height = height * (maxWidth / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = width * (maxHeight / height);
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const base64 = canvas.toDataURL('image/jpeg', quality);
      resolve(base64);
    };
    img.onerror = reject;

    const reader = new FileReader();
    reader.onload = function(e) {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

imageUploadInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    const compressedImageBase64 = await compressImage(file);
    imageElement.src = compressedImageBase64;
    console.log("圧縮後のBase64:", compressedImageBase64); 

    const imageBase64 = compressedImageBase64.split(',')[1];
    const recognizedIngredients = await recognizeIngredientsWithChatGPT(imageBase64);
    console.log("画像Base64データ:", imageBase64);

    addIngredientsToSyokuzai(recognizedIngredients.split('、'));
    displayRecognizedIngredients(recognizedIngredients.split('、'));
  }
});

function addIngredientsToSyokuzai(ingredients) {
  ingredients.forEach(ingredient => {
    if (!syokuzai.includes(ingredient)) {
      syokuzai.push(ingredient);
    }
  });
  console.log("更新されたsyokuzai:", syokuzai);
}

function displayRecognizedIngredients(ingredients) {
  const recognizedIngredientsElement = document.getElementById("recognized-ingredients");
  recognizedIngredientsElement.innerHTML = ingredients.map(ingredient => `<li>${ingredient}</li>`).join('');
}

function reduceIngredients(ingredientsText, syokuzai) {
  const ingredientsList = ingredientsText.split('・').map(item => item.trim());
  const reducedList = ingredientsList.filter(item => !syokuzai.includes(item));
  return reducedList.join('・');
}

function remainIngredients(ingredientsText, syokuzai) {
  const ingredientsList = ingredientsText.split('・').map(item => item.trim());
  const remainList = ingredientsList.filter(item => syokuzai.includes(item));
  return remainList.join('・');
}

function displayRecipeResponse(response) {
  const responseDisplayElement = document.getElementById('response-display');

  const reducedIngredients = reduceIngredients(response, syokuzai);
  const remainIngredientsList = remainIngredients(response, syokuzai);

  const formattedResponse = formatResponse(reducedIngredients);

  responseDisplayElement.innerHTML = `<div class="recipe-box">${formattedResponse}</div>`;

  console.log("減算された材料リスト:", remainIngredientsList);
}

function formatResponse(response) {
  let formatted = response.replace(/\n/g, '<br/>');
  formatted = formatted.split('・').map(item => `<li>${item.trim()}</li>`).join('');
  formatted = '<ul>' + formatted + '</ul>';

  return formatted;
}

function displayMenu(menu1, menu2, menu3) {
  menu1Element.innerHTML = formatMenu(menu1);
  menu2Element.innerHTML = formatMenu(menu2);
  menu3Element.innerHTML = formatMenu(menu3);

  menu1Element.onclick = () => sendRecipeRequest(menu1);
  menu2Element.onclick = () => sendRecipeRequest(menu2);
  menu3Element.onclick = () => sendRecipeRequest(menu3);

  console.log("献立の配列:", [menu1, menu2, menu3]);
}

function formatMenu(menu) {
  return menu.replace(/#/g, '<br/>');
}

async function sendRecipeRequest(menu) {
  const promptText = `${menu} この献立の料理のレシピの材料を送信してください。ただし数量や料理名は表示しないかつ、材料は必ず・で箇条書きしてください。食材の書き方は${syokuzai}の書き方に基づいてください。`;

  const aiResponse = await postChat({ promptText });
  console.log(aiResponse);
  displayRecipeResponse(aiResponse.content);
}

const createButton = document.getElementById('selectButton');
const choiceGenre = {
  "肉": ["鶏肉", "豚肉", "牛肉"],
  "野菜・果実類": ["トマト", "ナス", "キャベツ", "にんじん"],
  "魚類": ["サバ", "サーモン", "アジ"],
  "乾物・海藻類": ["昆布", "干ししいたけ"],
  "きのこ・山菜類": ["シイタケ", "エノキ", "ワラビ"],
  "卵類": ["鶏卵", "うずら卵"],
  "いも類": ["じゃがいも", "さつまいも"],
  "パン類": ["食パン", "フランスパン"],
  "ごはん類": ["白ごはん", "玄米"],
  "乳製品類": ["牛乳", "ヨーグルト"],
  "豆・豆腐・豆腐加工品類": ["豆腐", "納豆"],
  "麺類": ["うどん", "そば", "スパゲッティ"],
  "その他食材": ["みりん", "砂糖"]
};

createButton.addEventListener("click", () => {
  console.log("選択されたジャンル:", choiceGenre);
});

submitButtonElement.onclick = async () => {
  const text = document.getElementById("text-input").value;
  const response = await postChat({ promptText: text });
  addChatMessageElement("you", { content: text });
  addChatMessageElement("ai", response);
};
