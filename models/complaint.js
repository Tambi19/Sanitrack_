const mongoose = require("mongoose");

// Complaint.js
const ComplaintSchema = new mongoose.Schema({
  clusterId: { type: String, required: true },
  toiletNo: { type: String, required: true },   // <-- changed from Number to String
  feedback: { type: String, required: true },   // <-- removed enum restriction
  status: { type: String, enum: ["Pending", "Verified", "Resolved"], default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Complaint", ComplaintSchema);
