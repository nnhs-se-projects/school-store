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

route.get("/addItem", isAdmin, async (req, res) => {
  res.render("addItem");
});

route.get("/inventory", isAdmin, async (req, res) => {
  const items = await Item.find();

  const formattedItems = items.map((item) => {
    return {
      id: item._id,
      name: item.name,
      quantity: item.quantity,
    };
  });

  res.render("inventory", {
    items: formattedItems,
  });
})

route.get("/inventoryprint", isAdmin, async (req, res) => {
  const items = await Item.find();

  const formattedItems = items.map((item) => {
    return {
      id: item._id,
      name: item.name,
      quantity: item.quantity,
    };
  });

  res.render("inventoryprint", {
    items: formattedItems,
  });
})

route.get("/editItem/:id", isAdmin, async (req, res) => {
  const item = await Item.findById(req.params.id);
  const formattedItem = {
    id: item._id,
    name: item.name,
    price: item.price,
    description: item.description,
    quantity: item.quantity,
    image: item.image,
    size: item.size,
  };
  res.render("editItem", { item: formattedItem });
});

route.get("/manageItems", isAdmin, async (req, res) => {
  const items = await Item.find();

  const formattedItems = items.map((item) => {
    return {
      id: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      description: item.description,
      image: item.image,
      size: item.size,
    };
  });

  res.render("manageItems", { items: formattedItems });
});

// route to delete an item by its id
route.get("/deleteItem/:id", isAdmin, async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.redirect("/manageItems");
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
