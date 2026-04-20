// Глобальные переменные
let termsData = [];
let allTerms = [];

// Функция экранирования HTML‑символов
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Функция декодирования HTML сущностей
function decodeHtml(encodedHtml) {
  if (typeof encodedHtml !== 'string') return encodedHtml;

  const parser = new DOMParser();
  const decoded = parser.parseFromString(`<div>${encodedHtml}</div>`, 'text/html');
  return decoded.body.innerHTML;
}

// Функция автоматического обнаружения файлов в папке data
async function discoverFilesInFolder(folderPath = 'data') {
  try {
    // Попытка получить список файлов через специальный endpoint
    const response = await fetch(`${folderPath}/list-files.json`);

    if (response.ok) {
      const fileList = await response.json();
      // Проверяем, что получили массив файлов
      if (Array.isArray(fileList)) {
        return fileList;
      } else if (fileList && Array.isArray(fileList.files)) {
        return fileList.files;
      } else {
        throw new Error('Неверный формат списка файлов');
      }
    } else {
      // Fallback: стандартный набор файлов, если endpoint недоступен
      console.warn('Не удалось получить список файлов, используем стандартный набор');
      return ['strong.json', 'div.json', 'p.json'];
    }
  } catch (error) {
    console.error('Ошибка при обнаружении файлов:', error);
    // Fallback на стандартный набор файлов
    return ['strong.json', 'div.json', 'p.json', 'a.json', 'img.json', 'button.json'];
  }
}

