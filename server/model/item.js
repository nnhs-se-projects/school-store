const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  sizes: {
    type: Map,
    of: {
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
    default: {},
  },
  // Add other fields as necessary
});

module.exports = mongoose.model("Item", ItemSchema);
