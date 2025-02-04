const express = require("express");
const route = express.Router();

const User = require("../model/user");
const Item = require("../model/item");

// directs to the cart page
route.get("/cart", async (req, res) => {
  try {
    const user = await User.findOne({
      googleId: req.session.user.googleId,
    }).populate("cart.itemId");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("cart", { cart: user.cart });
  } catch (error) {
    res.status(500).send("An error occurred while fetching the cart data");
  }
});

// Route to add items to the cart

// Route to get cart items
// not sure if this is needed or why its here
// route.get("/:googleId", async (req, res) => {
//   const user = await User.findOne({ googleId: req.params.googleId }).populate(
//     "cart.itemId"
//   );
//   if (!user) {
//     return res.status(404).send("User not found");
//   }
//   res.json(user.cart);
// });

// Route to remove an item from the cart
route.post("/cart/remove", async (req, res) => {
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
