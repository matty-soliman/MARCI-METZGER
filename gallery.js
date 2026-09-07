document.addEventListener('DOMContentLoaded', function () {
  const galleryCards = document.querySelectorAll('.gallery-card');

  if (!galleryCards.length) return;

  galleryCards.forEach(function (card) {
    card.addEventListener('click', function () {
      galleryCards.forEach(function (item) {
        item.classList.remove('is-active');
        item.setAttribute('aria-expanded', 'false');
      });

      card.classList.add('is-active');
      card.setAttribute('aria-expanded', 'true');
    });
  });
});
