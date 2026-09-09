/**
 * properties.js
 * Portfolio grid rendering, Option B Load More toggle,
 * and multi-criteria search, filtering, and sorting engine.
 */

document.addEventListener("DOMContentLoaded", function () {
  const portfolioGrid = document.getElementById("portfolio-grid");
  const emptyState = document.getElementById("search-empty-state");
  const searchForm = document.querySelector(".editorial-search");
  const resetBtn = document.getElementById("reset-search-btn");
  const loadMoreContainer = document.getElementById("load-more-container");
  const loadMoreBtn = document.getElementById("load-more-btn");

  if (!portfolioGrid || !window.PROPERTIES_DATA) return;

  const properties = window.PROPERTIES_DATA;
  let isExtraRevealed = false;
  let cardElements = [];

  // Helper: Create a single property card element
  function createCardElement(prop) {
    const card = document.createElement("article");
    card.className = "card" + (prop.isExtra ? " card-extra" : "");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", "View details for " + prop.title);
    card.setAttribute("data-id", prop.id);
    card.setAttribute("data-location", prop.locationSlug);
    card.setAttribute("data-price", String(prop.price));
    card.setAttribute("data-beds", String(prop.beds));
    card.setAttribute("data-baths", String(prop.baths));
    card.setAttribute("data-sqft", String(prop.sqft));
    card.setAttribute("data-type", prop.type);

    card.innerHTML = `
      <img
        class="card-img"
        src="${prop.image}"
        alt="${prop.alt}"
        loading="lazy"
      />
      <div class="card-body">
        <span class="uppercase property-location">${prop.location}</span>
        <h3>${prop.title}</h3>
        <p class="card-price">${prop.priceFormatted}</p>
        <div class="card-meta">
          <span>${prop.beds} BEDS</span>
          <span>${prop.baths} BATHS</span>
          <span>${prop.sqftFormatted}</span>
        </div>
      </div>
    `;

    // Click and keyboard triggers for details modal
    card.addEventListener("click", function () {
      if (typeof window.openPropertyModalById === "function") {
        window.openPropertyModalById(prop.id, card);
      }
    });

    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (typeof window.openPropertyModalById === "function") {
          window.openPropertyModalById(prop.id, card);
        }
      }
    });

    return card;
  }

  // Render initial portfolio grid
  function renderPortfolio() {
    // Clear any existing cards while preserving empty-state
    const existingCards = portfolioGrid.querySelectorAll(".card");
    existingCards.forEach(function (c) {
      c.remove();
    });

    cardElements = properties.map(function (prop) {
      const cardEl = createCardElement(prop);
      if (emptyState) {
        portfolioGrid.insertBefore(cardEl, emptyState);
      } else {
        portfolioGrid.appendChild(cardEl);
      }
      return cardEl;
    });
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

  // Numerical parser helpers
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

    cardElements.forEach(function (card) {
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

      const matchesType = !typeVal || typeVal === "any" || cardType === typeVal;

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

    // Sorting
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

    // Hide load more button while filtered search results are active
    if (loadMoreContainer) {
      loadMoreContainer.classList.add("is-hidden");
    }

    cardElements.forEach(function (card) {
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

    cardElements.forEach(function (card) {
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

  // Initialize rendering
  renderPortfolio();
});
