const express = require("express");
const route = express.Router();

const User = require("../model/user");
const Item = require("../model/item");

// pass a path (e.g., "/") and a callback function to the get method
//  when the client makes an HTTP GET request to the specified path,
//  the callback function is executed
route.get("/", async (req, res) => {
  // the req parameter references the HTTP request object, which has
  //  a number of properties
  console.log("path: ", req.path);

  const items = await Item.find();

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

  console.log("rendering homePage");
  console.log("session: ", req.session);
  // the res parameter references the HTTP response object
  res.render("homePage", {
    session: req.session,
    items: formattedItems,
  });
});

function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next(); // Allow access to the next middleware or route
  } else {
    return res
      .status(403)
      .send("Forbidden: You do not have access to this page.");
  }
}

route.get("/admin", isAdmin, (req, res) => {
  // This will only be reached if the user is an admin
  console.log("Rendering admin page router");
  return res.render("admin", { user: req.session.user });
}); // or any other content specific to admin users

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
