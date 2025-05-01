// models/Bottle.js
const mongoose = require("mongoose");

const bottleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: Number,
    imageUrl: String,
    baxusId: String, // The ID from Baxus (optional but useful for deep links)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bottle", bottleSchema);
