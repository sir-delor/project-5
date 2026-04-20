let currentFileList = [];
let newFiles = [];

// Локальное кэширование последней проверки
const CACHE_KEY = 'termCatalogLastCheck';

function cacheLastCheck(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: new Date().toISOString(),
        data: data
    }));
}

function getCachedCheck() {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
}

// Логирование действий
function logAction(action, details = '') {
    console.log(`[${new Date().toLocaleTimeString()}] ${action}: ${details}`);
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Получаем элементы только после загрузки DOM
    const statusDiv = document.getElementById('status');
    const updateBtn = document.getElementById('updateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const cardCount = document.getElementById('cardCount');

    if (!statusDiv || !cardCount) {
        console.error('Критические элементы не найдены в DOM');
        return;
    }

    // Сбрасываем состояние при загрузке страницы
    newFiles = [];
    updateBtn.disabled = true;
    downloadBtn.disabled = false;

    // Проверяем кэш при загрузке
    const cached = getCachedCheck();
    if (cached) {
        updateStatus(`Последняя проверка: ${cached.timestamp}`, 'success');
        currentFileList = cached.data.currentList;
        displayFileList(currentFileList);
        updateCardCount(currentFileList.length);
    } else {
        cardCount.textContent = 'В библиотеке: данные загружаются...';
        updateStatus('Нажмите кнопку «Проверить обновления».', 'success');
    }

    // Устанавливаем обработчики событий
    document.getElementById('checkBtn').addEventListener('click', checkUpdates);
    document.getElementById('updateBtn').addEventListener('click', updateLibrary);
    document.getElementById('downloadBtn').addEventListener('click', downloadFileList);
}

// Обновление количества карточек
function updateCardCount(count) {
    const cardCount = document.getElementById('cardCount');
    if (cardCount) {
        cardCount.textContent = `В библиотеке: ${count} карточек`;
    }
}

// Получение списка файлов из папки data/cards
async function getCardFiles() {
    try {
        const response = await fetch('data/cards/list-files.json', { // ИЗМЕНЕНО: используем единый файл
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
        if (!response.ok) throw new Error('Не удалось получить список файлов');

        const cardFiles = await response.json();
        return cardFiles;
    } catch (error) {
        logAction('Ошибка', 'Загрузка списка файлов: ' + error.message);
        throw error;
    }
}

// Загрузка текущего списка из list-files.json
async function loadCurrentList() {
    return getCardFiles(); // ИЗМЕНЕНО: теперь используем одну функцию для обоих случаев
}

// Сравнение списков и поиск новых файлов
function findNewFiles(cardFiles, currentList) {
    console.log('Актуальные файлы на сервере:', cardFiles);
    console.log('Текущий список в библиотеке:', currentList);

    const newFiles = cardFiles.filter(file => !currentList.includes(file));
    console.log('Найденные новые файлы:', newFiles);
    return newFiles;
}

// Функция сохранения обновлённого списка в list-files.json
async function saveUpdatedList(updatedList) {
    try {
        const response = await fetch('data/cards/list-files.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(updatedList, null, 2)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Не удалось сохранить список`);
        }

        logAction('Сохранение', `Список сохранён: ${updatedList.length} файлов`);
        return true;
    } catch (error) {
        logAction('Ошибка', 'Сохранение списка: ' + error.message);
        throw error;
    }
}




// Функция для обновления file-list.json на сервере
async function updateFileListOnServer() {
    try {
        const response = await fetch('update-file-list.php', {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        logAction('Обновление', `Список файлов обновлён: ${result.count} файлов`);
        return result;
    } catch (error) {
        logAction('Ошибка', 'Обновление file-list.json: ' + error.message);
        throw error;
    }
}

// Отображение списка файлов
function displayFileList(fileList) {
    const listPreview = document.getElementById('listPreview');
    if (listPreview) {
        listPreview.textContent = JSON.stringify(fileList, null, 2);
        document.getElementById('fileList').classList.remove('hidden');
    }
}

// Отображение новых файлов
function displayNewFiles(files) {
    const newFilesDiv = document.getElementById('newFiles');
    const newFilesPreview = document.getElementById('newFilesPreview');

    if (!newFilesDiv || !newFilesPreview) return;

    if (files.length === 0) {
        newFilesDiv.classList.add('hidden');
        return;
    }
    newFilesPreview.textContent = JSON.stringify(files, null, 2);
    newFilesDiv.classList.remove('hidden');
}

// Обновление статуса
function updateStatus(message, statusClass = '') {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) {
        console.error('Элемент #status не найден');
        return;
    }
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + statusClass;
}

// Проверка обновлений
async function checkUpdates() {
    const statusDiv = document.getElementById('status');
    const updateBtn = document.getElementById('updateBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    updateStatus('Проверяем обновления каталога...', 'loading');
    logAction('Действие', 'Запуск проверки обновлений');

    try {
        const cardFiles = await getCardFiles();
        const currentList = await loadCurrentList();

        newFiles = findNewFiles(cardFiles, currentList);

        if (newFiles.length > 0) {
            updateStatus(`Найдено ${newFiles.length} новых терминов`, 'success');
            displayNewFiles(newFiles);
            updateBtn.disabled = false;
            downloadBtn.disabled = true;
        } else {
            updateStatus('Библиотека актуальна', 'success');
            updateBtn.disabled = true;
            downloadBtn.disabled = false;
        }

        displayFileList(currentList);
        updateCardCount(currentList.length);
        cacheLastCheck({ currentList: currentList });
    } catch (error) {
        updateStatus('Ошибка при проверке обновлений. Попробуйте позже.', 'error');
        console.error('Ошибка:', error);
    }
}
// Обновление библиотеки
async function updateLibrary() {
    const statusDiv = document.getElementById('status');
    const updateBtn = document.getElementById('updateBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    updateStatus('Обновляем библиотеку...', 'loading');
    updateBtn.disabled = true;

    try {
        // Объединяем и сортируем в алфавитном порядке
        const updatedList = [...currentFileList, ...newFiles].sort();

        await saveUpdatedList(updatedList);
        updateStatus(`Добавлено ${newFiles.length} терминов`, 'success');

        currentFileList = updatedList;
        displayFileList(updatedList);

        // Сбрасываем список новых файлов после успешного обновления
        newFiles = [];
        displayNewFiles([]);

        updateCardCount(updatedList.length);
        downloadBtn.disabled = false;

        // Обновляем кэш с актуальными данными
        cacheLastCheck({ currentList: updatedList });

        // ИЗМЕНЕНО: добавляем вызов обновления file-list.json
        try {
            await updateFileListOnServer();
            updateStatus(
                `Добавлено ${updatedList.length} терминов. Список файлов обновлён.`,
                'success'
            );
        } catch (updateError) {
            console.warn('Не удалось обновить file-list.json:', updateError.message);
            // Не блокируем основной процесс, если обновление списка файлов не удалось
            updateStatus(
                `Добавлено ${updatedList.length} терминов, но список файлов не обновился. Проверьте настройки сервера.`,
                'warning'
            );
        }
    } catch (error) {
        updateStatus('Ошибка обновления библиотеки. Попробуйте снова.', 'error');
        console.error('Ошибка обновления:', error);
        updateBtn.disabled = false;
    }
}
