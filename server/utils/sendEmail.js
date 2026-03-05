module.exports = { sendCancellationEmail, sendOrderEmails };

const nodemailer = require("nodemailer");

const adminEmail = "napervillenorthschoolstore@gmail.com";

async function sendCancellationEmail(order) {
  if (!order || !order.email) {
    return;
  }

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
    "We regret to inform you that your pick up time slot is no longer available. We apologize for the inconvenience, please reorder the item(s) and select a new pick up time. We appreciate your business" +
    "\n\nOriginal Order Items:\n" +
    printOrderItems(order);

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


async function sendOrderEmails(order, user, date) {
  function printOrder(order) {
    let orderDetails = `Student: ${order.name}\nEmail: ${order.email}\nPickup Date: ${date}\nPickup Time: ${order.period}\nTotal Cost: $${order.totalPrice}\nItems:\n`;
    for (let i = 0; i < order.items.length; i++) {
      orderDetails += `- ${order.items[i].quantity} x ${order.items[i].size} ${order.items[i].name}\n`;
    }
    return orderDetails;
  }

  // send email to user
  // Configure the transporter

  // console.log(process.env.EMAIL_PASSWORD);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: adminEmail,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const userEmailText =
    `Thank you for your order, ${user.name}!\n\nPlease bring CASH as well as your student ID to the school store to pay for your order at your designated date and period.\n\n` +
    printOrder(order) +
    `We appreciate your business!`;

  // Email details
  const userMailOptions = {
    from: adminEmail, // Replace with your email
    to: user.email, // Send to the user's email
    subject: "Order Confirmation",
    text: userEmailText,
  };

  try {
    await transporter.sendMail(userMailOptions);
    console.log("Order confirmation email sent to user");
  } catch (error) {
    console.error("Error sending email:", error);
  }

  const volunteerMailText =
    `New order received!\n\n` +
    printOrder(order) +
    `\n\nPlease check the order panel for more details.`;

  // send email to admin
  const volunteerMailOptions = {
    from: adminEmail,
    to: adminEmail,
    subject: "New Order Received",
    text: volunteerMailText,
  };

  try {
    await transporter.sendMail(volunteerMailOptions);
    console.log("Order notification email sent to admin");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
