const mongoose = require("mongoose");

const EmailTextSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("EmailText", EmailTextSchema);
