/**
 * Manual test script for pickup reminder emails.
 *
 * Usage:
 *   node scripts/testPickupReminderEmail.js --orderNumber=123456
 *   node scripts/testPickupReminderEmail.js --email=student@example.com
 */

require("dotenv").config();

const connectDB = require("../server/database/connection");
const Order = require("../server/model/order");
const sendEmail = require("../server/utils/sendEmail");

function getArgValue(flagName) {
  const arg = process.argv.find((entry) => entry.startsWith(`${flagName}=`));
  return arg ? arg.split("=")[1] : null;
}

async function run() {
  try {
    const orderNumberArg = getArgValue("--orderNumber");
    const emailArg = getArgValue("--email");

    if (!orderNumberArg && !emailArg) {
      console.error("Missing required argument. Provide --orderNumber=<num> or --email=<address>.");
      process.exit(1);
    }

    await connectDB();

    const filter = orderNumberArg
      ? { orderNumber: Number.parseInt(orderNumberArg, 10) }
      : { email: emailArg, orderStatus: { $ne: "completed" } };

    const order = await Order.findOne(filter).sort({ pickupAt: 1 });

    if (!order) {
      console.error("No matching order found.");
      process.exit(1);
    }

    console.log(
      `Sending pickup reminder test for order #${order.orderNumber} to ${order.email} (pickup: ${order.date} ${order.period})`,
    );

    const sent = await sendEmail.sendPickupReminderEmail(order);

    if (!sent) {
      console.error("Reminder test failed. Check template/email config logs.");
      process.exit(1);
    }

    console.log("Reminder test sent successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to run pickup reminder test:", error);
    process.exit(1);
  }
}

run();
