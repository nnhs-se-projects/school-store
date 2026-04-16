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
    type: String,
    required: true,
  },
  pickupAt: {
    type: Date,
    required: false,
  },
  sendReminderTime: {
    type: Date,
    required: false,
  },
  reminderSentAt: {
    type: Date,
    required: false,
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
      price: {
        type: mongoose.Types.Decimal128,
        required: false,
      },
    },
  ],
  // Add other fields as necessary
});

OrderSchema.index({ sendReminderTime: 1, reminderSentAt: 1, orderStatus: 1 });

module.exports = mongoose.model("Order", OrderSchema);
