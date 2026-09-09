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

  // Handle interactive property search, filtering, and sorting
  const searchForm = document.querySelector(".editorial-search");
  const portfolioGrid = document.getElementById("portfolio-grid");
  const emptyState = document.getElementById("search-empty-state");
  const resetBtn = document.getElementById("reset-search-btn");

  if (searchForm && portfolioGrid) {
    const initialCards = Array.from(portfolioGrid.querySelectorAll(".card"));

    function parseNumericInput(val) {
      if (!val) return null;
      const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
      return isNaN(num) ? null : num;
    }

    function parseMinCount(val) {
      if (!val || val.toLowerCase().includes("any")) return 0;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    }

    function filterAndSortProperties() {
      const locationVal = (document.getElementById("location")?.value || "")
        .toLowerCase()
        .trim();
      const typeVal = (document.getElementById("type")?.value || "")
        .toLowerCase()
        .trim();
      const sortVal = document.getElementById("sort")?.value || "";
      const bedsMin = parseMinCount(document.getElementById("bedrooms")?.value);
      const bathsMin = parseMinCount(document.getElementById("baths")?.value);
      const minPrice =
        parseNumericInput(document.getElementById("min-price")?.value) ?? 0;
      const maxPrice =
        parseNumericInput(document.getElementById("max-price")?.value) ??
        Infinity;

      const matchedCards = [];

      initialCards.forEach(function (card) {
        const cardLocation = (
          card.getAttribute("data-location") || ""
        ).toLowerCase();
        const cardType = (card.getAttribute("data-type") || "").toLowerCase();
        const cardPrice = parseFloat(card.getAttribute("data-price")) || 0;
        const cardBeds = parseFloat(card.getAttribute("data-beds")) || 0;
        const cardBaths = parseFloat(card.getAttribute("data-baths")) || 0;

        const matchesLocation =
          !locationVal ||
          locationVal === "any" ||
          cardLocation.includes(locationVal);

        const matchesType =
          !typeVal || typeVal === "any" || cardType === typeVal;

        const matchesBeds = cardBeds >= bedsMin;
        const matchesBaths = cardBaths >= bathsMin;
        const matchesPrice = cardPrice >= minPrice && cardPrice <= maxPrice;

        if (
          matchesLocation &&
          matchesType &&
          matchesBeds &&
          matchesBaths &&
          matchesPrice
        ) {
          matchedCards.push(card);
        }
      });

      if (sortVal.includes("Least Expensive")) {
        matchedCards.sort(function (a, b) {
          return (
            (parseFloat(a.getAttribute("data-price")) || 0) -
            (parseFloat(b.getAttribute("data-price")) || 0)
          );
        });
      } else if (sortVal.includes("Most Expensive")) {
        matchedCards.sort(function (a, b) {
          return (
            (parseFloat(b.getAttribute("data-price")) || 0) -
            (parseFloat(a.getAttribute("data-price")) || 0)
          );
        });
      } else if (sortVal.includes("Bedrooms (Low to High)")) {
        matchedCards.sort(function (a, b) {
          return (
            (parseFloat(a.getAttribute("data-beds")) || 0) -
            (parseFloat(b.getAttribute("data-beds")) || 0)
          );
        });
      } else if (sortVal.includes("Bedrooms (High to Low)")) {
        matchedCards.sort(function (a, b) {
          return (
            (parseFloat(b.getAttribute("data-beds")) || 0) -
            (parseFloat(a.getAttribute("data-beds")) || 0)
          );
        });
      } else if (sortVal.includes("Bathrooms (Low to High)")) {
        matchedCards.sort(function (a, b) {
          return (
            (parseFloat(a.getAttribute("data-baths")) || 0) -
            (parseFloat(b.getAttribute("data-baths")) || 0)
          );
        });
      } else if (sortVal.includes("Bathrooms (High to Low)")) {
        matchedCards.sort(function (a, b) {
          return (
            (parseFloat(b.getAttribute("data-baths")) || 0) -
            (parseFloat(a.getAttribute("data-baths")) || 0)
          );
        });
      }

      initialCards.forEach(function (card) {
        card.classList.add("is-hidden");
        card.classList.remove("is-fade-in");
      });

      if (matchedCards.length === 0) {
        if (emptyState) emptyState.style.display = "block";
      } else {
        if (emptyState) emptyState.style.display = "none";
        matchedCards.forEach(function (card) {
          card.classList.remove("is-hidden");
          card.classList.add("is-fade-in");
          if (emptyState) {
            portfolioGrid.insertBefore(card, emptyState);
          } else {
            portfolioGrid.appendChild(card);
          }
        });
      }

      portfolioGrid.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function resetFilters() {
      searchForm.reset();
      if (emptyState) emptyState.style.display = "none";
      initialCards.forEach(function (card) {
        card.classList.remove("is-hidden");
        card.classList.remove("is-fade-in");
        if (emptyState) {
          portfolioGrid.insertBefore(card, emptyState);
        } else {
          portfolioGrid.appendChild(card);
        }
      });
      portfolioGrid.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      filterAndSortProperties();
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", resetFilters);
    }
  }
});
