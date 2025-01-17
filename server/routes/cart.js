const express = require("express");
const route = express.Router();
const User = require("../model/user");
const Item = require("../model/item");

// Route to add items to the cart
route.post("/add", async (req, res) => {
  const { googleId, itemId, quantity } = req.body;

  const user = await User.findOne({ googleId });
  if (!user) {
    return res.status(404).send("User not found");
  }

  const item = await Item.findById(itemId);
  if (!item || item.quantity < quantity) {
    return res.status(400).send("Item not available or insufficient quantity");
  }

  const itemIndex = user.cart.findIndex(
    (cartItem) => cartItem.itemId.toString() === itemId
  );
  if (itemIndex > -1) {
    // If item already exists in the cart, update the quantity
    user.cart[itemIndex].quantity += quantity;
  } else {
    // If item does not exist in the cart, add it
    user.cart.push({ itemId, quantity });
  }

  // Update item quantity in inventory
  item.quantity -= quantity;
  await item.save();

  await user.save();
  res.status(200).send("Item added to cart");
});

// Route to get cart items
route.get("/:googleId", async (req, res) => {
  const user = await User.findOne({ googleId: req.params.googleId }).populate(
    "cart.itemId"
  );
  if (!user) {
    return res.status(404).send("User not found");
  }
  res.json(user.cart);
});

// Route to remove an item from the cart
route.post("/remove", async (req, res) => {
  const { googleId, itemId } = req.body;

  const user = await User.findOne({ googleId });
  if (!user) {
    return res.status(404).send("User not found");
  }

  const itemIndex = user.cart.findIndex(
    (cartItem) => cartItem.itemId.toString() === itemId
  );
  if (itemIndex > -1) {
    // Remove the item from the cart
    user.cart.splice(itemIndex, 1);
    await user.save();
    res.status(200).send("Item removed from cart");
  } else {
    res.status(400).send("Item not found in cart");
  }
});

module.exports = route;
