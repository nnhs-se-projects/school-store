const express = require("express");
const route = express.Router();

const User = require("../model/user");
const Item = require("../model/item");
const Order = require("../model/order");
const Time = require("../model/time");
const nodemailer = require("nodemailer");

const xlsx = require("../exportXLSX");

function isStudent(req, res, next) {
  // check if the session exists (user is logged in), and if they are an admin
  if (req.session && req.session.clearance >= 2) {
    return next(); // Allow access to the next middleware or route
  } else {
    return res.status(403).render("errorPage", {
      title: "Access Denied",
      message: "Forbidden: You do not have access to this page.",
      redirectUrl: "/",
    });
  }
}

function isVolunteer(req, res, next) {
  // check if the session exists (user is logged in), and if they are a volunteer or admin
  if (req.session && req.session.clearance >= 3) {
    return next(); // Allow access to the next middleware or route
  } else {
    return res.status(403).render("errorPage", {
      title: "Access Denied",
      message: "Forbidden: You do not have access to this page.",
      redirectUrl: "/",
    });
  }
}

async function createXLSXWithOrders(orders) {
  // see /server/exportXLSX.js for maintainability note on XLSX worksheet data

  function getABC(n) { // used for getting column name strings
    const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let row = "";
    let trackN = n;
    while (trackN >= 0) {
      row = abc[trackN % 26] + row;
      trackN = Math.floor(trackN / 26) - 1;
    }

    return row; // note that XLSX only supports columns A (0) through XFD (16383)
  }

  const items = await Item.find();

  // create the headers
  let ordersXML = '<sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Order Number</t></is></c><c r="B1" t="inlineStr"><is><t>Name</t></is></c><c r="C1" t="inlineStr"><is><t>Email</t></is></c><c r="D1" t="inlineStr"><is><t>Date</t></is></c><c r="E1" t="inlineStr"><is><t>Period</t></is></c><c r="F1" t="inlineStr"><is><t>Total Price</t></is></c><c r="G1" t="inlineStr"><is><t>Status</t></is></c></row>';
  let orderItemsXML = '<sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Order Number</t></is></c>';

  // order item headers
  const itemColumnMap = new Map(); // create a Map to map different items (and sizes/variants) to a column in the spreadsheet

  let columnCount = 1; // keep track of the next open column
  for (let i = 0; i < items.length; i++) {
    const sizes = Object.keys(items[i].sizes).sort((a, b) => a.localeCompare(b)); // sort objects by their sizes/variants for consistency
    for (const size of sizes) {
      const itemDesc = items[i].name + " " + size;

      itemColumnMap.set(itemDesc, columnCount);

      orderItemsXML += `<c r="${getABC(columnCount)}1" t="inlineStr"><is><t>${itemDesc}</t></is></c>`;

      columnCount++;
    }
  }
  orderItemsXML += '</row>';

  // add the orders into the sheets
  for (let row = 2; row < orders.length + 2; row++) {
    // add order info
    const order = orders[row - 2];
    ordersXML += `<row r="${row}"><c r="A${row}"><v>${order.orderNumber}</v></c><c r="B${row}" t="inlineStr"><is><t>${order.name}</t></is></c><c r="C${row}" t="inlineStr"><is><t>${order.email}</t></is></c><c r="D${row}" t="inlineStr"><is><t>${order.date}</t></is></c><c r="E${row}" t="inlineStr"><is><t>${order.period}</t></is></c><c r="F${row}"><v>${order.totalPrice}</v></c><c r="G${row}" t="inlineStr"><is><t>${order.orderStatus}</t></is></c></row>`;
    
    // add order items
    orderItemsXML += `<row r="${row}"><c r="A${row}"><v>${order.orderNumber}</v></c>`; // order number
    const orderItems = order.items.sort((a, b) => (itemColumnMap.get(a.name + " " + a.size) - itemColumnMap.get(b.name + " " + b.size)));
    for (const item of orderItems) {
      const itemDesc = item.name + " " + item.size;
      const itemColumn = itemColumnMap.get(itemDesc);
      
      orderItemsXML += `<c r="${getABC(itemColumn)}${row}"><v>${item.quantity}</v></c>`; // order items
    }
    orderItemsXML += `</row>`;
  }
  ordersXML += '</sheetData>';
  orderItemsXML += '</sheetData>';

  orderItemsXML = `<cols><col min="2" max="${columnCount}" width="20" customWidth="1"/></cols>` + orderItemsXML; // adjust column width for order items

  const xlsxDownload = await xlsx.exportXLSX([
    xlsx.createSheet("Orders", ordersXML),
    xlsx.createSheet("Order Items", orderItemsXML)
  ]); // data URI string
  
  return xlsxDownload;
}

