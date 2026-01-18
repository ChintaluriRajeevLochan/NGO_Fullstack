const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function seedAdmin() {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
      console.log("⚠️ Super admin env not configured");
      return;
    }

    const existing = await User.findOne({ email });

    const hashed = await bcrypt.hash(password, 10);

    if (!existing) {
      await User.create({
        name: "Super Admin",
        email,
        password: hashed,
        role: "ADMIN",
      });

      console.log("✅ Super admin created");
    } else {
      // Optional: force reset password every boot
      existing.password = hashed;
      await existing.save();

      console.log("♻️ Super admin verified / reset");
    }
  } catch (err) {
    console.error("❌ Failed to seed admin", err);
  }
}

module.exports = seedAdmin;
