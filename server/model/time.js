const mongoose = require("mongoose");

const TimeSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  times: [{
    openTime: {
      type: String,
      required: true,
    },
    closeTime: {
      type: String,
      required: true,
    },
  }],
  // Add other fields as necessary
});

module.exports = mongoose.model("Time", TimeSchema);