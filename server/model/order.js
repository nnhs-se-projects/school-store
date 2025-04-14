const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  period: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: mongoose.Types.Decimal128,
    required: true,
  },
  orderNumber: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "pending",
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
      quantity: {
        type: Number,
        required: true,
        default: 0,
      },
      size: {
        type: String,
        required: false,
      },
      sizeIndex: {
        type: Number,
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },
  ],
  // Add other fields as necessary
});

module.exports = mongoose.model("Order", OrderSchema);
