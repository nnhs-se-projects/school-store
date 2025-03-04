const express = require("express");
const route = express.Router();
const Item = require("../model/item");

// Route to add or update a size in an item
route.post("/addSize/:id", async (req, res) => {
  const { size, quantity } = req.body;
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    item.sizes.set(size, quantity);
    await item.save();
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a size from an item
route.delete("/deleteSize/:id/:size", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    item.sizes.delete(req.params.size);
    await item.save();
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = route;
