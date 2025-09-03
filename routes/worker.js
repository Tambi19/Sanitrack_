const express = require("express");
const Task = require("../models/task");
const Complaint = require("../models/complaint");
const User = require("../models/user"); // ✅ IMPORT USER MODEL

const router = express.Router();

// Worker completes task
router.post("/complete/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.status = "Completed";
    task.completedAt = new Date();
    await task.save();

    const complaint = await Complaint.findById(task.complaintId);
    if (complaint) {
      complaint.status = "Resolved";
      await complaint.save();
    }

    res.json({ success: true, message: "Task completed & complaint resolved ✅", task, complaint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET cleaners by cluster
// GET cleaners by cluster
// In your GET /api/cleaner route
router.get("/", async (req, res) => {
  try {
    const { clusterId } = req.query;
    if (!clusterId) return res.status(400).json({ success: false, message: "clusterId required" });

    const cleaners = await User.find({ role: "cleaner", clusterId }).select("_id name");


    res.json({ success: true, cleaners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
