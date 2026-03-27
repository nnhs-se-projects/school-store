module.exports = {
  sendCancellationEmail,
  sendOrderEmails,
  sendPickupReminderEmail,
};

const User = require("../model/user");
const EmailText = require("../model/emailText");
const nodemailer = require("nodemailer");

const adminEmail = "napervillenorthschoolstore@gmail.com";

function processEmbeddedText(text, order, user, date) {
  const studentNameBlocks = text.split("<student name>");
  let studentNameProcessed = studentNameBlocks[0];
  for (let i = 1; i < studentNameBlocks.length; i++) {
    const block = studentNameBlocks[i];

    studentNameProcessed += user.name + block;
  }

  const fullOrderBlocks = studentNameProcessed.split("<full order>");
  let fullOrderProcessed = fullOrderBlocks[0];
  for (let i = 1; i < fullOrderBlocks.length; i++) {
    const block = fullOrderBlocks[i];

    let orderDetails = `Student: ${order.name}\nEmail: ${order.email}\nPickup Date: ${date}\nPickup Time: ${order.period}\nTotal Cost: $${order.totalPrice}\nItems:\n`;
    for (let i = 0; i < order.items.length; i++) {
      orderDetails += `- ${order.items[i].quantity} x ${order.items[i].size} ${order.items[i].name}\n`;
    }

    fullOrderProcessed += orderDetails + block;
  }

  const orderItemsBlocks = fullOrderProcessed.split("<order items>");
  let orderItemsProcessed = orderItemsBlocks[0];
  for (let i = 1; i < orderItemsBlocks.length; i++) {
    const block = orderItemsBlocks[i];

    let orderItems = "";
    for (let i = 0; i < order.items.length; i++) {
      orderItems += `- ${order.items[i].quantity} x ${order.items[i].size} ${order.items[i].name}\n`;
    }

    orderItemsProcessed += orderItems + block;
  }

  return orderItemsProcessed;
}

async function sendCancellationEmail(order) {
  const cancelStudentTextEntry = await EmailText.findOne({ name: "cancel student text" });
  const user = await User.findOne({ email: order.email });

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

  const unformattedDate = new Date(order.date);
  const date = unformattedDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  const cancellationMessage = processEmbeddedText(cancelStudentTextEntry.text, order, user, date);

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
  const confirmStoreTextEntry = await EmailText.findOne({ name: "confirm store text" });
  const confirmStudentTextEntry = await EmailText.findOne({ name: "confirm student text" });

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

  const userEmailText = processEmbeddedText(confirmStudentTextEntry.text, order, user, date);

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

  const volunteerMailText = processEmbeddedText(confirmStoreTextEntry.text, order, user, date);

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

async function sendPickupReminderEmail(order) {
  if (!order || !order.email) {
    return false;
  }

  const reminderTextEntry = await EmailText.findOne({ name: "pickup reminder text" });
  const user = await User.findOne({ email: order.email });
  const safeUser = user || { name: order.name || "Student", email: order.email };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: adminEmail,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const unformattedDate = new Date(order.date);
  const date = unformattedDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  const fallbackMessage =
    "Hi " +
    safeUser.name +
    ",\n\n" +
    "This is a reminder that your School Store order will be ready for pickup in 24 hours.\n\n" +
    "Pickup Date: " +
    date +
    "\n" +
    "Pickup Time: " +
    order.period +
    "\n" +
    "Order Number: " +
    order.orderNumber +
    "\n\n" +
    "Thanks for ordering from the School Store!";

  const reminderMessage = reminderTextEntry
    ? processEmbeddedText(reminderTextEntry.text, order, safeUser, date)
    : fallbackMessage;

  const mailOptions = {
    from: adminEmail,
    to: order.email,
    subject: "Pickup Reminder",
    text: reminderMessage,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending pickup reminder email:", error);
    return false;
  }
}
