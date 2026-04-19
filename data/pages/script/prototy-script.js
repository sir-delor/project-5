// 1. Переключение темы
const themeToggle = document.getElementById('theme-toggle');
const pageBody = document.getElementById('page-body');

themeToggle.addEventListener('click', () => {
  if (pageBody.classList.contains('light-theme')) {
    pageBody.classList.remove('light-theme');
    pageBody.classList.add('dark-theme');
    // Сохраняем выбор пользователя
    localStorage.setItem('theme', 'dark-theme');
  } else {
    pageBody.classList.remove('dark-theme');
    pageBody.classList.add('light-theme');
    localStorage.setItem('theme', 'light-theme');
  }
});

// Загрузка темы при открытии страницы
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    pageBody.className = savedTheme;
  }
});

// 2. Адаптивное меню (для мобильных)
const mainNav = document.getElementById('main-nav');


// Добавляем кнопку-переключатель меню для мобильных
const menuToggle = document.createElement('button');
menuToggle.className = 'menu-toggle';
menuToggle.innerHTML = '☰'; // Иконка меню
menuToggle.setAttribute('aria-label', 'Открыть меню');
menuToggle.style.marginLeft = 'auto';

// Вставляем кнопку в шапку
document.querySelector('.header').appendChild(menuToggle);

menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});

// Закрываем меню при клике на ссылку
mainNav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      mainNav.classList.remove('open');
    }
  });
});

// 3. Дополнительные эффекты наведения (опционально)
const cards = document.querySelectorAll('.card');


cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-4px)';
    card.style.boxShadow = '0 12px 32px rgba(13, 110, 253, 0.2)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
  });
});
