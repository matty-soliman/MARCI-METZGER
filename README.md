# Marci Metzger Homes — Architecture & Project Documentation

Welcome to the official codebase documentation for **Marci Metzger Homes** (The Ridge Realty Group). This guide is designed to give you a clear, friendly, and comprehensive understanding of how the code is organized, how data flows through the application, and how to easily maintain and update the website.

---

## 1. Project Philosophy & Tech Stack

The website is engineered with a **zero-dependency vanilla philosophy**:
- **HTML5:** Semantic, accessible layout structure (`<header>`, `<nav>`, `<main>`, `<article>`, `<dialog>`, `<footer>`).
- **CSS3:** Modern design system using CSS custom properties (`:root`), Flexbox, CSS Grid, and responsive typography (`clamp`).
- **Vanilla JavaScript (ES6+):** Clean, modular scripts without any external libraries or heavy frameworks (no React, no jQuery, no Tailwind).
- **Performance & SEO:** Fast page loads, WebP image formats, WCAG 2.1 AA accessibility standards, and semantic microdata.

---

## 2. Directory & File Structure

Here is the high-level layout of the repository:

```text
MARCI METZGER/
├── index.html              # Main HTML page (clean skeleton & layout)
├── Style.css               # Complete stylesheet (design tokens, layout, modal, responsive)
│
├── properties-data.js      # [DATA STORE] All 12 property definitions in a structured JS array
├── properties.js           # [CONTROLLER] Dynamic grid renderer, Option B Load More, search/filter
├── property-modal.js       # [CONTROLLER] Accessible Property Details Popup Modal & inquiry prefill
├── navigation.js           # [CONTROLLER] Navbar hide-on-scroll & mobile menu drawer
├── gallery.js              # [CONTROLLER] Photo gallery accordion & image lightbox preview
│
└── Asset/                  # Organized media assets
    ├── logo/               # Brand logos (The Ridge Realty Group & Marci Metzger)
    ├── hero/               # Hero background imagery (Mountain Falls lake & pond)
    ├── Marci/              # Executive headshots & broker portraits
    ├── Photo Gallery/      # High-res property photography (1.webp through 7.webp)
    ├── Guide Section/      # Interior and exterior architectural photography
    ├── Our Service/        # Staged living spaces and consultation photography
    └── Affiliations/       # Equal Housing, REALTOR®, Chamber of Commerce logos
```

---

## 3. How the Data Flows (Architecture Diagram)

The website uses a **decoupled, data-driven architecture**. Instead of hardcoding hundreds of repetitive lines of HTML, property data lives in one central place:

```text
[ properties-data.js ]
         │
         ▼  (Loaded into memory as window.PROPERTIES_DATA)
  [ properties.js ]
         │
         ├────────────────────────────────────────┐
         ▼                                        ▼
[ Render Cards into #portfolio-grid ]    [ Filter & Sort by Search Input ]
         │                                        │
         │  (User clicks a property card)         │  (Matching cards shown)
         ▼                                        ▼
  [ property-modal.js ]                  [ Update DOM Results ]
         │
         ▼  (Pulls high-res photo, price, specs, description)
[ Opens #property-modal Popup ]
         │
         ▼  (User clicks "Inquire About This Home")
[ Pre-fills #contact form & smooth-scrolls to #contact ]
```

---

## 4. Deep-Dive into Each File

### A. [`properties-data.js`](properties-data.js) — The Single Source of Truth
This file holds all 12 property listings in a clean array of JavaScript objects. Each listing looks like this:

```javascript
{
  id: "golf-community-villa",              // Unique ID for modal lookup
  title: "Golf Community Villa",           // Display title
  location: "Mountain Falls, Pahrump",     // Human-readable location
  locationSlug: "pahrump mountain-falls",  // Keywords for search engine
  price: 685000,                           // Raw number for sorting and price filtering
  priceFormatted: "$685,000",              // Formatted display price
  beds: 4,                                 // Bedroom count
  baths: 3,                                // Bathroom count
  sqft: 3120,                              // Square footage
  sqftFormatted: "3,120 SQ FT",            // Formatted square footage
  type: "residential",                     // Property category (residential, land, etc.)
  image: "Asset/Photo Gallery/7.webp",     // Local asset path
  alt: "Mountain Falls Golf Community Villa in Pahrump, Nevada",
  description: "Nestled within the premier Mountain Falls golf community...",
  features: [                              // Amenities displayed as checkmark badges
    "Mountain Falls Golf Club Access",
    "Custom Granite Kitchen",
    "Covered Entertainer Patio",
    "3-Car Garage"
  ],
  isExtra: false                           // false = shown initially (1-6); true = extra (7-12)
}
```

### B. [`properties.js`](properties.js) — Portfolio & Search Engine
This file controls everything inside the `#properties` section:
1. **Dynamic Rendering:** On page load, it reads `PROPERTIES_DATA` and generates `<article class="card">` elements inside `#portfolio-grid`.
2. **Option B "Load More":**
   - Listings with `isExtra: false` (properties 1–6) are visible immediately.
   - Listings with `isExtra: true` (properties 7–12) have the `.card-extra` class and are hidden by default.
   - Clicking `#load-more-btn` reveals properties 7–12 with a fade animation and switches button text to *"Show Less Listings"*.
