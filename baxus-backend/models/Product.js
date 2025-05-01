const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    baxusId: { type: String, required: true, unique: true },
    name: String,
    price: Number,
    imageUrl: String,
    description: String,
    spiritType: String, // or "category" if you prefer
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
