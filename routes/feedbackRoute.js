const express = require("express");
const Complaint = require("../models/complaint");
const User = require("../models/user");
const router = express.Router();

const THRESHOLD = 15; // e.g. notify after 5 complaints

router.post("/", async (req, res) => {
  try {
    const { clusterId, toiletNo, feedback } = req.body;

    // 1. Save complaint (status = Pending by default)
    const complaint = new Complaint({ clusterId, toiletNo, feedback, status: "Pending" });
    await complaint.save();

    // 2. Count complaints for this cluster
    const count = await Complaint.countDocuments({
      clusterId,
      status: "Pending"
    });

    console.log(`Cluster ${clusterId} has ${count} pending complaints.`);

    // 3. If threshold exceeded, notify volunteers
    if (count >= THRESHOLD) {
      const volunteers = await User.find({ role: "Volunteer", assignedClusters: clusterId });
      console.log(`📢 Threshold reached! Notifying volunteers:`, volunteers.map(v => v.name));

      // TODO: send SMS/email/popup to volunteers
    }

    res.json({ success: true, complaint, message: "Complaint logged successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
