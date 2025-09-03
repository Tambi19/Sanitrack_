// models/led.js
const mongoose = require("mongoose");

const LedSchema = new mongoose.Schema({
  clusterId: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ["clean", "dirty", "in_progress"], // added in_progress (yellow)
    default: "clean" 
  },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Led", LedSchema);
