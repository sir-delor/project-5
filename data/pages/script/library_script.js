// Функция для загрузки внешнего HTML‑файла
async function loadHTML(file, elementId) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`Ошибка загрузки ${file}: ${response.status}`);
    }
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    document.getElementById(elementId).innerHTML = `<p>Ошибка загрузки ${file}</p>`;
  }
}

// Загружаем шапку и подвал при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {

loadHTML('/library/library_header.html', 'header-container');
loadHTML('/library/library_footer.html', 'footer-container');

  // Обновляем текущую дату и время (только на главной странице)
  const currentTimeElement = document.getElementById('current-time');
  if (currentTimeElement) {
    setInterval(() => {
      currentTimeElement.textContent = new Date().toLocaleString('ru-RU');
    }, 1000);
  }
});

// Плавная прокрутка для навигации
document.addEventListener('click', function(e) {
  if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    document.getElementById(targetId).scrollIntoView({
      behavior: 'smooth'
    });
  }
});
