/**
 * property-modal.js
 * Accessible Property Details Modal dialog controller.
 * Manages modal opening, data population, accessibility, focus trapping,
 * and direct inquiry pre-filling into the contact form.
 */

document.addEventListener("DOMContentLoaded", function () {
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

  if (!propertyModal) return;

  let lastActiveTrigger = null;

  function openPropertyModalById(propertyId, triggerElement) {
    if (!window.PROPERTIES_DATA) return;
    const prop = window.PROPERTIES_DATA.find(function (p) {
      return p.id === propertyId;
    });
    if (!prop) return;

    lastActiveTrigger = triggerElement || null;

    if (modalImg) {
      modalImg.src = prop.image;
      modalImg.alt = prop.alt || prop.title;
    }
    if (modalLocation) modalLocation.textContent = prop.location;
    if (modalTitle) modalTitle.textContent = prop.title;
    if (modalPrice) modalPrice.textContent = prop.priceFormatted;
    if (modalBeds) modalBeds.textContent = prop.beds + " Beds";
    if (modalBaths) modalBaths.textContent = prop.baths + " Baths";
    if (modalSqft) modalSqft.textContent = prop.sqftFormatted;
    if (modalType) modalType.textContent = prop.type.toUpperCase();
    if (modalDesc) modalDesc.textContent = prop.description;

    if (modalFeatures) {
      modalFeatures.innerHTML = "";
      (prop.features || []).forEach(function (feat) {
        const li = document.createElement("li");
        li.textContent = feat;
        modalFeatures.appendChild(li);
      });
    }

    propertyModal.classList.add("is-open");
    propertyModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("property-modal-open");

    if (modalClose) {
      modalClose.focus();
    }
  }

  function closePropertyModal() {
    propertyModal.classList.remove("is-open");
    propertyModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("property-modal-open");

    if (lastActiveTrigger && typeof lastActiveTrigger.focus === "function") {
      lastActiveTrigger.focus();
    }
  }

  // Export functions to window for global access
  window.openPropertyModalById = openPropertyModalById;
  window.closePropertyModal = closePropertyModal;

  // Dismiss listeners
  if (modalClose) modalClose.addEventListener("click", closePropertyModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener("click", closePropertyModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closePropertyModal);

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && propertyModal.classList.contains("is-open")) {
      closePropertyModal();
    }
  });

  // Focus trap inside modal
  propertyModal.addEventListener("keydown", function (e) {
    if (!propertyModal.classList.contains("is-open") || e.key !== "Tab") return;

    const focusables = propertyModal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

  // Inquiry CTA button handler: pre-fills contact message & smooth-scrolls to #contact
  if (modalInquireBtn) {
    modalInquireBtn.addEventListener("click", function () {
      const title = modalTitle ? modalTitle.textContent.trim() : "the property";
      const price = modalPrice ? modalPrice.textContent.trim() : "";
      const location = modalLocation ? modalLocation.textContent.trim() : "Pahrump";

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
});
