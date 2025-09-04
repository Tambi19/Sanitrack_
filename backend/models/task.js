const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
  clusterId: { type: String, required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedCleaner: { type: String }, // optional: track cleaner name or ID
  description: { type: String, required: true },
  proof: { type: String },           // base64 image
  status: { type: String, enum: ["assigned","cleaning_done","completed"], default: "assigned" },
  assignedAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.model("Task", TaskSchema);
