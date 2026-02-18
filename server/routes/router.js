const express = require("express");
const route = express.Router();

// const User = require("../model/user");
const Item = require("../model/item");
const Order = require("../model/order");
const Time = require("../model/time");
const { format } = require("morgan");
const xlsx = require("../exportXLSX");

/*
  How to create a get route

  route.get("/path", middleware, (req, res) => {
    path: the specified url or path you want to direct to
    middleware: a function that runs before the route handler (optional) (i.e isAdmin, to check if the user is an admin)
    req: the HTTP request object
    res: the HTTP response object

    res.render("view", { key: value, key: value, ... });

*/
// directs to the homepage
route.get("/", async (req, res) => {
  // get items from the database to display on the homepage
  const items = await Item.find();

  // format the items into a usable array
  const formattedItems = items.map((item) => {
    return {
      id: item._id,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image,
      size: item.size,
    };
  });

  console.log(req.session);

  const times = await Time.find().sort({ date: 1 });
  /* for (const time of times) {
    console.log(time.date + " " + time.times);
  } */
  const query = req.query;

  // render the homePage view and pass the items to it
  res.render("homePage", {
    items: formattedItems,
    times,
    query,
  });
});

function isAdmin(req, res, next) {
  // check if the session exists (user is logged in), and if they are an admin
  if (req.session && req.session.clearance >= 4) {
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

// function isStudent(req, res, next) {
//   // check if the session exists (user is logged in), and if they are an admin
//   if (req.session && req.session.clearance >= 2) {
//     return next(); // Allow access to the next middleware or route
//   } else {
//     return res
//       .status(403)
//       .send("Forbidden: You must be a student to access this page.");
//   }
// }

function isStudent(req, res, next) {
  // check if the session exists (user is logged in), and if they are an admin
  if (req.session && req.session.clearance >= 2) {
    return next(); // Allow access to the next middleware or route
  } else {
    return res.status(403).render("errorPage", {
      title: "Access Denied",
      message: "You must be a student to access this page",
      redirectUrl: "/",
    });
  }
}

// uses the isAdmin middleware before rendering the page
route.get("/admin", isVolunteer, (req, res) => {
  // This will only be reached if the user is an admin
  // console.log("Rendering admin page router");
  return res.render("admin");
});

// logout route
route.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out");
    }
    // res.clearCookie("connect.sid"); // Clear the session cookie
    res.redirect("/");
  });
});

route.get("/addItem", isAdmin, (req, res) => {
  // render the addItem view
  res.render("addItem");
});

// routes for getting admin inventory pages
route.get("/inventorylist", isAdmin, async (req, res) => {
  const items = await Item.find();

  const formattedItems = items.map((item) => {
    return {
      id: item._id,
      name: item.name,
      quantity: item.quantity,
      sizes: item.sizes,
    };
  });

  res.render("inventorylist", {
    items: formattedItems,
  });
});

route.get("/inventorylistprint", isAdmin, async (req, res) => {
  const items = await Item.find();

  const formattedItems = items.map((item) => {
    return {
      id: item._id,
      name: item.name,
      quantity: item.quantity,
      sizes: item.sizes,
    };
  });

  res.render("inventorylistprint", {
    items: formattedItems,
  });
});

// Helper function to clean up times outside the visible calendar range
async function cleanupOldTimes() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate the range: previous 2 weeks to future 2 weeks
  const startOfPreviousTwoWeeks = new Date(today);
  startOfPreviousTwoWeeks.setDate(today.getDate() - 14 - today.getDay()); // Sunday of previous 2 weeks

  const endOfNextTwoWeeks = new Date(today);
  endOfNextTwoWeeks.setDate(today.getDate() + (27 - today.getDay())); // Saturday of next 2 weeks

  console.log(
    "Cleanup Range - Keep dates between:",
    startOfPreviousTwoWeeks,
    "and",
    endOfNextTwoWeeks,
  );

  // Delete all times outside this range
  const result = await Time.deleteMany({
    $or: [
      { date: { $lt: startOfPreviousTwoWeeks } },
      { date: { $gt: endOfNextTwoWeeks } },
    ],
  });

  console.log(
    `Deleted ${result.deletedCount} time entries outside the visible range`,
  );
}

route.get("/setTimes", isAdmin, async (req, res) => {
  // Clean up times outside the visible calendar range
  await cleanupOldTimes();

  const times = await Time.find().sort({ date: 1 });
  const query = req.query;
  res.render("setTimes", { times, query });
});

