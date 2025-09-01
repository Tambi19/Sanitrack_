const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
  clusterId: String,
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Assigned", "Completed"], default: "Assigned" },
  assignedAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.model("Task", TaskSchema);
