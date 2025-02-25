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
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  sizes: {
    type: Map,
    of: Number,
    default: {},
  },
  // Add other fields as necessary
});

module.exports = mongoose.model("Item", ItemSchema);
