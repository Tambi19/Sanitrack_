// routes/led.js
const express = require("express");
const Led = require("../models/led");

const router = express.Router();

/**
 * Get all clusters with their LED status
 */
router.get("/", async (req, res) => {
  try {
    const clusters = await Led.find({});
    res.json({ success: true, clusters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get a specific cluster by ID
 */
router.get("/:clusterId", async (req, res) => {
  try {
    const cluster = await Led.findOne({ clusterId: req.params.clusterId });
    if (!cluster) {
      return res.status(404).json({ success: false, message: "Cluster not found" });
    }
    res.json({ success: true, cluster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Update cluster LED status manually (optional)
 * body: { status: "clean" | "dirty" }
 */
router.put("/:clusterId", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["clean", "dirty", "in_progress"].includes(status)) {
  return res.status(400).json({ success: false, message: "Invalid status" });
}


    const cluster = await Led.findOneAndUpdate(
  { clusterId: complaint.clusterId },
  { status: "in_progress", lastUpdated: new Date() },
  { upsert: true, new: true }
);

    res.json({ success: true, cluster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
