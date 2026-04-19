let dictionary = {};
let isDictionaryLoaded = false;
let currentLetter = null;
let searchInput = null;
let clearSearchBtn = null;

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\\/g, "&#92;");
}

function showLoading() {
  const container = document.getElementById("articles-container");
  if (container) container.innerHTML = "<p>Загрузка словаря...</p>";
}

function hideLoading() {
  const container = document.getElementById("articles-container");
  if (container) container.innerHTML = "";
}

async function loadDictionary() {
  showLoading();
  try {
    const response = await fetch("../data/dictionary.json");
    if (!response.ok)
      throw new Error(`Ошибка загрузки словаря: ${response.status}`);
    dictionary = await response.json();
    isDictionaryLoaded = true;
    console.log("Словарь успешно загружен");
    hideLoading();
  } catch (error) {
    console.error("Ошибка при загрузке словаря:", error);
    dictionary = {
      А: [{ word: "Пример", definition: "Резервные данные загружены" }],
      A: [{ word: "Example", definition: "Backup data loaded" }],
    };
    isDictionaryLoaded = true;
    hideLoading();
  }
}

function showArticles(letter) {
  currentLetter = letter;
  const articlesContainer = document.getElementById("articles-container");
  articlesContainer.innerHTML = "";

  const articles = dictionary[letter] || [];

  if (articles.length === 0) {
    articlesContainer.innerHTML = `<p class="not-found">Статьи на букву "${letter}" не найдены.</p>`;
    return;
  }

  articles.forEach((article) => {
    const articleElement = document.createElement("div");
    articleElement.className = "article";
    articleElement.dataset.word = escapeHtml(article.word).toLowerCase();
    articleElement.dataset.definition = escapeHtml(
      article.definition,
    ).toLowerCase();

    let htmlContent = `
        <h3>${escapeHtml(article.word)}</h3>
        <p class="definition"><strong>Определение (дефиниция)</strong> ${escapeHtml(article.definition)}</p>
      `;

    if (article.translation)
      htmlContent += `<p class="translation"><strong>Перевод:</strong> ${escapeHtml(article.translation)}</p>`;

    if (article.synonyms)
      htmlContent += `<p class="synonyms"><strong>Синонимы:</strong> ${article.synonyms}</p>`;

    if (article.securityNote)
      htmlContent += `<p class="security-note"><strong>Примечание:</strong> ${escapeHtml(article.securityNote)}</p>`;

    if (article.link)
      htmlContent += `
          <p>
            <a href="${article.link}" target="_blank" class="link-to-details">
              Читать подробнее
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link">
          <path d="M15 3h6v6"></path>
          <path d="M10 14 21 3"></path>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        </svg>
            </a>
          </p>
        `;

    if (article.mozillaLink)
      htmlContent += `
          <p>
            <a href="${article.mozillaLink}" target="_blank" class="link-to-details">
              Руководство MDN:
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link">
          <path d="M15 3h6v6"></path>
          <path d="M10 14 21 3"></path>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        </svg>
            </a>
          </p>
        `;

    articleElement.innerHTML = htmlContent;
    articlesContainer.appendChild(articleElement);
  });
}

function showAllArticles() {
  currentLetter = "all";
  const articlesContainer = document.getElementById("articles-container");
  articlesContainer.innerHTML = "";

  const allArticles = [];
  for (const letter in dictionary) {
    if (Array.isArray(dictionary[letter]))
      allArticles.push(...dictionary[letter]);
  }

  if (allArticles.length === 0) {
    articlesContainer.innerHTML = "<p>Словарные статьи не найдены.</p>";
    return;
  }

  allArticles.forEach((article) => {
    const articleElement = document.createElement("div");
    articleElement.className = "article";
    articleElement.dataset.word = escapeHtml(article.word).toLowerCase();
    articleElement.dataset.definition = escapeHtml(
      article.definition,
    ).toLowerCase();

    let htmlContent = `
            <h3>${escapeHtml(article.word)}</h3>
            <p class="definition">${escapeHtml(article.definition)}</p>
        `;

    if (article.translation)
      htmlContent += `<p class="translation"><strong>Перевод:</strong> ${escapeHtml(article.translation)}</p>`;

    if (article.related)
      htmlContent += `<p class="translation"><strong>Связанные термины:</strong> ${escapeHtml(article.related)}</p>`;

    if (article.reference)
      htmlContent += `<p><strong>Подробнее:</strong> ${escapeHtml(article.reference)}</p>`;

    if (article.link)
      htmlContent += `
                <p>
                    <a href="${article.link}" target="_blank" class="link-to-details">
                        Читать подробнее 
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link">
                            <path d="M15 3h6v6"></path>
                            <path d="M10 14 21 3"></path>
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        </svg>
                    </a>
                </p>
            `;

    if (article.mozillaLink)
      htmlContent += `
                <p>
                    <a href="${article.mozillaLink}" target="_blank" class="link-to-details">
                        Руководство MDN (Mozilla Developer Network)
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link">
                            <path d="M15 3h6v6"></path>
                            <path d="M10 14 21 3"></path>
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        </svg>
                    </a>
                </p>
            `;

    articleElement.innerHTML = htmlContent;
    articlesContainer.appendChild(articleElement);
  });
}

function filterArticles(query) {
  const articlesContainer = document.getElementById("articles-container");
  if (!currentLetter) {
    articlesContainer.innerHTML = `<p class="select-letter">Сначала выберите букву из алфавита</p>`;
    return;
  }
  if (!query) {
    currentLetter === "all" ? showAllArticles() : showArticles(currentLetter);
    return;
  }
  const lowerQuery = query.toLowerCase();
  const allArticles = articlesContainer.querySelectorAll(".article");
  let hasVisible = false;
  allArticles.forEach((article) => {
    const word = article.dataset.word;
    const definition = article.dataset.definition;
    if (word.includes(lowerQuery) || definition.includes(lowerQuery)) {
      article.classList.remove("hidden");
      hasVisible = true;
    } else {
      article.classList.add("hidden");
    }
  });
  if (!hasVisible) {
    articlesContainer.innerHTML = `<p class="not-found">По вашему запросу ничего не найдено.</p>`;
  }
}

async function initApp() {
  const preloader = document.getElementById("preloader");
  const mainContent = document.getElementById("main-content");
  const articlesContainer = document.getElementById("articles-container");
  const letterButtons = document.querySelectorAll(".letter-btn");

  // Проверка наличия ключевых элементов DOM
  if (!preloader || !mainContent || !articlesContainer) {
    console.error("Не найдены необходимые элементы DOM");
    return;
  }

  // Загрузка данных ПЕРЕД инициализацией интерфейса
  await loadDictionary();

  // Скрываем прелоадер и показываем основной контент
  preloader.classList.add("hidden");
  mainContent.classList.remove("hidden");

  // Инициализация интерфейса после загрузки данных
  searchInput = document.getElementById("search-input");
  clearSearchBtn = document.getElementById("clear-search");

  letterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const letter = this.getAttribute("data-letter");
      letter === "all" ? showAllArticles() : showArticles(letter);
      searchInput.value = "";
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterArticles(this.value);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", function () {
      searchInput.value = "";
      filterArticles("");
    });
  }
}

document.addEventListener("DOMContentLoaded", initApp);
