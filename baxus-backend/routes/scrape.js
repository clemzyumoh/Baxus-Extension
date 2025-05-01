


const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Fuse = require("fuse.js");

router.post("/", async (req, res) => {
  console.log("🚀 Received scrape POST:", req.body);
  const { bottles } = req.body;

  for (const bottle of bottles) {
    if (typeof bottle.price === "string") {
      const numeric = parseFloat(bottle.price.replace(/[^0-9.]/g, ""));
      bottle.price = isNaN(numeric) ? null : numeric;
    }
  }

  if (!bottles || !Array.isArray(bottles)) {
    return res.status(400).json({ error: "No bottles array provided" });
  }

  try {
    const baxusProducts = await Product.find();

    const results = [];

    for (let scraped of bottles) {
      const scrapedPrice = parseFloat(scraped.price || 0);
      const scrapedWords = scraped.name
        .toLowerCase()
        .split(/\s+/)
        .slice(0, 3)
        .join(" ");

      // Step 1: Filter BAXUS products where first 2–3 words match
      const preFiltered = baxusProducts.filter((p) => {
        const baxusWords = p.name
          .toLowerCase()
          .split(/\s+/)
          .slice(0, 3)
          .join(" ");
        return (
          baxusWords.startsWith(scrapedWords) ||
          scrapedWords.startsWith(baxusWords)
        );
      });

      if (preFiltered.length === 0) {
        results.push({
          scraped: {
            name: scraped.name,
            price: scrapedPrice,
            image: scraped.image || null,
            description: scraped.description || "",
          },
          baxus: null,
          savings: null,
          betterDeal: "not found",
        });
        continue;
      }

      // Step 2: Use Fuse.js on this smaller pool
      const fuse = new Fuse(preFiltered, {
        keys: ["name"],
        threshold: 0.4,
      });

      const fuseResults = fuse.search(scraped.name);

      // Step 3: Find first better deal
      let matched = null;
      for (const result of fuseResults) {
        const baxusProduct = result.item;
        const baxusPrice = parseFloat(baxusProduct.price || 0);

        if (baxusPrice < scrapedPrice) {
          matched = {
            baxusProduct,
            baxusPrice,
          };
          break;
        }
      }

      if (matched) {
        const { baxusProduct, baxusPrice } = matched;
        const savings = scrapedPrice - baxusPrice;

        results.push({
          scraped: {
            name: scraped.name,
            price: scrapedPrice,
            image: scraped.image || null,
            description: scraped.description || "",
          },
          baxus: {
            name: baxusProduct.name,
            price: baxusPrice,
            image: baxusProduct.imageUrl || baxusProduct.images?.[0] || null,
            description: baxusProduct.description || "",
            _id: baxusProduct.baxusId,
          },
          savings: savings.toFixed(2),
          betterDeal: "baxus",
        });
      } else {
        results.push({
          scraped: {
            name: scraped.name,
            price: scrapedPrice,
            image: scraped.image || null,
            description: scraped.description || "",
          },
          baxus: null,
          savings: null,
          betterDeal: "not found",
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error("❌ Error in /scrape:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