3. **Multi-Criteria Search Engine:**
   - Listens to `.editorial-search` form submission.
   - Filters across **Location**, **Type**, **Min Bedrooms**, **Min Baths**, and **Price Range** ($Min to $Max).
   - Sanitizes user input (e.g. `$650,000` is parsed to integer `650000`).
   - Sorts results dynamically (Least/Most Expensive, Bedrooms Low/High, Bathrooms Low/High).
   - Shows `#search-empty-state` if 0 properties match, with a 1-click *"Reset All Filters"* button.

### C. [`property-modal.js`](property-modal.js) — Property Details Popup
This file handles the full popup experience when any property card is clicked:
1. **Direct Data Lookup:** When a card is clicked, it calls `openPropertyModalById(propertyId, cardElement)`.
2. **Dynamic Population:** Fills the modal photo, title, location, price, quick-specs strip (Beds, Baths, Sq Ft, Type), description, and amenities list.
3. **WCAG AA Accessibility:**
   - Accessible ARIA dialog attributes (`role="dialog"`, `aria-modal="true"`, `aria-hidden`).
   - Focus trapping inside the modal while open (Tab & Shift+Tab cycle within the modal).
   - Closes when pressing the `Escape` key, clicking the close button (`×`), or clicking the blurred backdrop.
   - Restores focus back to the triggering card when dismissed.
   - Scroll locks the body (`body.property-modal-open`).
4. **Conversion CTA:**
   - Clicking *"Inquire About This Home"* closes the modal and smooth-scrolls to the `#contact` section.
   - Automatically pre-fills the message box with:
     > *"Hello Marci, I am interested in receiving more information regarding [Title] ([Price]) in [Location]. Please contact me with property details and availability."*

### D. [`navigation.js`](navigation.js) — Header & Menu Drawer
A lean, 75-line script focused entirely on navigation UX:
- Handles the hamburger button click on mobile screens (`.mobile-toggle`).
- Automatically closes the menu when a nav link or outside area is clicked.
- Listens for `Escape` to close the drawer and returns focus to the toggle button.
- Detects page scroll direction: smoothly hides the navbar when scrolling down, and reveals it when scrolling up (`.nav-hidden`).

### E. [`gallery.js`](gallery.js) — Photo Gallery & Lightbox
- Controls the interactive accordion in the *"Photo Gallery"* section.
- Expands cards on hover/click.
- Opens the full-screen photo lightbox modal on active cards.

---

## 5. How to Perform Common Tasks

### How to Add a New Property (#13):
1. Place the property photo in `Asset/Photo Gallery/` (or any `Asset/` subfolder) as `.webp`.
2. Open [`properties-data.js`](properties-data.js).
3. Copy any existing object block and paste it at the end of the `PROPERTIES_DATA` array.
4. Fill in the title, price, location, specs, description, and asset image path.
5. Set `isExtra: true` if you want it to appear in the "Load More" section, or `isExtra: false` to make it always visible.
6. Save the file. **Done!** The card, search filter, and popup modal will automatically work without editing any HTML!

### How to Edit an Existing Listing:
- Want to change a price or mark a home as Sold?
- Open [`properties-data.js`](properties-data.js), locate the property, and update `price` and `priceFormatted`. The card and the popup modal will update instantly.

---

## 6. Design System Tokens ([`Style.css`](Style.css))

All colors, fonts, and dimensions are defined as CSS variables at the top of `Style.css`:

| Variable | Value | Usage |
| :--- | :---: | :--- |
| `--ink` | `#17211f` | Primary dark text, headings, dark buttons |
| `--paper` | `#fffdf9` | Light cream background, button text |
| `--canvas` | `#f4f1eb` | Secondary background, card canvas |
| `--terracotta` | `#c8755d` | Warm terracotta accent color, active borders |
| `--terracotta-text` | `#a34e36` | High-contrast accessible kicker text (5.69:1 WCAG AA) |
| `--line` | `#dfe2db` | Elegant dividers and card borders |
| `--font-serif` | `"Playfair Display", Georgia, serif` | Editorial headings (`h1`, `h2`, `h3`) |
| `--font-sans` | `"Inter", -apple-system, sans-serif` | Body copy, navigation, labels |
| `--shadow-lift` | `0 18px 36px rgba(23, 33, 31, 0.08)` | Card hover elevation effect |

---

## 7. How to Test & Verify the Code

### Automated Test Suite:
Run the search engine verification tests:
```bash
node scratch/test_search_engine.js
```
Runs 18 test cases verifying all filters (Location, Beds, Baths, Price), live sorting, and empty state.

### DOM & Integrity Verification:
Run the asset and markup validator:
```bash
python scratch/verify_project.py
```
Confirms that 100% of images exist, all anchors match section IDs, and every image has descriptive alt text.

---

## 8. Git Workflow Cheat Sheet

Whenever you make changes to your project, use these 3 standard Git commands:

```bash
# 1. Check what files you changed
git status

# 2. Stage and commit your work
git add .
git commit -m "Description of what you changed"

# 3. Push to your GitHub repository
git push origin main
```
