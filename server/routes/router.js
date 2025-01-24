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

    res.render("view", { session: req.session, key: value, key: value, ... });
    IMPORTANT: payload the session (req.session) into EVERY get route in order for the header to work

*/

route.get("/", async (req, res) => {
  // console.log("path: ", req.path);

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

  // console.log("rendering homePage");
  // console.log("session: ", req.session);

  // render the homePage and payload the session and items
  res.render("homePage", {
    session: req.session,
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

route.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out");
    }
    res.redirect("/");
  });
});

// uses the isAdmin middleware before rendering the page
route.get("/admin", isAdmin, (req, res) => {
  // This will only be reached if the user is an admin
  // console.log("Rendering admin page router");
  return res.render("admin", { session: req.session, user: req.session.user });
});

route.post("/cart", async (req, res) => {
  const { googleId, itemId, quantity } = req.body;

  const user = await User.findOne({ googleId });

  if (!user) {
    return res.status(404).send("User not found");
  }

  const itemIndex = user.cart.findIndex(
    (item) => item.itemId.toString() === itemId
  );

  if (itemIndex > -1) {
    // If item already exists in the cart, update the quantity
    user.cart[itemIndex].quantity += quantity;
  } else {
    // If item does not exist in the cart, add it
    user.cart.push({ itemId, quantity });
  }

  await user.save();
  res.status(200).send("Item added to cart");
});

// delegate all authentication to the auth.js router
route.use("/auth", require("./auth"));

module.exports = route;
