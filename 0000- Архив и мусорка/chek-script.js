// Функция для получения списка файлов в папке
async function getFilesList(folderPath) {
    try {
        const response = await fetch(folderPath);
        
        if (!response.ok) {
            throw new Error('Не удалось получить список файлов');
        }
        
        let files = await response.json();
        
        // Проверяем, что получили массив
        if (!Array.isArray(files)) {
            files = [];
        }
        
        // Фильтруем только файлы с расширением .json
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        return jsonFiles;
    } catch (error) {
        console.error('Ошибка при получении списка файлов:', error);
        return [];
    }
}

// Функция для сохранения списка файлов в JSON
async function saveFilesList(files, savePath) {
    try {
        const response = await fetch(savePath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(files)
        });

        if (!response.ok) {
            throw new Error('Ошибка сохранения списка файлов');
        }

        console.log('Список файлов успешно сохранен');
    } catch (error) {
        console.error('Ошибка при сохранении списка файлов:', error);
    }
}

// Основная функция проверки и сохранения
async function checkAndSaveFiles() {
    const folderPath = 'data/cards'; // Путь к папке с файлами
    const savePath = 'data/list-files.json'; // Путь для сохранения JSON

    try {
        // Получаем список файлов
        let files = await getFilesList(folderPath);
        
        // Проверяем, что получили массив
        if (!Array.isArray(files)) {
            files = [];
        }

        // Сортируем файлы по алфавиту
        files.sort();

        // Сохраняем список в JSON
        await saveFilesList(files, savePath);

        // Проверяем наличие length перед использованием
        const fileCount = files?.length || 0;
        console.log(`Найдено ${fileCount} файлов`);
    } catch (error) {
        console.error('Произошла ошибка:', error);
    }
}

// Создание интерфейса
document.addEventListener('DOMContentLoaded', () => {
    // Создаем контейнер для статуса
    const statusContainer = document.createElement('div');
    statusContainer.id = 'status-container';
    statusContainer.classList.add('status-message');
    document.body.appendChild(statusContainer);

    // Создаем кнопку проверки
    const button = document.createElement('button');
    button.textContent = 'Проверить файлы';
    button.style.margin = '20px';
    document.body.appendChild(button);

    // Обработчик кнопки
    button.addEventListener('click', async () => {
        button.disabled = true;
        button.textContent = 'Проверка...';

        try {
            const files = await checkAndSaveFiles();
            
            // Проверяем наличие данных перед использованием length
            const fileCount = files?.length || 0;
            
            // Показываем результат
            const message = `
                <h3>Проверка завершена</h3>
                <p>Найдено файлов: ${fileCount}</p>
                <p>Список сохранен в data/list-files.json</p>
                <button onclick="hideStatus()">Закрыть</button>
            `;
            
            statusContainer.innerHTML = message;
        } catch (error) {
            statusContainer.innerHTML = `
                <h3>Ошибка</h3>
                <p>${error.message}</p>
                <button onclick="hideStatus()">Закрыть</button>
            `;
        } finally {
            button.textContent = 'Проверить файлы';
            button.disabled = false;
        }
    });

    // Функция скрытия статуса
    function hideStatus() {
        statusContainer.innerHTML = '';
    }
});



// Стили для отображения
document.head.innerHTML += `
<style>
.status-message {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #f9f9f9;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.status-message button {
    margin-top: 10px;
    padding: 10px 15px;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
}
</style>
`;