// directs to the cart page
route.get("/cart", isStudent, async (req, res) => {
  try {
    const user = await User.findOne({
      googleId: req.session.user.googleId,
    });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const userCart = [];
    let warnUserOOS = false;
    let warnUserQuant = false;
    const maxQuantities = [];
    for (let i = 0; i < user.cart.length; i++) {
      const item = await Item.findById(user.cart[i].itemId);
      const itemInventoryQuantity = item.sizes[user.cart[i].size];

      if (!item) {
        user.cart.splice(i, 1);
        await user.save();
        i--; // Adjust index after removal
        warnUserOOS = true; // Item not found in inventory
        console.log("Item not found in inventory: ", user.cart[i].itemId);
      } else if (itemInventoryQuantity < user.cart[i].quantity) {
        warnUserQuant = true; // Item quantity is less than requested
        console.log(
          "Item quantity is less than requested: ",
          item.name,
          user.cart[i].size,
        );
        user.cart[i].quantity = itemInventoryQuantity;
        await user.save();
        maxQuantities[i] = itemInventoryQuantity;

        userCart.push({
          id: item._id,
          name: item.name,
          price: item.price,
          size: user.cart[i].size,
          quantity: user.cart[i].quantity,
          image: item.image,
        });
      } else {
        maxQuantities[i] = itemInventoryQuantity;
        userCart.push({
          id: item._id,
          name: item.name,
          price: item.price,
          size: user.cart[i].size,
          quantity: user.cart[i].quantity,
          image: item.image,
        });
      }
    }

    // console.log("User cart: ", userCart);
    // console.log("Max quantities: ", maxQuantities);
    res.render("cart", {
      cart: userCart,
      warnOOS: warnUserOOS,
      warnQuant: warnUserQuant,
      maxQuantity: maxQuantities,
    });
  } catch (error) {
    res.status(500).send("An error occurred while fetching the cart data");
  }
});

route.post("/cart/add", async (req, res) => {
  console.log("Adding item to cart");
  console.log(req.body);
  const { googleId, itemId, quantity, size, sizeIndex } = req.body;

  const user = await User.findOne({ googleId });
  if (!user) {
    console.log("User not found: ", googleId);
    return res.status(404).send("User not found");
  }

  const item = await Item.findById(itemId);
  if (!item || item.sizes[sizeIndex] < quantity) {
    return res.status(400).send("Item not available or insufficient quantity");
  }

  const itemIndex = user.cart.findIndex(
    (cartItem) => cartItem.itemId.toString() === itemId,
  );
  if (itemIndex > -1 && user.cart[itemIndex].size === size) {
    // If item already exists in the cart, update the quantity
    user.cart[itemIndex].quantity =
      parseInt(user.cart[itemIndex].quantity) + parseInt(quantity);
  } else {
    // If item does not exist in the cart, add it
    user.cart.push({ itemId, quantity, size, sizeIndex, name: item.name });
  }

  await item.save();

  await user.save();
  res.status(200).send("Item added to cart");
});

// Route to add items to the cart

// Route to get cart items
// not sure if this is needed or why its here
// route.get("/:googleId", async (req, res) => {
//   const user = await User.findOne({ googleId: req.params.googleId }).populate(
//     "cart.itemId"
//   );
//   if (!user) {
//     return res.status(404).send("User not found");
//   }
//   res.json(user.cart);
// });

// Route to remove an item from the cart

route.post("/cart/updateQuant", async (req, res) => {
  console.log("Updating item quantity in cart");
  const { googleId, index, quantity } = req.body;

  console.log(quantity);
  const user = await User.findOne({ googleId });
  if (!user) {
    return res.status(404).send("User not found");
  }

  console.log("item index:" + index);
  if (index > -1) {
    if (quantity <= 0) {
      // If the new quantity is 0 or less, remove the item from the cart
      user.cart.splice(index, 1);
    } else {
      // If item already exists in the cart, update the quantity
      user.cart[index].quantity = quantity;
    }
  }

  await user.save();
  res.status(200).send("Item quantity updated in cart");
});

route.get("/cart/checkout", async (req, res) => {
  // Check if user is logged in
  if (!req.session || !req.session.user) {
    return res.status(401).render("errorPage", {
      title: "Unauthorized",
      message: "Please log in to access checkout.",
      redirectUrl: "/auth/login",
    });
  }

  const user = await User.findOne({
    googleId: req.session.user.googleId,
  });
  if (!user) {
    return res.status(404).send("User not found");
  }

  const cartItems = [];
  for (let i = 0; i < user.cart.length; i++) {
    const item = await Item.findById(user.cart[i].itemId);
    if (item) {
      cartItems.push({
        id: item._id,
        name: item.name,
        price: item.price,
        size: user.cart[i].size,
        quantity: user.cart[i].quantity,
        image: item.image,
      });
    }
  }

  // Query store hours for next two weeks only (starting tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
  twoWeeksFromNow.setHours(23, 59, 59, 999);

  const storeHours = await Time.find({
    date: { $gte: tomorrow, $lte: twoWeeksFromNow },
  }).sort({ date: 1 });

  res.render("checkoutPage", { cart: cartItems, storeHours });
});

