const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Donation = require("../models/Donation");
const User = require("../models/User");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

/* ================= ADMIN LOGIN ================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "ADMIN" });
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin login failed" });
  }
});

/* ================= ADMIN STATS ================= */

router.get("/stats", protect(["ADMIN"]), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "USER" });
    const totalDonations = await Donation.countDocuments();

    const totalAmountAgg = await Donation.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalAmount = totalAmountAgg[0]?.total || 0;

    res.json({
      totalUsers,
      totalDonations,
      totalAmount,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* ================= ALL DONATIONS ================= */

router.get("/donations", protect(["ADMIN"]), async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch {
    res.status(500).json({ message: "Failed to fetch donations" });
  }
});

/* ================= ALL USERS ================= */

router.get("/users", protect(["ADMIN"]), async (req, res) => {
  try {
    const users = await User.find({ role: "USER" }).select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ================= ALL ADMINS ================= */

router.get("/admins", protect(["ADMIN"]), async (req, res) => {
  try {
    const admins = await User.find({ role: "ADMIN" }).select("-password");
    res.json(admins);
  } catch {
    res.status(500).json({ message: "Failed to fetch admins" });
  }
});

/* ================= CREATE ADMIN ================= */

router.post("/create-admin", protect(["ADMIN"]), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashed,
      role: "ADMIN",
    });

    res.json({ message: "Admin created successfully", admin });
  } catch {
    res.status(500).json({ message: "Failed to create admin" });
  }
});
/* ================= UPDATE ADMIN PROFILE ================= */

router.put("/update-profile", protect(["ADMIN"]), async (req, res) => {
  try {
    const { name, password } = req.body;

    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) {
      admin.name = name;
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      admin.password = hashed;
    }

    await admin.save();

    res.json({
      message: "Profile updated successfully",
      admin: {
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile update failed" });
  }
});

module.exports = router;