route.post("/setTimes", isAdmin, async (req, res) => {
  const { date, openTime, closeTime, offset } = req.body;
  let timeEntry = await Time.findOne({ date: new Date(date + "T12:00:00") });
  if (timeEntry) {
    timeEntry.times.push({ openTime, closeTime });
  } else {
    timeEntry = new Time({
      date: new Date(date + "T12:00:00"),
      times: [{ openTime, closeTime }],
    });
  }
  await timeEntry.save();
  const redirectUrl =
    typeof offset !== "undefined"
      ? "/setTimes?offset=" + encodeURIComponent(offset)
      : "/setTimes";
  res.redirect(redirectUrl);
});

function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") {
    return NaN;
  }

  const trimmed = timeStr.trim();

  // Handles admin time input format: "HH:MM" (24-hour)
  if (!trimmed.includes("AM") && !trimmed.includes("PM")) {
    const [hours, minutes] = trimmed.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return NaN;
    }
    return hours * 60 + minutes;
  }

  // Handles order period format: "h:mm AM/PM"
  const [time, period] = trimmed.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return NaN;
  }

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }
  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

function parsePeriodToMinutes(period) {
  if (!period || typeof period !== "string") {
    return null;
  }

  const [periodStart, periodEnd] = period.split("-").map((part) => part.trim());
  const startMinutes = timeToMinutes(periodStart);
  const endMinutes = timeToMinutes(periodEnd);

  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) {
    return null;
  }

  return { startMinutes, endMinutes };
}

function slotContainsPeriod(slot, period) {
  if (!slot) {
    return false;
  }

  const periodMinutes = parsePeriodToMinutes(period);
  if (!periodMinutes) {
    return false;
  }

  const slotOpenMinutes = timeToMinutes(slot.openTime);
  const slotCloseMinutes = timeToMinutes(slot.closeTime);

  if (Number.isNaN(slotOpenMinutes) || Number.isNaN(slotCloseMinutes)) {
    return false;
  }

  return (
    periodMinutes.startMinutes >= slotOpenMinutes &&
    periodMinutes.endMinutes <= slotCloseMinutes
  );
}

async function restoreInventoryAndDeleteOrder(order) {
  for (let i = 0; i < order.items.length; i++) {
    const orderItem = order.items[i];
    const item = await Item.findById(orderItem.itemId);

    if (!item) {
      throw new Error("Item not found in inventory");
    }

    const size = orderItem.size;
    item.sizes[size] += orderItem.quantity;
    await item.save();
  }

  await Order.findByIdAndDelete(order._id);
}

route.post("/editTime", isAdmin, async (req, res) => {
  const { date, index, openTime, closeTime, action, offset } = req.body;
  const setTimesRedirectUrl =
    typeof offset !== "undefined"
      ? "/setTimes?offset=" + encodeURIComponent(offset)
      : "/setTimes";
  const timeEntry = await Time.findOne({ date: new Date(date + "T12:00:00") });
  if (!timeEntry || !timeEntry.times[index]) {
    return res.status(404).render("errorPage", {
      message: "Time slot not found",
      redirectUrl: setTimesRedirectUrl,
    });
  }

  const ordersForDate = await Order.find({ date });
  const updatedTimes = [...timeEntry.times];

  if (action === "delete") {
    updatedTimes.splice(index, 1);
  } else {
    updatedTimes[index] = { openTime, closeTime };
  }

  const blockedOrders = ordersForDate.filter((order) => {
    return !updatedTimes.some((slot) => slotContainsPeriod(slot, order.period));
  });

  if (blockedOrders.length > 0) {
    const blockedEmails = [
      ...new Set(
        blockedOrders.map((order) => order.email).filter((email) => !!email),
      ),
    ];
    const emailSuffix =
      blockedEmails.length > 0
        ? ` Students with affected orders: ${blockedEmails.join(", ")}.`
        : "";

    return res.status(409).render("errorPage", {
      message:
        "WARNING this time slot has an order that is placed in this interval. Please contact the student and let them know of the time change" +
        emailSuffix,
      redirectUrl: setTimesRedirectUrl,
      overrideActionUrl: "/editTime/override",
      overridePayload: {
        date,
        index,
        openTime,
        closeTime,
        action,
        offset,
      },
      overrideButtonLabel: "Update Anyway",
    });
  }

  if (action === "delete") {
    timeEntry.times.splice(index, 1);
  } else {
    timeEntry.times[index] = { openTime, closeTime };
  }
  await timeEntry.save();
  const redirectUrl =
    typeof offset !== "undefined"
      ? "/setTimes?offset=" + encodeURIComponent(offset)
      : "/setTimes";
  res.redirect(redirectUrl);
});

