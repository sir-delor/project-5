document.addEventListener('DOMContentLoaded', function() {
  // Загрузка заголовка
  fetch('includes/header.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Ошибка загрузки header.html: ${response.status} ${response.statusText}`);
      }
      return response.text();
    })
    .then(html => {
      const headerElement = document.getElementById('header');
      if (headerElement) {
        headerElement.innerHTML = html;
      } else {
        console.error('Элемент #header не найден в DOM');
      }
    })
    .catch(error => {
      console.error('Ошибка при загрузке заголовка:', error);
    });

  // Загрузка подвала
  fetch('includes/footer.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Ошибка загрузки footer.html: ${response.status} ${response.statusText}`);
      }
      return response.text();
    })
    .then(html => {
      const footerElement = document.getElementById('footer');
      if (footerElement) {
        footerElement.innerHTML = html;
      } else {
        console.error('Элемент #footer не найден в DOM');
      }
    })
    .catch(error => {
      console.error('Ошибка при загрузке подвала:', error);
    });
});
