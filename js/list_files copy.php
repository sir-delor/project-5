// Запуск с комендной строки 
//http://dict-v5.local/js/list_files.php
<?php
// Включение отображения ошибок (для отладки)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Определяем пути относительно расположения скрипта
$script_dir = __DIR__; // папка js/
$cards_dir = realpath($script_dir . '/../data/cards'); // папка data/cards


// Проверяем существование папки
if (!$cards_dir || !is_dir($cards_dir)) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Папка data/cards не найдена или недоступна',
        'requested_path' => $cards_dir
    ]);
    exit;
}

// Получаем список файлов (исключаем . и ..)
$files = array_diff(scandir($cards_dir), ['.', '..']);

// Фильтруем только файлы (без подпапок)
$only_files = array_filter($files, function($file) use ($cards_dir) {
    return is_file($cards_dir . '/' . $file);
});

// Сортируем в алфавитном порядке
sort($only_files, SORT_STRING | SORT_FLAG_CASE);

// Формируем JSON-структуру
$result = [
    'directory' => 'data/cards',
    'total_files' => count($only_files),
    'files' => $only_files
];

// Устанавливаем заголовок Content-Type
header('Content-Type: application/json');

// Выводим JSON (с форматированием для читаемости)
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
