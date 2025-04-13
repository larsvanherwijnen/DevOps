const mongoose = require("mongoose");

const TrackingSchema = new mongoose.Schema({
  orderId: mongoose.Schema.Types.ObjectId,
  trackingNumber: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Tracking", TrackingSchema);