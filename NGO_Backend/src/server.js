require("dotenv").config();   

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const donationRoutes = require("./routes/donation.routes");
const adminRoutes = require("./routes/admin.routes");
const seedAdmin = require("./seed/admin.seed");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database
connectDB().then(seedAdmin);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("NGO Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
