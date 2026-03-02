const nodemailer = require("nodemailer");

async function sendCancellationEmail(order) {
  if (!order || !order.email) {
    return;
  }

  const adminEmail = "napervillenorthschoolstore@gmail.com";
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: adminEmail,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  function printOrderItems(targetOrder) {
    let orderItems = "";
    for (let i = 0; i < targetOrder.items.length; i++) {
      orderItems += `- ${targetOrder.items[i].quantity} x ${targetOrder.items[i].size} ${targetOrder.items[i].name}\n`;
    }
    return orderItems;
  }

  const cancellationMessage =
    "We regret to inform you that your pick up time slot is no longer available. We apologize for the inconvenience, please reorder the item(s) and select a new pick up time. We appreciate your business"
    + "\n\nOriginal Order Items:\n" + printOrderItems(order);

  const mailOptions = {
    from: adminEmail,
    to: order.email,
    subject: "Order Canceled",
    text: cancellationMessage,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending cancellation email:", error);
  }
}

module.exports = sendCancellationEmail;