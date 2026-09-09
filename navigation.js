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

  // Handle interactive property search, filtering, sorting, and details modal
  const searchForm = document.querySelector(".editorial-search");
  const portfolioGrid = document.getElementById("portfolio-grid");
  const emptyState = document.getElementById("search-empty-state");
  const resetBtn = document.getElementById("reset-search-btn");
  const loadMoreContainer = document.getElementById("load-more-container");
  const loadMoreBtn = document.getElementById("load-more-btn");

  // Property Details Modal Elements
  const propertyModal = document.getElementById("property-modal");
  const modalBackdrop = document.getElementById("property-modal-backdrop");
  const modalClose = document.getElementById("property-modal-close");
  const modalDismissBtn = document.getElementById("property-modal-dismiss-btn");
  const modalInquireBtn = document.getElementById("property-modal-inquire-btn");
  const modalImg = document.getElementById("property-modal-img");
  const modalLocation = document.getElementById("property-modal-location");
  const modalTitle = document.getElementById("property-modal-title");
  const modalPrice = document.getElementById("property-modal-price");
  const modalBeds = document.getElementById("property-modal-beds");
  const modalBaths = document.getElementById("property-modal-baths");
  const modalSqft = document.getElementById("property-modal-sqft");
  const modalType = document.getElementById("property-modal-type");
  const modalDesc = document.getElementById("property-modal-desc");
  const modalFeatures = document.getElementById("property-modal-features");

  if (portfolioGrid) {
    const initialCards = Array.from(portfolioGrid.querySelectorAll(".card"));
    let isExtraRevealed = false;
    let lastActiveCard = null;

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

    // Option B: Load More / Show Less Toggle
    function toggleLoadMore() {
      isExtraRevealed = !isExtraRevealed;
      const extraCards = portfolioGrid.querySelectorAll(".card-extra");

      extraCards.forEach(function (card) {
        if (isExtraRevealed) {
          card.classList.add("is-revealed", "is-fade-in");
          card.classList.remove("is-hidden");
        } else {
          card.classList.remove("is-revealed", "is-fade-in");
        }
      });

      if (loadMoreBtn) {
        loadMoreBtn.setAttribute("aria-expanded", String(isExtraRevealed));
        loadMoreBtn.textContent = isExtraRevealed
          ? "Show Less Listings"
          : "Load More Listings (+6)";
      }

      if (!isExtraRevealed) {
        portfolioGrid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", toggleLoadMore);
    }

    // Search, Filter and Sort across all 12 properties
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

      // Hide load more button while filtered search results are displayed
      if (loadMoreContainer) {
        loadMoreContainer.classList.add("is-hidden");
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
          card.classList.add("is-revealed", "is-fade-in");
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
      if (searchForm) searchForm.reset();
      isExtraRevealed = false;

      if (loadMoreBtn) {
        loadMoreBtn.setAttribute("aria-expanded", "false");
        loadMoreBtn.textContent = "Load More Listings (+6)";
      }
      if (loadMoreContainer) {
        loadMoreContainer.classList.remove("is-hidden");
      }
      if (emptyState) emptyState.style.display = "none";

      initialCards.forEach(function (card) {
        card.classList.remove("is-hidden", "is-fade-in");
        if (card.classList.contains("card-extra")) {
          card.classList.remove("is-revealed");
        }
        if (emptyState) {
          portfolioGrid.insertBefore(card, emptyState);
        } else {
          portfolioGrid.appendChild(card);
        }
      });

      portfolioGrid.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        filterAndSortProperties();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", resetFilters);
    }

    // Property Details Modal Functions
    function openPropertyModal(card) {
      if (!propertyModal) return;
      lastActiveCard = card;

      const imgEl = card.querySelector(".card-img");
      const titleEl = card.querySelector("h3");
      const locationEl = card.querySelector(".property-location");
      const priceEl = card.querySelector(".card-price");

      const title = titleEl ? titleEl.textContent.trim() : "Exclusive Listing";
      const location = locationEl
        ? locationEl.textContent.trim()
        : "Pahrump, NV";
      const price = priceEl ? priceEl.textContent.trim() : "Contact for Price";
      const beds = card.getAttribute("data-beds") || "-";
      const baths = card.getAttribute("data-baths") || "-";
      const rawSqft = card.getAttribute("data-sqft");
      const sqft = rawSqft
        ? parseInt(rawSqft, 10).toLocaleString() + " SQ FT"
        : "-";
      const type = card.getAttribute("data-type")
        ? card.getAttribute("data-type").toUpperCase()
        : "RESIDENTIAL";
      const desc =
        card.getAttribute("data-description") ||
        "A premier luxury residence represented exclusively by Marci Metzger and The Ridge Realty Group.";
      const featuresRaw = card.getAttribute("data-features") || "";

      if (modalImg && imgEl) {
        modalImg.src = imgEl.src;
        modalImg.alt = imgEl.alt || title;
      }
      if (modalLocation) modalLocation.textContent = location;
      if (modalTitle) modalTitle.textContent = title;
      if (modalPrice) modalPrice.textContent = price;
      if (modalBeds) modalBeds.textContent = beds + " Beds";
      if (modalBaths) modalBaths.textContent = baths + " Baths";
      if (modalSqft) modalSqft.textContent = sqft;
      if (modalType) modalType.textContent = type;
      if (modalDesc) modalDesc.textContent = desc;

      if (modalFeatures) {
        modalFeatures.innerHTML = "";
        if (featuresRaw) {
          const featuresList = featuresRaw
            .split("·")
            .map(function (f) {
              return f.trim();
            })
            .filter(Boolean);

          featuresList.forEach(function (feat) {
            const li = document.createElement("li");
            li.textContent = feat;
            modalFeatures.appendChild(li);
          });
        }
      }

      propertyModal.classList.add("is-open");
      propertyModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("property-modal-open");

      if (modalClose) {
        modalClose.focus();
      }
    }

    function closePropertyModal() {
      if (!propertyModal) return;
      propertyModal.classList.remove("is-open");
      propertyModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("property-modal-open");

      if (lastActiveCard) {
        lastActiveCard.focus();
      }
    }

    // Attach click and keyboard listeners to cards
    initialCards.forEach(function (card) {
      card.addEventListener("click", function () {
        openPropertyModal(card);
      });

      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPropertyModal(card);
        }
      });
    });

    if (modalClose) {
      modalClose.addEventListener("click", closePropertyModal);
    }
    if (modalDismissBtn) {
      modalDismissBtn.addEventListener("click", closePropertyModal);
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", closePropertyModal);
    }

    // Close on Escape key
    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Escape" &&
        propertyModal &&
        propertyModal.classList.contains("is-open")
      ) {
        closePropertyModal();
      }
    });

    // Modal focus trap
    if (propertyModal) {
      propertyModal.addEventListener("keydown", function (e) {
        if (!propertyModal.classList.contains("is-open") || e.key !== "Tab")
          return;

        const focusables = propertyModal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;

        const firstFocusable = focusables[0];
        const lastFocusable = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      });
    }

    // Inquiry button handler: pre-fills contact message & scrolls to #contact
    if (modalInquireBtn) {
      modalInquireBtn.addEventListener("click", function (e) {
        const title = modalTitle
          ? modalTitle.textContent.trim()
          : "the property";
        const price = modalPrice ? modalPrice.textContent.trim() : "";
        const location = modalLocation
          ? modalLocation.textContent.trim()
          : "Pahrump";

        closePropertyModal();

        const contactMsg = document.getElementById("contact-message");
        const contactName = document.getElementById("contact-name");
        if (contactMsg) {
          contactMsg.value = `Hello Marci, I am interested in receiving more information regarding ${title} (${price}) in ${location}. Please contact me with property details and availability.`;
        }

        setTimeout(function () {
          const contactSection = document.getElementById("contact");
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: "smooth" });
          }
          if (contactName) {
            contactName.focus();
          }
        }, 150);
      });
    }
  }
});
