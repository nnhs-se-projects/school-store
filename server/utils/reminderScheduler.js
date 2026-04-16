const Order = require("../model/order");
const sendEmail = require("./sendEmail");

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

const reminderIntervalMs = Number.parseInt(
  process.env.ORDER_REMINDER_INTERVAL_MS || String(DEFAULT_INTERVAL_MS),
  10,
);

async function runOrderReminderCheck() {
  const now = new Date();

  const dueOrders = await Order.find({
    sendReminderTime: {
      $lte: now,
    },
    pickupAt: {
      $gte: now,
    },
    reminderSentAt: {
      $exists: false,
    },
    orderStatus: {
      $ne: "completed",
    },
  });

  for (const order of dueOrders) {
    const sent = await sendEmail.sendPickupReminderEmail(order);
    if (!sent) {
      continue;
    }

    await Order.updateOne(
      {
        _id: order._id,
        reminderSentAt: { $exists: false },
      },
      {
        $set: { reminderSentAt: new Date() },
      },
    );
  }
}

function startOrderReminderScheduler() {
  runOrderReminderCheck().catch((error) => {
    console.error("Initial reminder scheduler run failed:", error);
  });

  setInterval(() => {
    runOrderReminderCheck().catch((error) => {
      console.error("Reminder scheduler run failed:", error);
    });
  }, reminderIntervalMs);
}

module.exports = {
  startOrderReminderScheduler,
  runOrderReminderCheck,
};
