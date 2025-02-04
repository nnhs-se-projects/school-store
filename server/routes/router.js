const express = require("express");
const route = express.Router();

const User = require("../model/user");
const Item = require("../model/item");

/*
  How to create a get route

  route.get("/path", middleware, (req, res) => {
    path: the specified url or path you want to direct to
    middleware: a function that runs before the route handler (optional) (i.e isAdmin, to check if the user is an admin)
    req: the HTTP request object
    res: the HTTP response object

    res.render("view", { key: value, key: value, ... });

*/
// directs to the homepage
route.get("/", async (req, res) => {
  // get items from the database to display on the homepage
  const items = await Item.find();

  // format the items into a usable array
  const formattedItems = items.map((item) => {
    return {
      id: item._id,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image,
      size: item.size,
    };
  });

  // render the homePage view and pass the items to it
  res.render("homePage", {
    items: formattedItems,
  });
});

function isAdmin(req, res, next) {
  // check if the session exists (user is logged in), and if they are an admin
  if (req.session && req.session.isAdmin) {
    return next(); // Allow access to the next middleware or route
  } else {
    return res
      .status(403)
      .send("Forbidden: You do not have access to this page.");
  }
}

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

// uses the isAdmin middleware before rendering the page
route.get("/admin", isAdmin, (req, res) => {
  // This will only be reached if the user is an admin
  // console.log("Rendering admin page router");
  return res.render("admin");
});

// logout route
route.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out");
    }
    res.redirect("/");
  });
});

// displays product page for a specific item
route.get("/item/:id", async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.render("item", { item });
});

// directs to the add item page
route.get("/addItem", isAdmin, async (req, res) => {
  res.render("addItem");
});

// delegate all authentication to the auth.js router
route.use("/auth", require("./auth"));
route.use("/cart", require("./cart"));

module.exports = route;
