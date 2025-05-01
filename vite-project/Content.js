function detectCategory() {
  const metaTags = document.getElementsByTagName("meta");
  let detectedCategory = "";

  for (let tag of metaTags) {
    const nameAttr = tag.getAttribute("name")?.toLowerCase();
    const propertyAttr = tag.getAttribute("property")?.toLowerCase();
    const content = tag.getAttribute("content")?.toLowerCase();

    if (content) {
      if (
        content.includes("whiskey") ||
        content.includes("wine") ||
        content.includes("bottle") ||
        content.includes("bourbon") ||
        content.includes("scotch")
      ) {
        detectedCategory = content;
        break;
      }
    }

    if (
      nameAttr &&
      (nameAttr.includes("category") || nameAttr.includes("keywords"))
    ) {
      if (
        content &&
        (content.includes("whiskey") ||
          content.includes("wine") ||
          content.includes("bottle") ||
          content.includes("bourbon") ||
          content.includes("scotch"))
      ) {
        detectedCategory = content;
        break;
      }
    }

    if (propertyAttr && propertyAttr.includes("og:type")) {
      if (content && content.includes("product")) {
        detectedCategory = "product"; // basic detection
      }
    }
  }

  return detectedCategory;
}

let lastUrl = location.href;

const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    console.log("URL changed, re-scraping...");
    lastUrl = location.href;
    startScraping();
  }
});

observer.observe(document, { subtree: true, childList: true });

window.addEventListener("load", () => {
  console.log("Page fully loaded. Starting scrape...");
  startScraping();
});

function startScraping() {
  const category = detectCategory();

  if (
    !category.includes("whiskey") &&
    !category.includes("wine") &&
    !document.body.innerText.toLowerCase().includes("whiskey") &&
    !document.body.innerText.toLowerCase().includes("wine")
  ) {
    console.log("Page not about bottles. Skipping scrape.");
    return;
  }

  const products = findProductCards();

  function extractShippingLabel(card) {
    const text = card.innerText.toLowerCase();
    if (text.includes("free shipping") || text.includes("ships free")) {
      return "Free Shipping";
    }
    return "Unknown";
  }

  const scrapedProducts = products.map((card) => {
    let name = "Unknown";
    const preferredSelectors = [
      ".product-item-link",
      ".product-name",
      ".product_main_name",
      ".product_title",
      ".card-title",
      "h1",
      "h2",
      "h3",
      "p",
      "span",
      ".title",
      ".protitle",
      ".product-block__title",
    ];

    for (const selector of preferredSelectors) {
      const el = card.querySelector(selector);
      if (el && el.innerText.trim().length > 3) {
        name = el.innerText.trim();
        break;
      }
    }

    // Fallback if still unknown
    if (name === "Unknown") {
      const linkWithText = card.querySelector("a");
      if (linkWithText && linkWithText.innerText.length > 3) {
        name = linkWithText.innerText.trim();
      }
    }

    const priceMatch = card.innerText.match(/\$[\d,.]+/);
    const price = priceMatch ? priceMatch[0] : "Unknown";
    const imgTag = card.querySelector("img");
    const image = imgTag ? imgTag.src : "";
    const shipping = extractShippingLabel(card);

    return {
      name,
      price,
      image,
      shipping,
    };
  });

  // Deduplicate by name
  const uniqueProductsMap = new Map();

  scrapedProducts.forEach((product) => {
    const key = `${product.name}-${product.price}`; // combine name and price
    if (!uniqueProductsMap.has(key)) {
      uniqueProductsMap.set(key, product);
    }
  });

  const uniqueProducts = Array.from(uniqueProductsMap.values());

  console.log("Scraped Products:", scrapedProducts);
  chrome.runtime.sendMessage({
    type: "SCRAPED_PRODUCTS",
    payload: uniqueProducts,
  });

  // Later send to background.js
}

function isGoodImage(img) {
  const minWidth = 100;
  const minHeight = 100;

  if (!img.src) return false;
  if (img.naturalWidth < minWidth || img.naturalHeight < minHeight)
    return false;

  // Optional: Exclude images with certain keywords (banner, icon, logo, etc)
  const badKeywords = ["logo", "icon", "banner", "sprite", "placeholder"];
  for (let keyword of badKeywords) {
    if (img.src.toLowerCase().includes(keyword)) {
      return false;
    }
  }

  return true;
}

function findProductCards() {
  const allElements = document.querySelectorAll("div, section, article");
  const productCards = [];

  allElements.forEach((el) => {
    const text = el.innerText?.toLowerCase() || "";
    const hasPrice = /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/.test(text); // smarter price regex
    const image = el.querySelector("img");
    const hasGoodImage = image && isGoodImage(image);

    // Extra checks: Must have price, good image, and reasonable text length
    if (hasPrice && hasGoodImage && text.length > 20) {
      productCards.push(el);
    }
  });

  return productCards;
}
