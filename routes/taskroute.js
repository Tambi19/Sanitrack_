const express = require("express");
const Task = require("../models/task");
const Complaint = require("../models/complaint");
const User = require("../models/user");
const Led = require("../models/led");
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

    // 🔗 Link complaint to this task
    await Complaint.findByIdAndUpdate(complaintId, { taskId: task._id, status: "In Progress" });

    // 🔄 Update LED to in_progress when task assigned
    await Led.findOneAndUpdate(
      { clusterId },
      { status: "in_progress", lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Task assigned successfully ✅", task });
  } catch (err) {
    console.error("POST /tasks error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /tasks
 * Fetch tasks for a specific cleaner & cluster
 */
router.get("/", async (req, res) => {
  try {
    const { clusterId, cleanerId } = req.query;

    if (!clusterId || !cleanerId) {
      return res.status(400).json({ success: false, message: "clusterId and cleanerId required" });
    }

    // 👇 Show only "assigned" or "cleaning_done" tasks
    const tasks = await Task.find({
      clusterId,
      workerId: cleanerId,
      status: { $in: ["assigned"] }
    })
      .populate("complaintId", "description location status")
      .lean();

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

    // 🔄 Update LED + Complaint based on task status
    if (status === "cleaning_done") {
      await Complaint.findByIdAndUpdate(task.complaintId, { status: "Waiting Approval" });
      await Led.findOneAndUpdate(
        { clusterId: task.clusterId },
        { status: "in_review", lastUpdated: new Date() }
      );
    }

    if (status === "completed") {
      await Complaint.findByIdAndUpdate(task.complaintId, { status: "Resolved" });

      await Led.findOneAndUpdate(
        { clusterId: task.clusterId },
        { status: "clean", lastUpdated: new Date() }
      );
    }

    res.json({ success: true, task });
  } catch (err) {
    console.error("PUT /tasks/:id error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /tasks/complete/:taskId
 * Mark task as completed by volunteer
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

    // Update related complaint
    if (task.complaintId) {
      await Complaint.findByIdAndUpdate(task.complaintId, { status: "Resolved" });
    }

    // 🔄 Update LED to green clean
    await Led.findOneAndUpdate(
      { clusterId: task.clusterId },
      { status: "clean", lastUpdated: new Date() }
    );

    res.json({ success: true, message: "Task completed ✅", task });
  } catch (err) {
    console.error("POST /tasks/complete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
