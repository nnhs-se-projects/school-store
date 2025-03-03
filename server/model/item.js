const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: mongoose.Types.Decimal128,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  size: {
    type: String,
  },
  // Add other fields as necessary
});

module.exports = mongoose.model("Item", ItemSchema);
