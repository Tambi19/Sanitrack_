const express = require("express");
const Complaint = require("../models/complaint");
const User = require("../models/user");
const router = express.Router();
const Task = require("../models/task");

const THRESHOLD = 15; // e.g. notify after 5 complaints

router.post("/", async (req, res) => {
  try {
    let { clusterId, toiletNo, feedback } = req.body;

    clusterId = String(clusterId); // force to string

    // Save complaint
    const complaint = new Complaint({ clusterId, toiletNo, feedback, status: "Pending" });
    await complaint.save();

    // Count complaints
    const count = await Complaint.countDocuments({
      clusterId,
      status: "Pending"
    });

    console.log(`Cluster ${clusterId} has ${count} pending complaints.`);

    // Notify volunteers if threshold crossed
    if (count >= THRESHOLD) {
      const volunteers = await User.find({ role: "Volunteer", assignedClusters: clusterId });
      console.log(`📢 Threshold reached! Notifying volunteers:`, volunteers.map(v => v.name));
    }

    res.json({ success: true, complaint, message: "Complaint logged successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// backend/routes/feedback.js

// backend/routes/feedback.js
router.get("/:clusterId", async (req, res) => {
  try {
    const { clusterId } = req.params;

    // Fetch complaints
    const complaints = await Complaint.find({ clusterId }).lean();

    // Fetch tasks for these complaints
    const complaintIds = complaints.map(c => c._id);
    const tasks = await Task.find({ complaintId: { $in: complaintIds } }).lean();

    // Merge task info into complaints
    const complaintsWithTaskStatus = complaints.map(c => {
      const task = tasks.find(t => t.complaintId.toString() === c._id.toString());
      return {
        ...c,
        taskStatus: task?.status || null,
        assignedCleaner: task?.assignedCleaner || null
      };
    });

    res.json({ success: true, complaints: complaintsWithTaskStatus });
  } catch (err) {
    console.error("❌ Error fetching complaints with tasks:", err);
    res.status(500).json({ error: err.message });
  }
});


// Update complaint status
// Update complaint status
// Update complaint status
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status required" });
    }

    const updated = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.json({ success: true, complaint: updated });
  } catch (err) {
    console.error("❌ Error updating feedback:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});







module.exports = router;
