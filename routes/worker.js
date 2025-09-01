const express = require("express");
const Task = require("../models/task");
const Complaint = require("../models/complaint");

const router = express.Router();

// Worker completes task
router.post("/complete/:taskId", async (req, res) => {
  try {
    // 1. Find task
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // 2. Update task status
    task.status = "Completed";
    task.completedAt = new Date();
    await task.save();

    // 3. Update linked complaint
    const complaint = await Complaint.findById(task.complaintId);
    if (complaint) {
      complaint.status = "Resolved";
      await complaint.save();
    }

    res.json({ 
      success: true, 
      message: "Task completed & complaint resolved ✅", 
      task, 
      complaint 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
