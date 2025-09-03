const express = require("express");
const Task = require("../models/task");
const Complaint = require("../models/complaint");
const User = require("../models/user");
const mongoose = require("mongoose");

const router = express.Router();

/**
 * POST /tasks
 * Create & assign a new task to a cleaner
 */
router.post("/", async (req, res) => {
  try {
    const { complaintId, clusterId, workerId, description } = req.body;

    if (!complaintId || !clusterId || !workerId || !description) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    if (!mongoose.Types.ObjectId.isValid(complaintId))
      return res.status(400).json({ success: false, message: "Invalid complaintId" });
    if (!mongoose.Types.ObjectId.isValid(workerId))
      return res.status(400).json({ success: false, message: "Invalid workerId" });

    const cleaner = await User.findById(workerId);
    if (!cleaner || cleaner.role !== "cleaner")
      return res.status(400).json({ success: false, message: "Cleaner not found" });

    const task = new Task({
      complaintId,
      clusterId,
      workerId,
      assignedCleaner: cleaner.name,
      description,
      status: "assigned",
      assignedAt: new Date(),
    });

    await task.save();
    res.json({ success: true, message: "Task assigned successfully ✅", task });
  } catch (err) {
    console.error("POST /tasks error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


/**
 * GET /tasks
 * Get tasks by cluster, optionally filtered by cleaner
 */
router.get("/", async (req, res) => {
  try {
    const { clusterId, cleanerId } = req.query;
    if (!clusterId) return res.status(400).json({ success: false, message: "clusterId required" });

    let query = { clusterId };
    if (cleanerId && mongoose.Types.ObjectId.isValid(cleanerId)) {
      query.workerId = cleanerId;
    }

    const tasks = await Task.find(query).populate("workerId", "name email");
    res.json({ success: true, tasks });
  } catch (err) {
    console.error("GET /tasks error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


/**
 * PUT /tasks/:id
 * Update task (status/proof)
 */
router.put("/:id", async (req, res) => {
  try {
    const { status, proof } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (status) task.status = status;
    if (proof) task.proof = proof;
    await task.save();

    // Sync complaint status when task is completed
    if (status === "completed") {
      const complaint = await Complaint.findById(task.complaintId);
      if (complaint) {
        complaint.status = "Resolved";
        await complaint.save();
      }
    }

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


/**
 * POST /tasks/complete/:taskId
 * Mark task as completed by cleaner/volunteer after cleaning is done
 */
router.post("/complete/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (task.status !== "cleaning_done") {
      return res.status(400).json({
        success: false,
        message: "Task cannot be completed until cleaner marks it done",
      });
    }

    task.status = "completed";
    task.completedAt = new Date();
    await task.save();

    // Update related complaint status if exists
    if (task.complaintId) {
      const complaint = await Complaint.findById(task.complaintId);
      if (complaint) {
        complaint.status = "Resolved";
        await complaint.save();
      }
    }

    res.json({ success: true, message: "Task completed ✅", task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
