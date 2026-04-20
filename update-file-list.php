php
header('Content-Type applicationjson');

$directory = 'datacards';
$outputFile = 'datacardsfile-list.json';

 Получаем все .json файлы из папки
$files = [];
if (is_dir($directory)) {
    $fileList = scandir($directory);
    foreach ($fileList as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'json' &&
            $file !== 'file-list.json' &&   Исключаем сам файл списка
            $file !== '.' && $file !== '..') {
            $files[] = $file;
        }
    }
}

 Сортируем файлы в алфавитном порядке
sort($files);

 Сохраняем в JSON
$jsonData = json_encode($files, JSON_PRETTY_PRINT);
if (file_put_contents($outputFile, $jsonData) !== false) {
    echo json_encode([
        'success' = true,
        'message' = 'Список файлов успешно обновлён',
        'count' = count($files),
        'files' = $files
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' = false,
        'error' = 'Не удалось записать файл'
    ]);
}

