const express = require("express");
const route = express.Router();
const Entry = require("../model/entry");
const User = require("../model/user");
const Item = require("../model/item");

// easy way to assign static data (e.g., array of strings) to a variable
const habitsOfMind = require("../model/habitsOfMind.json");

// pass a path (e.g., "/") and a callback function to the get method
//  when the client makes an HTTP GET request to the specified path,
//  the callback function is executed
route.get("/", async (req, res) => {
  // the req parameter references the HTTP request object, which has
  //  a number of properties
  console.log("path: ", req.path);

  const entries = await Entry.find();
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

  // convert MongoDB objects to objects formatted for the EJS template
  const formattedEntries = entries.map((entry) => {
    return {
      id: entry._id,
      date: entry.date.toLocaleDateString(),
      habit: entry.habit,
      content: entry.content.slice(0, 20) + "...",
    };
  });

  // the res parameter references the HTTP response object
  res.render("homePage", {
    entries: formattedEntries,
    items: formattedItems,
  });
});

route.get("/admin", async (req, res) => {
  res.render("admin");
});

route.get("/createEntry", (req, res) => {
  res.render("createEntry", { habits: habitsOfMind });
});

route.post("/createEntry", async (req, res) => {
  const entry = new Entry({
    // When the time zone offset is absent, date-only forms are interpreted as
    //  a UTC time and date-time forms are interpreted as a local time. We want
    //  the date object to reflect local time; so add a time of midnight.
    date: new Date(req.body.date + "T00:00:00"),
    email: req.session.email,
    habit: req.body.habit,
    content: req.body.content,
  });
  await entry.save();

  res.status(201).end();
});

route.get("/editEntry/:id", async (req, res) => {
  const entry = await Entry.findById(req.params.id);
  console.log(entry);
  res.send(entry);
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
