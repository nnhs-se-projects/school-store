const express = require("express");
const route = express.Router();
const Item = require("../model/item");

// Route to get all items
route.get("/", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Route to add a new item
route.post("/", async (req, res) => {
  const { name, quantity } = req.body;
  const item = new Item({ name, quantity });
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

module.exports = route;