// Функция загрузки всех JSON файлов из папки data/cards с автоматическим обнаружением
async function loadTermsFromFolder() {
  const folderPath = 'data/cards';
  const termFiles = await discoverFilesInFolder(folderPath);
  const terms = [];
  const indicator = document.getElementById('terms-indicator');

  // Обновляем индикатор: начинаем загрузку
  indicator.textContent = 'Загрузка терминов...';

  let loadedFilesCount = 0;

  for (const fileName of termFiles) {
    try {
      const response = await fetch(`${folderPath}/${fileName}`);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки файла: ${fileName}`);
      }
      const termData = await response.json();

            // === КОД ДЛЯ ОТЛАДКИ ===
      console.log(`Загружен файл ${fileName}:`, termData);
      if (!Array.isArray(termData.categories)) {
        console.warn(`В файле ${fileName} поле "categories" отсутствует или не является массивом`);
      }
      // === КОНЕЦ ОТЛАДКИ ===

      // Экранируем специальные символы в данных
      termData.word = escapeHtml(termData.word);
      termData.definition = escapeHtml(termData.definition);
      termData.translation = escapeHtml(termData.translation);
      if (termData.fullDescription) {
        termData.fullDescription = escapeHtml(termData.fullDescription);
      }

      terms.push(termData);
      loadedFilesCount++;

      // Обновляем индикатор после каждой успешной загрузки
      indicator.textContent = `Загружено ${loadedFilesCount} из ${termFiles.length} файлов...`;
    } catch (error) {
      console.error(`Не удалось загрузить ${fileName}:`, error);
      // При ошибке продолжаем загрузку остальных файлов
    }
  }

  // Финальное обновление индикатора: показываем общее количество терминов
  indicator.textContent = `Всего загружено терминов: ${terms.length}`;

  return terms;
}


// Функция поиска терминов по запросу (с учётом регистра и части слова)
function searchTerms(query, caseSensitive = false) {
  if (!query.trim()) {
    return allTerms; // Возвращаем все термины, если строка пустая
  }

  const searchQuery = caseSensitive ? query.trim() : query.toLowerCase().trim();

  return allTerms.filter(term => {
    const word = caseSensitive ? term.word : term.word.toLowerCase();
    const definition = caseSensitive ? term.definition : term.definition.toLowerCase();
    const translation = caseSensitive ? term.translation : term.translation.toLowerCase();
    const categories = term.categories.map(cat =>
      caseSensitive ? cat : cat.toLowerCase()
    );

    return (
      word.includes(searchQuery) ||
      definition.includes(searchQuery) ||
      translation.includes(searchQuery) ||
      categories.some(cat => cat.includes(searchQuery))
    );
  });
}


// Функция подсветки совпадений в тексте
function highlightText(text, query, caseSensitive = false) {
  if (!query.trim()) return text;

  // Экранируем все специальные символы регулярного выражения
  const escapedQuery = query.replace(/[.*+?^${}()|[\\]/g, '\\$&');

  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(`(${escapedQuery})`, flags);

  return text.replace(regex, '<mark>$1</mark>');
}


// Обновлённая функция создания карточки с подсветкой и защитой от ошибок
function createTermCard(term, searchQuery = '', caseSensitive = false) {
  const card = document.createElement('div');
  card.className = 'term-card';

  // Безопасное получение слова (с экранированием)
  const word = term.word ? term.word.replace(/[<>]/g, '') : 'Неизвестно';
  card.dataset.term = word.toLowerCase();

  // Применяем подсветку к тексту, если есть запрос
  const highlightedWord = highlightText(word, searchQuery, caseSensitive);
  const definition = term.definition || 'Описание отсутствует';
  const highlightedDefinition = highlightText(definition, searchQuery, caseSensitive);
  const translation = term.translation || 'Перевод отсутствует';
  const highlightedTranslation = highlightText(translation, searchQuery, caseSensitive);

  // Безопасная обработка категорий: проверяем, что это массив
  let categoriesHtml = '';
  if (Array.isArray(term.categories)) {
    categoriesHtml = term.categories
      .map(cat => `<span class="category">${cat}</span>`)
      .join('');
  } else {
    // Если categories нет или не массив — показываем заглушку или пропускаем
    categoriesHtml = '<span class="category category-missing">Категории не указаны</span>';
  }

  // Безопасное получение ссылки (с fallback)
  const reference = term.reference || '#';
  const linkText = term.reference ? 'Справка на MDN' : 'Ссылка отсутствует';

  card.innerHTML = `
    <h3>${highlightedWord}</h3>
    <p class="definition">${highlightedDefinition}</p>
    <div class="term-info">
      ${categoriesHtml}
    </div>
    <p class="translation"><strong>Перевод:</strong> ${highlightedTranslation}</p>
    <a href="${reference}"
       class="doc-link" target="_blank">${linkText}</a>
  `;

  return card;
}



// Функция обновления отображения карточек с учётом поиска
function updateDisplayedTerms(searchQuery, caseSensitive = false) {
  const filteredTerms = searchTerms(searchQuery, caseSensitive);
  const container = document.getElementById('termsContainer');

  if (filteredTerms.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <h3>Ничего не найдено</h3>
        <p>Попробуйте другой запрос или очистите поиск.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = ''; // Очищаем контейнер

  filteredTerms.forEach(term => {
    const card = createTermCard(term, searchQuery, caseSensitive); // Передаём запрос и флаг учёта регистра
    container.appendChild(card);
  });

  // Переподключаем обработчики кликов для новых карточек
  addCardClickHandlers();
}

// Обработчики для поиска
function setupSearchHandlers() {
  const searchInput = document.getElementById('searchInput');
  const clearButton = document.getElementById('clearSearch');
  const caseSensitiveCheckbox = document.getElementById('caseSensitive');

  let searchTimeout;

  // Поиск при вводе (с задержкой для производительности)
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      updateDisplayedTerms(this.value, caseSensitiveCheckbox?.checked || false);
    }, 300); // Задержка 300 мс
  });

  // Очистка поиска
  clearButton.addEventListener('click', function() {
    searchInput.value = '';
    if (caseSensitiveCheckbox) caseSensitiveCheckbox.checked = false;
    updateDisplayedTerms('');
  });

  // Поиск по Enter
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      updateDisplayedTerms(this.value, caseSensitiveCheckbox?.checked || false);
    }
  });

  // Обработка изменения флага учёта регистра
  if (caseSensitiveCheckbox) {
    caseSensitiveCheckbox.addEventListener('change', function() {
      updateDisplayedTerms(searchInput.value, this.checked);
    });
  }
}


function addCardClickHandlers() {
  const cards = document.querySelectorAll('.term-card');
  const modal = document.getElementById('termModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const closeBtn = document.querySelector('.close');

  cards.forEach(card => {
    card.addEventListener('click', function() {
      const termKey = this.dataset.term;
      const term = termsData.find(t =>
        t.word.replace(/[<>]/g, '').toLowerCase() === termKey
      );

      if (term) {
        // Если fullDescription содержит ссылку на страницу, переходим на неё
        if (term.fullDescription && term.fullDescription.includes('.html')) {
          // Извлекаем путь из fullDescription (предполагаем, что это просто путь к файлу)
          const pagePath = term.fullDescription.trim();
          window.location.href = pagePath;
        } else {
          // Показываем модальное окно с сообщением
          showNoInfoModal(term);
        }
      }
    });
  });

  // Закрытие модального окна по крестику
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Закрытие при клике вне окна
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // --- ДОБАВЛЕННЫЙ КОД: закрытие по клавише Esc ---
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
    }
  });
  // --- КОНЕЦ ДОБАВЛЕННОГО КОДА ---
}


function showNoInfoModal(term) {
  const modal = document.getElementById('termModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');

  modalTitle.innerHTML = term.word;
  modalContent.innerHTML = `
            <div class="no-info-message">
              <p>На сайте нет расширенной информации по этому термину.</p>
              <p>Это базовый уровень. Чтобы углубить знания, изучите официальную документацию: </p>
              <div class="trusted-sources">
                <a href="${term.reference || 'https://developer.mozilla.org'}"
                   target="_blank"
                   class="mdn-link">
                  📘 Открыть на MDN
                </a>
                <a href="https://html.spec.whatwg.org/"
                   target="_blank"
                   class="spec-link">
                  📖 Спецификация HTML
                </a>
                <a href="https://www.w3schools.com/html/"
                   target="_blank"
                   class="w3-link">
                  📚 W3Schools
                </a>
              </div>
            </div>
  `;

  modal.style.display = 'block';
}


// Функция отображения ошибки
function showError(message) {
  const container = document.getElementById('termsContainer');
  container.innerHTML = `
    <div class="error-message">
      <h3>Ошибка загрузки</h3>
      <p>${message}</p>
      <button onclick="initApp()" class="retry-btn">Повторить загрузку</button>
    </div>
  `;
}



// Основная функция инициализации приложения
async function initApp() {
  try {
    // Показываем индикатор загрузки
    const container = document.getElementById('termsContainer');
    container.innerHTML = '<div class="loading">Загрузка карточек...</div>';

    // Загружаем данные терминов из папки data
    termsData = await loadTermsFromFolder();
    allTerms = [...termsData]; // Сохраняем все термины для поиска


    // Удаляем индикатор загрузки
    const loadingElement = container.querySelector('.loading');
    if (loadingElement) {
      loadingElement.remove();
    }

    // Отображаем все карточки изначально
    displayTerms(termsData);


    // Настраиваем обработчики поиска
    setupSearchHandlers();

    console.log('Словарь терминов успешно загружен:', termsData.length, 'карточек');
  } catch (error) {
    console.error('Ошибка при загрузке словаря:', error);
    showError('Не удалось загрузить словарь терминов. Проверьте подключение к сети и структуру папки data.');
  }
}


// Функция отображения всех карточек
function displayTerms(terms) {
  const container = document.getElementById('termsContainer');

  terms.forEach(term => {
    const card = createTermCard(term);
    container.appendChild(card);
  });

  // Добавляем обработчики кликов после создания карточек
  addCardClickHandlers();
}



// Запускаем приложение после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);
