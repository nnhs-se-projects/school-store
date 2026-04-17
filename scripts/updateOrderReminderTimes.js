/**
 * Migration script to set sendReminderTime for existing orders
 * Run this once to backfill sendReminderTime for all orders that have pickupAt but no sendReminderTime
 * 
 * Usage: node scripts/updateOrderReminderTimes.js
 */

require("dotenv").config();
const connectDB = require("../server/database/connection");
const Order = require("../server/model/order");

async function updateOrderReminderTimes() {
  try {
    await connectDB();
    console.log("Database connected");

    // Find all orders that have pickupAt but no sendReminderTime
    const ordersToUpdate = await Order.find({
      pickupAt: { $exists: true, $ne: null },
      sendReminderTime: { $exists: false },
    });

    console.log(`Found ${ordersToUpdate.length} orders to update`);

    if (ordersToUpdate.length === 0) {
      console.log("No orders need updating");
      process.exit(0);
    }

    // Update each order
    let updatedCount = 0;
    for (const order of ordersToUpdate) {
      const sendReminderTime = new Date(order.pickupAt);
      sendReminderTime.setHours(sendReminderTime.getHours() - 24);

      await Order.updateOne(
        { _id: order._id },
        { $set: { sendReminderTime: sendReminderTime } },
      );

      console.log(
        `Updated order ${order.orderNumber}: sendReminderTime set to ${sendReminderTime.toISOString()}`,
      );
      updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} orders`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating orders:", error);
    process.exit(1);
  }
}

updateOrderReminderTimes();
