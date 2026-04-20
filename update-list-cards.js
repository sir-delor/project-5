let currentFileList = [],
  newFiles = [],
  CACHE_KEY = "termCatalogLastCheck"
function cacheLastCheck(t) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ timestamp: new Date().toISOString(), data: t })
  )
}
function getCachedCheck() {
  var t = localStorage.getItem(CACHE_KEY)
  return t ? JSON.parse(t) : null
}
function logAction(t, e = "") {
  console.log(`[${new Date().toLocaleTimeString()}] ${t}: ` + e)
}
async function getCardFiles() {
  try {
    var t = await fetch("data/cards/list-files.json", {
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    })
    if (t.ok) return await t.json()
    throw new Error("Не удалось получить список файлов")
  } catch (t) {
    throw (logAction("Ошибка", "Загрузка списка файлов: " + t.message), t)
  }
}
async function loadCurrentList() {
  return getCardFiles()
}
async function saveUpdatedList(t) {
  try {
    var e = await fetch("data/cards/list-files.json", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(t, null, 2),
    })
    if (e.ok)
      return logAction("Сохранение", `Список сохранён: ${t.length} файлов`), !0
    throw new Error(`HTTP ${e.status}: Не удалось сохранить список`)
  } catch (t) {
    throw (logAction("Ошибка", "Сохранение списка: " + t.message), t)
  }
}
async function updateFileListOnServer() {
  try {
    var t,
      e = await fetch("update-file-list.php", { method: "GET" })
    if (e.ok)
      return (
        logAction(
          "Обновление",
          `Список файлов обновлён: ${(t = await e.json()).count} файлов`
        ),
        t
      )
    throw new Error(`HTTP ${e.status}: ` + e.statusText)
  } catch (t) {
    throw (logAction("Ошибка", "Обновление file-list.json: " + t.message), t)
  }
}
function displayFileList(t) {
  var e = document.getElementById("listPreview")
  e &&
    ((e.textContent = JSON.stringify(t, null, 2)),
    document.getElementById("fileList").classList.remove("hidden"))
}
function displayNewFiles(t) {
  var e = document.getElementById("newFiles"),
    n = document.getElementById("newFilesPreview")
  e &&
    n &&
    (0 === t.length
      ? e.classList.add("hidden")
      : ((n.textContent = JSON.stringify(t, null, 2)),
        e.classList.remove("hidden")))
}
function updateStatus(t, e = "") {
  var n = document.getElementById("status")
  n
    ? ((n.textContent = t), (n.className = "status " + e))
    : console.error("Элемент #status не найден")
}
function updateCardCount(t) {
  var e = document.getElementById("cardCount")
  e && (e.textContent = `В библиотеке: ${t} карточек`)
}
function findNewFiles(t, e) {
  console.log("Актуальные файлы на сервере:", t),
    console.log("Текущий список в библиотеке:", e)
  t = t.filter((t) => !e.includes(t))
  return console.log("Найденные новые файлы:", t), t
}
async function checkUpdates() {
  document.getElementById("status")
  var t = document.getElementById("updateBtn"),
    e = document.getElementById("downloadBtn")
  updateStatus("Проверяем обновления каталога...", "loading"),
    logAction("Действие", "Запуск проверки обновлений")
  try {
    var n = await getCardFiles(),
      a = await loadCurrentList()
    0 < (newFiles = findNewFiles(n, a)).length
      ? (updateStatus(`Найдено ${newFiles.length} новых терминов`, "success"),
        displayNewFiles(newFiles),
        (t.disabled = !1),
        (e.disabled = !0))
      : (updateStatus("Библиотека актуальна", "success"),
        (t.disabled = !0),
        (e.disabled = !1)),
      displayFileList(a),
      updateCardCount(a.length),
      cacheLastCheck({ currentList: a })
  } catch (t) {
    updateStatus("Ошибка при проверке обновлений. Попробуйте позже.", "error"),
      console.error("Ошибка:", t)
  }
}
async function updateLibrary() {
  document.getElementById("status")
  var e = document.getElementById("updateBtn"),
    t = document.getElementById("downloadBtn")
  updateStatus("Обновляем библиотеку...", "loading"), (e.disabled = !0)
  try {
    var n = [...currentFileList, ...newFiles].sort()
    await saveUpdatedList(n),
      updateStatus(`Добавлено ${newFiles.length} терминов`, "success"),
      displayFileList((currentFileList = n)),
      (newFiles = []),
      displayNewFiles([]),
      updateCardCount(n.length),
      (t.disabled = !1),
      cacheLastCheck({ currentList: n })
    try {
      await updateFileListOnServer(),
        updateStatus(
          `Добавлено ${n.length} терминов. Список файлов обновлён.`,
          "success"
        )
    } catch (t) {
      console.warn("Не удалось обновить file-list.json:", t.message),
        updateStatus(
          `Добавлено ${n.length} терминов, но список файлов не обновился. Проверьте настройки сервера.`,
          "warning"
        )
    }
  } catch (t) {
    updateStatus("Ошибка обновления библиотеки. Попробуйте снова.", "error"),
      console.error("Ошибка обновления:", t),
      (e.disabled = !1)
  }
}
function downloadFileList() {
  let t = currentFileList
  0 < newFiles.length &&
    !1 === document.getElementById("updateBtn").disabled &&
    (t = [...currentFileList])
  var e = JSON.stringify(t, null, 2),
    e = new Blob([e], { type: "application/json" }),
    e = URL.createObjectURL(e),
    n = document.createElement("a")
  ;(n.href = e),
    (n.download = "list-files-updated.json"),
    document.body.appendChild(n),
    n.click(),
    document.body.removeChild(n),
    URL.revokeObjectURL(e),
    updateStatus("Список скачан", "success"),
    logAction(
      "Скачивание",
      "Список файлов сохранён как list-files-updated.json"
    )
}
// Функция инициализации приложения
function initApp() {
    // Получаем элементы DOM
    const statusDiv = document.getElementById('status');
    const updateBtn = document.getElementById('updateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const cardCount = document.getElementById('cardCount');
    const checkBtn = document.getElementById('checkBtn');

    // Проверяем, что все критические элементы найдены
    if (!statusDiv || !updateBtn || !downloadBtn || !cardCount || !checkBtn) {
        console.error('Критические элементы не найдены в DOM:', {
            statusDiv: !!statusDiv,
            updateBtn: !!updateBtn,
            downloadBtn: !!downloadBtn,
            cardCount: !!cardCount,
            checkBtn: !!checkBtn
        });
        return;
    }

    // Инициализируем состояние
    newFiles = [];
    updateBtn.disabled = true;
    downloadBtn.disabled = true;

    // Пытаемся загрузить кэшированные данные
    const cachedData = getCachedCheck();

    if (cachedData) {
        // Если кэш есть — отображаем сохранённые данные
        updateStatus('Последняя проверка: ' + cachedData.timestamp, 'success');
        currentFileList = cachedData.data.currentList;
        displayFileList(currentFileList);
        updateCardCount(currentFileList.length);
    } else {
        // Если кэша нет — показываем инструкцию
        cardCount.textContent = 'В библиотеке: данные загружаются...';
        updateStatus('Нажмите кнопку «Проверить обновления».', 'success');
    }

    // Добавляем обработчики событий
    checkBtn.addEventListener('click', checkUpdates);
    updateBtn.addEventListener('click', updateLibrary);
    downloadBtn.addEventListener('click', downloadFileList);
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);
