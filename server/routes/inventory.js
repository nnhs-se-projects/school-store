const express = require("express");
const route = express.Router();
const Item = require("../model/item");

// Route to add a new item
route.post("/addItem", async (req, res) => {
  const { name, price, quantity, description, image } = req.body.item;
  const item = new Item({ name, price, quantity, description, image });
  await item.save();
  res.status(201).json(item);
});

// Route to update item quantity
route.put("/:id", async (req, res) => {
  const { quantity } = req.body;
  const item = await Item.findByIdAndUpdate(
    req.params.id,
    { quantity },
    { new: true }
  );
  res.json(item);
});

route.post("/editItem/:id", async (req, res) => {
  const { name, price, quantity, description, image } = req.body.item;

  console.log(name, price, quantity, description, image);
  let item;
  if (image !== null) {
    console.log("image is not null");
    item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, price, quantity, description, image },
      { new: true }
    );
  } else {
    item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, price, quantity, description },
      { new: true }
    );
  }

  res.json(item);
});

module.exports = route;
