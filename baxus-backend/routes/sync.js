


const express = require("express");
const axios = require("axios");
const Product = require("../models/Product"); // Your Mongoose model

const router = express.Router();

router.get("/sync", async (req, res) => {
  try {
    const products = [];
    let page = 0;
    const pageSize = 20;
    let moreProducts = true;
    //const maxPage = 10;

    while (moreProducts) {
      const response = await axios.get(
        `https://services.baxus.co/api/search/listings?from=${
          page * pageSize
        }&size=${pageSize}&listed=true`
      );

      console.log("API Response:", response.data);

      const fetchedProducts = response.data.map((item) => item._source);

      if (!fetchedProducts || fetchedProducts.length === 0) {
        moreProducts = false;
        break;
      }

      response.data.forEach((item) => {
        if (item._source) {
          const product = item._source;
          products.push({
            baxusId: product.id,
            name: product.name || "Unknown",
            price: product.price || 0,
            imageUrl: product.imageUrl || "",
            description: product.description || "",
            spiritType: product.spiritType || "",
          });
        }
      });

      console.log(
        `📦 Page ${page + 1} - Found ${fetchedProducts.length} products`
      );

      if (fetchedProducts.length < pageSize) {
        moreProducts = false;
      }

      page++;
    }

    console.log(`✅ Fetched ${products.length} products from BAXUS.`);


    let savedCount = 0;

    for (const product of products) {
      const result = await Product.updateOne(
        { baxusId: product.baxusId }, // match by unique ID
        { $set: product }, // update all fields
        { upsert: true } // insert if doesn't exist
      );

      if (result.upsertedCount > 0) {
        savedCount++; // count only new inserts
      }
    }

    return res.status(200).json({
      message: "✅ Products synced and saved to MongoDB",
      savedCount: savedCount, // ✅ use the correct variable
    });
  } catch (error) {
    console.error("❌ Sync error:", error);
    return res.status(500).json({
      message: "An error occurred during sync",
      error: error.message,
    });
  }
});

module.exports = router;
