document.addEventListener('DOMContentLoaded', function () {
  const galleryCards = document.querySelectorAll('.gallery-card');

  if (!galleryCards.length) return;

  const modal = document.createElement('div');
  modal.className = 'gallery-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Property image preview');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="gallery-modal-panel">
      <button class="gallery-modal-close" type="button" aria-label="Close image preview">×</button>
      <img class="gallery-modal-image" src="" alt="">
    </div>
  `;

  const modalImage = modal.querySelector('.gallery-modal-image');
  const modalClose = modal.querySelector('.gallery-modal-close');

  document.body.appendChild(modal);

  let lastActiveTrigger = null;

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('gallery-modal-open');
    if (lastActiveTrigger) {
      lastActiveTrigger.focus();
    }
  }

  function openModal(card) {
    const image = card.querySelector('img');
    if (!image) return;

    lastActiveTrigger = card;

    galleryCards.forEach(function (item) {
      item.classList.remove('is-opening');
    });

    card.classList.add('is-opening');
    setTimeout(function () {
      card.classList.remove('is-opening');
    }, 600);

    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('gallery-modal-open');
    modalClose.focus();
  }

  galleryCards.forEach(function (card) {
    card.addEventListener('click', function () {
      const isAlreadyActive = card.classList.contains('is-active');

      if (!isAlreadyActive) {
        galleryCards.forEach(function (item) {
          item.classList.remove('is-active');
          item.setAttribute('aria-expanded', 'false');
        });

        card.classList.add('is-active');
        card.setAttribute('aria-expanded', 'true');
      } else {
        openModal(card);
      }
    });

    card.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && card.classList.contains('is-active')) {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  modalClose.addEventListener('click', closeModal);

  modal.addEventListener('click', function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Focus trap inside modal
  modal.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      modalClose.focus();
    }
  });
});
