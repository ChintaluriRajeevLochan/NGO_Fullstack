const express = require("express");
const crypto = require("crypto");
const Donation = require("../models/Donation");
const razorpay = require("../config/razorpay");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

/* ================= CREATE ORDER ================= */
router.post("/create-order", protect(["USER"]), async (req, res) => {
  try {
    let { amount } = req.body;
    amount = Number(amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // ✅ Create donation first as PENDING
    const donation = await Donation.create({
      user: req.user.id,
      amount,
      status: "PENDING",
    });

    // ✅ Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: donation._id.toString(),
      notes: {
        donationId: donation._id.toString(),
        userId: req.user.id.toString(),
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      donationId: donation._id,
    });
  } catch (err) {
    console.error("❌ Create order error:", err);
    res.status(500).json({ message: "Unable to create payment order" });
  }
});

/* ================= VERIFY PAYMENT ================= */
router.post("/verify", protect(["USER"]), async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !donationId
    ) {
      return res.status(400).json({ message: "Missing payment fields" });
    }

    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // ✅ Prevent double verification
    if (donation.status === "SUCCESS") {
      return res.json({ message: "Payment already verified" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isAuthentic = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isAuthentic) {
      donation.status = "FAILED";
      await donation.save();

      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // ✅ Genuine payment confirmed
    donation.status = "SUCCESS";
    donation.razorpayOrderId = razorpay_order_id;
    donation.razorpayPaymentId = razorpay_payment_id;

    await donation.save();

    res.json({ message: "Payment verified successfully" });
  } catch (err) {
    console.error("❌ Verify payment error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

/* ================= MY DONATIONS ================= */
router.get("/my", protect(["USER"]), async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(donations);
  } catch (err) {
    console.error("❌ Load donations error:", err);
    res.status(500).json({ message: "Failed to load donations" });
  }
});
/* ================= MARK PAYMENT FAILED ================= */
router.post("/mark-failed", protect(["USER"]), async (req, res) => {
  try {
    const { donationId } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Only update if still pending
    if (donation.status === "PENDING") {
      donation.status = "FAILED";
      await donation.save();
    }

    res.json({ message: "Payment marked as failed" });
  } catch (err) {
    console.error("Mark failed error:", err);
    res.status(500).json({ message: "Failed to update payment status" });
  }
});

module.exports = router;
