const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "volunteer", "cleaner"], required: true }, // changed Worker → cleaner
  clusterId: { type: String, required: function() { return this.role === "cleaner" || this.role === "volunteer"; } }, // single cluster
  phone: String
});

module.exports = mongoose.model("User", UserSchema);
