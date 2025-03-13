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
    let warnUserOOS = false;
    let warnUserQuant = false;
    const maxQuantities = [];
    for (let i = 0; i < user.cart.length; i++) {
      const item = await Item.findById(user.cart[i].itemId);

      if (!item) {
        user.cart.splice(i, 1);
        await user.save();
        i--; // Adjust index after removal
        warnUserOOS = true; // Item not found in inventory
        console.log("Item not found in inventory: ", user.cart[i].itemId);
      } else if (item.quantity < user.cart[i].quantity) {
        warnUserQuant = true; // Item quantity is less than requested
        user.cart[i].quantity = item.quantity;
        await user.save();
        maxQuantities[i] = item.sizes[user.cart[i].size];

        userCart.push({
          id: item._id,
          name: item.name,
          price: item.price,
          size: user.cart[i].size,
          quantity: user.cart[i].quantity,
          image: item.image,
        });
      } else {
        maxQuantities[i] = item.sizes[user.cart[i].size];
        userCart.push({
          id: item._id,
          name: item.name,
          price: item.price,
          size: item.sizes[user.cart[i].sizeIndex],
          quantity: user.cart[i].quantity,
          image: item.image,
        });
      }
    }
    console.log("User cart: ", userCart);
    console.log("Max quantities: ", maxQuantities);
    res.render("cart", {
      cart: userCart,
      warnOOS: warnUserOOS,
      warnQuant: warnUserQuant,
      maxQuantity: maxQuantities,
    });
  } catch (error) {
    res.status(500).send("An error occurred while fetching the cart data");
  }
});

route.post("/cart/add", async (req, res) => {
  console.log("Adding item to cart");
  console.log(req.body);
  const { googleId, itemId, quantity, size, sizeIndex } = req.body;

  const user = await User.findOne({ googleId });
  if (!user) {
    console.log("User not found: ", googleId);
    return res.status(404).send("User not found");
  }

  const item = await Item.findById(itemId);
  if (!item || item.sizes[sizeIndex] < quantity) {
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
    user.cart.push({ itemId, quantity, size, sizeIndex });
  }

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
route.post("/cart/updateQuant", async (req, res) => {
  console.log("Updating item quantity in cart");
  const { googleId, itemId, quantity } = req.body;

  console.log(quantity);
  const user = await User.findOne({ googleId });
  if (!user) {
    return res.status(404).send("User not found");
  }

  const item = await Item.findById(itemId);
  if (!item) {
    return res.status(400).send("Item not found");
  }

  const itemIndex = user.cart.findIndex(
    (cartItem) => cartItem.itemId.toString() === itemId
  );

  console.log("item index:" + itemIndex);
  if (itemIndex > -1) {
    if (quantity <= 0) {
      // If the new quantity is 0 or less, remove the item from the cart
      user.cart.splice(itemIndex, 1);
    }
    // If item already exists in the cart, update the quantity
    user.cart[itemIndex].quantity = quantity;
  }

  await user.save();
  res.status(200).send("Item quantity updated in cart");
});

module.exports = route;
