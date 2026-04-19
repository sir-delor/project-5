//  Плавная прокрутка наверх
const scrollTopBtn = document.getElementById('scrollTopBtn');

// Показываем/скрываем кнопку
window.addEventListener('scroll', function() {
  scrollTopBtn.style.display = window.pageYOffset > 300 ? 'block' : 'none';
});

// Плавная прокрутка наверх
scrollTopBtn.addEventListener('click', function() {
  const startPosition = window.pageYOffset;
  const distance = startPosition;
  const duration = 500; // длительность анимации в мс
  let startTime = null;

  function scrollStep(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const percentage = Math.min(progress / duration, 1);

    // Формула плавности (ease-in-out)
    const ease = 0.5 - Math.cos(percentage * Math.PI) / 2;

    window.scrollTo(0, startPosition - distance * ease);

    if (progress < duration) {
      window.requestAnimationFrame(scrollStep);
    }
  }

  window.requestAnimationFrame(scrollStep);
});
