const express = require("express");
const Complaint = require("../models/complaint");
const Task = require("../models/task");
const User = require("../models/user");

const router = express.Router();

// Assign a worker to a complaint
router.post("/assign/:complaintId", async (req, res) => {
  try {
    const { workerId } = req.body;

    // 1. Find complaint
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    // 2. Verify worker belongs to same cluster
    const worker = await User.findOne({ _id: workerId, role: "Worker", assignedClusters: complaint.clusterId });
    if (!worker) return res.status(400).json({ error: "Worker not in this cluster" });

    // 3. Create Task
    const task = new Task({
      complaintId: complaint._id,
      clusterId: complaint.clusterId,
      workerId: worker._id
    });
    await task.save();

    // 4. Update complaint status
    complaint.status = "Verified";
    await complaint.save();

    // 5. (Optional) Notify worker
    console.log(`📢 Task assigned to worker ${worker.name} for complaint ${complaint._id}`);

    res.json({ success: true, task, message: "Worker assigned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
