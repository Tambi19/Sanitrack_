const express = require("express");
const Complaint = require("../models/complaint");
const Task = require("../models/task");
const User = require("../models/user");

const router = express.Router();

// Assign a cleaner to a complaint
router.post("/assign/:complaintId", async (req, res) => {
  try {
    const { cleanerId } = req.body;

    // 1. Find complaint
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    // 2. Verify cleaner belongs to same cluster
    const cleaner = await User.findOne({ 
      _id: cleanerId, 
      role: "cleaner",          // changed from "Worker" to "cleaner"
      clusterId: complaint.clusterId // simplified to match your schema
    });
    if (!cleaner) return res.status(400).json({ error: "Cleaner not in this cluster" });

    // 3. Create Task
    const task = new Task({
      complaintId: complaint._id,
      clusterId: complaint.clusterId,
      workerId: cleaner._id       // field name in Task schema remains workerId
    });
    await task.save();

    // 4. Update complaint status
    complaint.status = "Verified";
    await complaint.save();

    // 5. (Optional) Notify cleaner
    console.log(`📢 Task assigned to cleaner ${cleaner.name} for complaint ${complaint._id}`);

    res.json({ success: true, task, message: "Cleaner assigned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { clusterId } = req.query;
    if (!clusterId) return res.status(400).json({ success: false, message: "clusterId required" });

    // Find all users with role "cleaner" in this cluster
    const cleaners = await User.find({ role: "cleaner", clusterId }).select("_id name");
    res.json({ success: true, cleaners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
