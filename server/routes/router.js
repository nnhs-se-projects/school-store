const express = require("express");
const route = express.Router();

// const User = require("../model/user");
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
  if (req.session && req.session.clearance >= 4) {
    return next(); // Allow access to the next middleware or route
  } else {
    return res
      .status(403)
      .send("Forbidden: You do not have access to this page.");
  }
}

function isVolunteer(req, res, next) {
  // check if the session exists (user is logged in), and if they are an volunteer or admin
  if (req.session && req.session.clearance >= 3) {
    return next(); // Allow access to the next middleware or route
  } else {
    return res
      .status(403)
      .send("Forbidden: You do not have access to this page.");
  }
}

function isStudent(req, res, next) {
  // check if the session exists (user is logged in), and if they are an admin
  if (req.session && req.session.clearance >= 2) {
    return next(); // Allow access to the next middleware or route
  } else {
    return res
      .status(403)
      .send("Forbidden: You do not have access to this page.");
  }
}

// uses the isAdmin middleware before rendering the page
route.get("/admin", isVolunteer, (req, res) => {
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

route.get("/addItem", isAdmin, (req, res) => {
  // render the addItem view
  res.render("addItem");
});

route.get("/inventorylist", isAdmin, async (req, res) => {
  const items = await Item.find();

  const formattedItems = items.map((item) => {
    return {
      id: item._id,
      name: item.name,
      quantity: item.quantity,
      sizes: item.sizes,
    };
  });

  res.render("inventorylist", {
    items: formattedItems,
  });
});

route.get("/inventorylistprint", isAdmin, async (req, res) => {
  const items = await Item.find();

  const formattedItems = items.map((item) => {
    return {
      id: item._id,
      name: item.name,
      quantity: item.quantity,
      sizes: item.sizes,
    };
  });

  res.render("inventorylistprint", {
    items: formattedItems,
  });
});

// displays product page for a specific item
route.get("/item/:id", async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.render("itemPage", { item });
});

route.get("/editItem/:id", isAdmin, async (req, res) => {
  const item = await Item.findById(req.params.id);
  console.log("prehandled sizes", item.sizes);
  const formattedItem = {
    id: item._id,
    name: item.name,
    price: item.price,
    description: item.description,
    image: item.image,
    sizes: item.sizes,
  };
  console.log("grabbed sizes:", formattedItem.sizes);
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

route.get("/item/:id", async (req, res) => {
  const item = await Item.findById(req.params.id);

  const formattedItem = {
    id: item._id,
    name: item.name,
    price: item.price,
    description: item.description,
    image: item.image,
  };

  res.render("itemPage", { item: formattedItem });
});

// delegate all authentication to the auth.js router
route.use("/auth", require("./auth"));

module.exports = route;