route.post("/editTime/override", isAdmin, async (req, res) => {
  try {
    const { date, index, openTime, closeTime, action, offset } = req.body;
    const redirectUrl =
      typeof offset !== "undefined"
        ? "/setTimes?offset=" + encodeURIComponent(offset)
        : "/setTimes";
    const timeEntry = await Time.findOne({
      date: new Date(date + "T12:00:00"),
    });

    if (!timeEntry || !timeEntry.times[index]) {
      return res.status(404).render("errorPage", {
        message: "Time slot not found",
        redirectUrl,
      });
    }

    const ordersForDate = await Order.find({ date });
    const updatedTimes = [...timeEntry.times];

    if (action === "delete") {
      updatedTimes.splice(index, 1);
    } else {
      updatedTimes[index] = { openTime, closeTime };
    }

    const blockedOrders = ordersForDate.filter((order) => {
      return !updatedTimes.some((slot) =>
        slotContainsPeriod(slot, order.period),
      );
    });

    if (action === "delete") {
      timeEntry.times.splice(index, 1);
    } else {
      timeEntry.times[index] = { openTime, closeTime };
    }

    for (let i = 0; i < blockedOrders.length; i++) {
      if (blockedOrders[i].orderStatus !== "completed") {
        await restoreInventoryAndDeleteOrder(blockedOrders[i]);
      }
    }

    await timeEntry.save();
    res.redirect(redirectUrl);
  } catch (error) {
    return res.status(500).render("errorPage", {
      message: "Unable to apply override and cancel conflicting orders.",
      redirectUrl: "/setTimes",
    });
  }
});

// generate and return XLSX file for inventory list
route.get("/inventorylist/xlsx", isAdmin, async (req, res) => {
  const items = await Item.find();

  // see /server/exportXLSX.js for maintainability note on XLSX worksheet data
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let trackRow = 1;
  let sheetData = "<sheetData>";
  let mergeCells = "";
  const mergeCellsRows = []; // track which rows should have merged cells (item name headers)
  let maxMergeLength = 0;
  // create <sheetData> data
  for (let i = 0; i < items.length; i++) {
    // put each item in the spreadsheet
    // item name header
    sheetData += `<row r="${trackRow}"><c r="A${trackRow}" t="inlineStr"><is><t>${items[i].name}</t></is></c></row>`;
    mergeCellsRows.push(trackRow);
    trackRow++;

    // item sizes/variants
    sheetData += `<row r="${trackRow}">`;
    let sizeCount = 0;
    for (const size in items[i].sizes) {
      // note: `items[i].sizes` is an object, `size` are keys
      sheetData += `<c r="${abc[sizeCount] + trackRow}" t="inlineStr"><is><t>${size}</t></is></c>`;
      sizeCount++;
    }
    if (sizeCount > maxMergeLength) {
      // adjust `maxMergeLength` as needed
      maxMergeLength = sizeCount;
    }
    sheetData += `</row>`;
    trackRow++;
  }
  sheetData += "</sheetData>";
  // create <mergeCells> data
  if (mergeCellsRows.length !== 0) {
    mergeCells = `<mergeCells count="${mergeCellsRows.length}">`;
    for (const row of mergeCellsRows) {
      mergeCells += `<mergeCell ref="A${row}:${abc[maxMergeLength]}${row}"/>`;
    }
    mergeCells += `</mergeCells>`;
  }

  const xlsxSheetXML = sheetData + mergeCells; // combine into worksheet XML

  const xlsxDownload = await xlsx.exportXLSX([
    xlsx.createSheet("Inventory List", xlsxSheetXML),
  ]); // data URI string

  res.json({ xlsxDownload });
});

route.get("/contact", async (req, res) => {
  res.render("contact");
});

// displays product page for a specific item
route.get("/item/:id", async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.render("itemPage", { item });
});

route.get("/editItem/:id", isAdmin, async (req, res) => {
  const item = await Item.findById(req.params.id);
  console.log("prehandled sizes", item.sizes);
  const formattedItem = {
    id: item._id,
    name: item.name,
    price: item.price,
    description: item.description,
    image: item.image,
    sizes: item.sizes,
  };
  console.log("grabbed sizes:", formattedItem.sizes);
  res.render("editItem", { item: formattedItem });
});

route.get("/manageItems", isAdmin, async (req, res) => {
  const items = await Item.find();

  const formattedItems = items.map((item) => {
    return {
      id: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      description: item.description,
      image: item.image,
      size: item.size,
    };
  });

  res.render("manageItems", { items: formattedItems });
});

// route to delete an item by its id
route.get("/deleteItem/:id", isAdmin, async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.redirect("/manageItems");
});

// delegate all authentication to the auth.js router
route.use("/auth", require("./auth"));

module.exports = route;