route.post("/cart/order", async (req, res) => {
  console.log("Placing order");
  const { googleId, pickUpDate, pickUpPeriod, totalCost } = req.body;

  const user = await User.findOne({ googleId });

  if (!user) {
    return res.status(404).send("User not found");
  }

  // generate order number
  const orderNum = Math.floor(Math.random() * 1000000);

  const order = {
    name: user.name,
    email: user.email,
    date: pickUpDate,
    period: pickUpPeriod,
    totalPrice: totalCost,
    orderNumber: orderNum,
    orderStatus: "pending",
    items: user.cart,
  };

  console.log("Order details:", order);

  const newOrder = new Order(order);
  try {
    await newOrder.save();
  } catch (error) {
    console.error("Error saving order:", error);
    return res.status(500).send("Error placing order");
  }

  const unformattedDate = new Date(order.date);
  const date = unformattedDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  // change inventory quantities
  for (let i = 0; i < order.items.length; i++) {
    const item = await Item.findById(order.items[i].itemId);
    if (item) {
      // console.log("Item found in inventory: ", item.name);
      // const sizeIndex = order.items[i].sizeIndex;
      // console.log("Item size: ", order.items[i].size);
      // console.log("Item size index: ", sizeIndex);
      // console.log("Item quantity ordered: ", order.items[i].quantity);
      // console.log("Item inventory quantity: ", item.sizes[size]);
      // console.log("Item size quantity array: ", item.sizes);
      const size = order.items[i].size;
      item.sizes[size] -= order.items[i].quantity;
      await item.save();
      console.log(
        "Item inventory updated: ",
        item.name,
        size,
        item.sizes[size],
      );
    } else {
      console.log("Item not found in inventory: ", order.items[i].itemId);
      return res.status(404).send("Item not found in inventory");
    }
  }

  user.cart = [];
  await user.save();
  res.status(200).send("Order placed");

  function printOrder(order) {
    let orderDetails = `Student: ${order.name}\nEmail: ${order.email}\nPickup Date: ${date}\nPickup Period: ${order.period}\nTotal Cost: $${order.totalPrice}\nItems:\n`;
    for (let i = 0; i < order.items.length; i++) {
      orderDetails += `- ${order.items[i].quantity} x ${order.items[i].size} ${order.items[i].name}\n`;
    }
    return orderDetails;
  }

  // send email to user
  // Configure the transporter

  const adminEmail = "napervillenorthschoolstore@gmail.com";
  // console.log(process.env.EMAIL_PASSWORD);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "napervillenorthschoolstore@gmail.com",
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
    to: "napervillenorthschoolstore@gmail.com",
    subject: "New Order Received",
    text: volunteerMailText,
  };

  try {
    await transporter.sendMail(volunteerMailOptions);
    console.log("Order notification email sent to admin");
  } catch (error) {
    console.error("Error sending email:", error);
  }

  console.log("Order placed successfully and emails sent");
});

route.get("/cart/confirmation", async (req, res) => {
  res.render("confirmationPage");
});

route.get("/orderViewer", isVolunteer, async (req, res) => {
  const orders = await Order.find({}).sort({ date: 1 });

  const pendingOrders = orders.filter(
    (order) => order.orderStatus !== "completed",
  );

  res.render("orderViewer", {
    pendingOrders,
  });
});

route.get("/orderViewer/xlsx", isVolunteer, async (req, res) => {
  const orders = await Order.find({}).sort({ date: 1 });

  const pendingOrders = orders.filter(
    (order) => order.orderStatus !== "completed"
  );

  const xlsxDownload = await createXLSXWithOrders(pendingOrders);

  res.json({xlsxDownload});
});

route.get("/completedOrderViewer", isVolunteer, async (req, res) => {
  const completedOrders = await Order.find({ orderStatus: "completed" }).sort({
    date: -1,
  });
  res.render("completedOrderViewer", { completedOrders });
});

route.get("/completedOrderViewer/xlsx", isVolunteer, async (req, res) => {
  const completedOrders = await Order.find({ orderStatus: "completed" }).sort({
    date: -1,
  });

  const xlsxDownload = await createXLSXWithOrders(completedOrders);

  res.json({xlsxDownload});
});

route.post("/deleteOrder", async (req, res) => {
  const orderId = req.body.orderId;
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    for (let i = 0; i < order.items.length; i++) {
      const item = await Item.findById(order.items[i].itemId);
      if (item) {
        const size = order.items[i].size;
        item.sizes[size] += order.items[i].quantity;
        await item.save();
        console.log(
          "Item inventory updated: ",
          item.name,
          size,
          item.sizes[size],
        );
      } else {
        console.log("Item not found in inventory: ", order.items[i].itemId);
        return res.status(404).send("Item not found in inventory");
      }
    }

    await Order.findByIdAndDelete(orderId);
    res.status(200).send("Order deleted successfully");
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send("Error deleting order");
  }
});

route.post("/checkOffOrder", async (req, res) => {
  const orderId = req.body.orderId;
  console.log("orderId: " + orderId);
  const orderToUpdate = await Order.findById(orderId);
  if (!orderToUpdate) {
    return res.status(404).send("Order not found");
  }
  orderToUpdate.orderStatus = "completed";
  res.status(200).send("Order checked off successfully");
  await orderToUpdate.save();
});

module.exports = route;
