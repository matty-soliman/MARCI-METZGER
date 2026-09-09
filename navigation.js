/**
 * navigation.js
 * Header navigation, mobile menu drawer toggle, and hide-on-scroll behavior.
 */

document.addEventListener("DOMContentLoaded", function () {
  const mobileToggle = document.querySelector(".mobile-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navigation = document.querySelector("nav");

  if (!mobileToggle || !navLinks || !navigation) return;

  let lastScrollY = window.scrollY;

  function closeMenu() {
    navLinks.classList.remove("active");
    mobileToggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    navLinks.classList.add("active");
    mobileToggle.setAttribute("aria-expanded", "true");
  }

  mobileToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      closeMenu();
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (e) {
    if (
      navLinks.classList.contains("active") &&
      !navigation.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Close menu with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navLinks.classList.contains("active")) {
      closeMenu();
      mobileToggle.focus();
    }
  });

  // Scroll handler: do not hide navbar if mobile menu is open
  window.addEventListener(
    "scroll",
    function () {
      const currentScrollY = window.scrollY;

      if (navLinks.classList.contains("active")) {
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY <= 8 || currentScrollY < lastScrollY) {
        navigation.classList.remove("nav-hidden");
      } else if (currentScrollY > lastScrollY) {
        navigation.classList.add("nav-hidden");
      }

      lastScrollY = currentScrollY;
    },
    { passive: true },
  );
});
