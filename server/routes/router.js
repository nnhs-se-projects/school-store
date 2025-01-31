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

// uses the isAdmin middleware before rendering the page
route.get("/admin", isAdmin, (req, res) => {
  // This will only be reached if the user is an admin
  // console.log("Rendering admin page router");
  return res.render("admin", { user: req.session.user });
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

route.get("/item/:id", async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.render("item", { item });
});
// directs to the add item page
route.get("/addItem", isAdmin, async (req, res) => {
  res.render("addItem");
});

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

// delegate all authentication to the auth.js router
route.use("/auth", require("./auth"));

module.exports = route;
