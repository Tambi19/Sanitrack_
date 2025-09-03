// routes/auth.js
const express = require("express");
const User = require("../models/user");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, clusterId, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Email already exists" });

    const user = new User({ name, email, password, role, clusterId, phone });
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with matching email and password
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
