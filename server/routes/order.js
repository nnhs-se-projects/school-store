const express = require("express");
const route = express.Router();

const User = require("../model/user");
const Item = require("../model/item");
const Order = require("../model/order");
const nodemailer = require("nodemailer");

// Route to remove an order
route.post("/order/remove", async (req, res) => {
  try {
    const { orderNumber } = req.body;

    if (!orderNumber) {
      return res.status(400).json({ error: "Order number is required" });
    }

    const deletedOrder = await Order.findOneAndDelete({ orderNumber });

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // TODO: Send an email to the user that their order has been canceled

    res
      .status(200)
      .json({ message: "Order removed successfully", order: deletedOrder });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while removing the order" });
  }
});

route.post("/order/fulfill", async (req, res) => {
  try {
    const { orderNumber } = req.body;

    if (!orderNumber) {
      return res.status(400).json({ error: "Order number is required" });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderNumber },
      { status: "Fulfilled" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Order fulfilled successfully", order: updatedOrder });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fulfilling the order" });
  }
});

module.exports = route;
