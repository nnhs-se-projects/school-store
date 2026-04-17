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

    const parsePickupTime = (dateStr, timeRangeStr) => {
      const [startTime] = timeRangeStr.split(" - ");
      const [time, period] = startTime.trim().split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day, hours, minutes, 0, 0);
    };

    // Recompute timestamps for pending orders based on authoritative date/period values.
    const ordersToUpdate = await Order.find({
      orderStatus: { $ne: "completed" },
      date: { $exists: true, $ne: null },
      period: { $exists: true, $ne: null },
    });

    console.log(`Found ${ordersToUpdate.length} orders to update`);

    if (ordersToUpdate.length === 0) {
      console.log("No orders need updating");
      process.exit(0);
    }

    // Update each order
    let updatedCount = 0;
    for (const order of ordersToUpdate) {
      const pickupAt = parsePickupTime(order.date, order.period);
      const sendReminderTime = new Date(pickupAt);
      sendReminderTime.setHours(sendReminderTime.getHours() - 24);

      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            pickupAt,
            sendReminderTime,
          },
        },
      );

      console.log(
        `Updated order ${order.orderNumber}: pickupAt=${pickupAt.toISOString()}, sendReminderTime=${sendReminderTime.toISOString()}`,
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
