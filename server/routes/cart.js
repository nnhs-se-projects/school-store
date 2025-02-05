const express = require("express");
const route = express.Router();

const User = require("../model/user");
const Item = require("../model/item");

// directs to the cart page
route.get("/cart", async (req, res) => {
  try {
    const user = await User.findOne({
      googleId: req.session.user.googleId,
    });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const userCart = [];
    for (let i = 0; i < user.cart.length; i++) {
      const item = await Item.findById(user.cart[i].itemId);
      userCart.push({
        itemId: item._id,
        name: item.name,
        price: item.price,
        quantity: user.cart[i].quantity,
      });
    }

    res.render("cart", { cart: userCart });
  } catch (error) {
    res.status(500).send("An error occurred while fetching the cart data");
  }
});

route.post("/cart/add", async (req, res) => {
  console.log("Adding item to cart");
  console.log(req.body);
  const { googleId, itemId, quantity } = req.body;

  const user = await User.findOne({ googleId });
  if (!user) {
    console.log("User not found: ", googleId);
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
    user.cart[itemIndex].quantity =
      parseInt(user.cart[itemIndex].quantity) + parseInt(quantity);
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
