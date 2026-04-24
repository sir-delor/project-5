<?php
// Включение отображения ошибок (для отладки)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Определяем пути относительно расположения скрипта
$script_dir = __DIR__; // папка js/
$cards_dir = realpath($script_dir . '/../data/cards'); // папка data/cards
$output_file = $script_dir . '/files_list.json'; // куда сохраняем JSON

// Проверяем существование папки для сканирования
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

// Формируем JSON‑структуру для текущей записи
$current_entry = [
    'scan_time' => date('Y-m-d H:i:s'),
    'directory' => 'data/cards',
    'total_files' => count($only_files),
    'files' => $only_files
];

// Читаем существующий JSON‑файл, если он есть
$existing_data = [];
if (file_exists($output_file)) {
    $file_content = file_get_contents($output_file);
    if (!empty($file_content)) {
        $existing_data = json_decode($file_content, true);
        // Проверяем, что декодирование прошло успешно
        if (json_last_error() !== JSON_ERROR_NONE) {
            $existing_data = []; // сбрасываем, если ошибка JSON
        }
    }
}

// Добавляем новую запись в массив существующих данных
$existing_data[] = $current_entry;

// Сохраняем объединённые данные в файл (дописываем)
$json_content = json_encode($existing_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
$save_success = file_put_contents($output_file, $json_content);

if ($save_success !== false) {
    echo "Данные успешно добавлены в: $output_file\n";
    echo "Всего записей в файле: " . count($existing_data) . "\n";
    echo "Количество файлов в последнем сканировании: " . count($only_files) . "\n";
} else {
    http_response_code(500);
    echo "Ошибка: не удалось сохранить файл $output_file\n";
    exit;
}

// Выводим текущий результат в браузер (опционально)
header('Content-Type: application/json');
echo $json_content;
?>
