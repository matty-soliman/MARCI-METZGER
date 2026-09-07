document.addEventListener('DOMContentLoaded', function () {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navigation = document.querySelector('nav');

  if (!mobileToggle || !navLinks || !navigation) return;

  let lastScrollY = window.scrollY;

  mobileToggle.addEventListener('click', function () {
    navLinks.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('active');
    });
  });

  window.addEventListener('scroll', function () {
    const currentScrollY = window.scrollY;

    if (currentScrollY <= 8 || currentScrollY < lastScrollY) {
      navigation.classList.remove('nav-hidden');
    } else if (currentScrollY > lastScrollY) {
      navigation.classList.add('nav-hidden');
      navLinks.classList.remove('active');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
});
