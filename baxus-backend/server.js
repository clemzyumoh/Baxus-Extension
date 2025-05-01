// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");


// Load environment variables from .env
dotenv.config();

// Create express app
const app = express();
app.use(cors());
app.use(express.json());



const scrapeRoutes = require("./routes/scrape");
app.use("/scrape", scrapeRoutes);


const syncRoutes = require("./routes/sync");
app.use('/api', syncRoutes); // Use the sync routes under /api path



// Example simple route (we will later add real ones)
app.get("/", (req, res) => {
  res.send("BAXUS backend running ✅");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB connection error ❌", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
