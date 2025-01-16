/**
 * Routes for authentication using the Google Sign-In API
 */

// cSpell:ignoreRegExp /[^\s]{40,}/

const express = require("express");
const route = express.Router();

const CLIENT_ID =
  "1022838194773-p8g5ac0qr11mfko61qurgnqdb9jitpjf.apps.googleusercontent.com";

// from: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token#node.js
const { OAuth2Client } = require("google-auth-library");
const User = require("../model/user");

const client = new OAuth2Client();
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
  });
  const { sub, email, name } = ticket.getPayload();
  console.log(sub, email, name);
  return { googleId: sub, email, name };
}

route.get("/", (req, res) => {
  res.render("auth");
});

route.post("/", async (req, res) => {
  const { googleId, email, name } = await verify(req.body.credential);
  let user = await User.findOne({ googleId });

  if (!user) {
    console.log("Creating new user");
    user = new User({ googleId, email, name });
    await user.save();
  }

  req.session.email = email;
  res.status(201).end();
});

route.post("/cart", async (req, res) => {
  const { googleId, itemId, quantity } = req.body;

  const user = await User.findOne({ googleId });

  if (!user) {
    return res.status(404).send("User not found");
  }

  const itemIndex = user.cart.findIndex(
    (item) => item.itemId.toString() === itemId
  );

  if (itemIndex > -1) {
    // If item already exists in the cart, update the quantity
    user.cart[itemIndex].quantity += quantity;
  } else {
    // If item does not exist in the cart, add it
    user.cart.push({ itemId, quantity });
  }

  await user.save();
  res.status(200).send("Item added to cart");
});

module.exports = route;
