const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  role: { type: String, enum: ["Admin", "Volunteer", "Worker"], required: true },
  phone: { type: String, required: true },
  assignedClusters: [String] // ["CL-12", "CL-15"]
});

module.exports = mongoose.model("User", UserSchema);
