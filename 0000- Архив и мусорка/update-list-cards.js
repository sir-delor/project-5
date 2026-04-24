async function checkFilesConsistency() {
    try {
        const folderPath = "data/cards";
        const existingFiles = await discoverFilesInFolder(folderPath);
        
        // Получаем текущий список
        const response = await fetch('data/list-files.json');
        if (!response.ok) {
            throw new Error('Не удалось загрузить list-files.json');
        }
        let fileList = await response.json();
        
        if (!Array.isArray(fileList)) {
            fileList = [];
        }

        // Находим недостающие файлы
        const missingFiles = existingFiles.filter(file => 
            !fileList.includes(file)
        );

        // Сортируем и объединяем
        missingFiles.sort();
        fileList = [...new Set([...fileList, ...missingFiles])];
        fileList.sort();

        // Сохраняем обновленный список
        const saveResponse = await fetch('data/list-files.json', {
            method: 'POST', // Используем POST вместо PUT
            headers: {
                'Content-Type': 'application/json',
                'X-HTTP-Method-Override': 'PUT' // Для совместимости
            },
            body: JSON.stringify(fileList)
        });

        if (saveResponse.ok) {
            console.log('Список успешно обновлен');
            alert('Проверка завершена успешно');
        } else {
            throw new Error(`Ошибка сохранения: ${saveResponse.statusText}`);
        }

    } catch (error) {
        console.error('Ошибка:', error.message);
        alert('Ошибка при сохранении списка:\n' + error.message);
    }
}

// Улучшенная функция получения файлов
async function discoverFilesInFolder(folderPath) {
    try {
        const response = await fetch(`${folderPath}/list-files.json`);
        if (response.ok) {
            const files = await response.json();
            return files.map(file => file.replace(/\.json$/, ''));
        }
        throw new Error('Не удалось получить список файлов');
    } catch (error) {
        console.error('Ошибка получения файлов:', error);
        return [];
    }
}

// Обработчик кнопки
document.addEventListener('DOMContentLoaded', () => {
    const checkButton = document.querySelector('button[data-action="check"]');
    
    if (checkButton) {
        checkButton.addEventListener('click', async () => {
            checkButton.disabled = true;
            checkButton.textContent = 'Проверка...';
            
            try {
                await checkFilesConsistency();
            } finally {
                checkButton.textContent = 'ПРОВЕРКА';
                checkButton.disabled = false;
            }
        });
    }
});

// Функция для проверки наличия файлов
async function checkFilesConsistency() {
    try {
        const folderPath = "data/cards/";
        const existingFiles = await discoverFilesInFolder(folderPath);
        
        // Получаем текущий список
        const response = await fetch('data/list-files.json');
        if (!response.ok) {
            throw new Error('Не удалось загрузить list-files.json');
        }
        let fileList = await response.json();
        
        if (!Array.isArray(fileList)) {
            fileList = [];
        }

        // Подсчет текущего количества карточек
        const currentCardCount = fileList.length;
        
        // Находим недостающие файлы
        const missingFiles = existingFiles.filter(file => 
            !fileList.includes(file)
        );
        
        const newFilesCount = missingFiles.length;
        
        // Сортируем и объединяем
        missingFiles.sort();
        fileList = [...new Set([...fileList, ...missingFiles])];
        fileList.sort();
        
        // Подсчет общего количества после добавления
        const totalCardCount = fileList.length;

        // Сохраняем обновленный список
        const saveResponse = await fetch('data/list-files.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-HTTP-Method-Override': 'PUT'
            },
            body: JSON.stringify(fileList)
        });

        if (saveResponse.ok) {
            // Формируем сообщение о результатах
            const statusMessage = `
                В библиотеке ${totalCardCount} карточек.<br>
                Найдено ${newFilesCount} новых карточек,<br>
                Добавлено ${newFilesCount} карточек.<br>
                Текущее количество словарных статей: ${totalCardCount} терминов
            `;
            
            showStatusMessage(statusMessage);
            console.log('Список успешно обновлен');
        } else {
            throw new Error(`Ошибка сохранения: ${saveResponse.statusText}`);
        }

    } catch (error) {
        console.error('Ошибка:', error.message);
        alert('Ошибка при сохранении списка:\n' + error.message);
    }
}

// Функция отображения статуса
function showStatusMessage(message) {
    const statusContainer = document.getElementById('status-container');
    
    if (!statusContainer) {
        // Создаем контейнер, если его нет
        const container = document.createElement('div');
        container.id = 'status-container';
        container.classList.add('status-message');
        document.body.appendChild(container);
    }
    
    document.getElementById('status-container').innerHTML = `
        <div class="status-box">
            <h3>Статус проверки</h3>
            <p>${message}</p>
            <button onclick="hideStatus()">Закрыть</button>
        </div>
    `;
}

// Функция скрытия статуса
function hideStatus() {
    document.getElementById('status-container').remove();
}
