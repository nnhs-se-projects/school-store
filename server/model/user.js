const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  cart: [
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
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
