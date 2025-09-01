const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  clusterId: { type: String, required: true },
  toiletNo: Number,
  feedback: { type: String, enum: ["Clean", "Dirty", "Needs Cleaning"], required: true },
  status: { type: String, enum: ["Pending", "Verified", "Resolved"], default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
