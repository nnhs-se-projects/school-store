/**
 * Routes for authentication using the Google Sign-In API
 */

// cSpell:ignoreRegExp /[^\s]{40,}/

const express = require("express");
const route = express.Router();

const { adminEmails } = require("../../whitelist.json");

const CLIENT_ID =
  "1022838194773-p8g5ac0qr11mfko61qurgnqdb9jitpjf.apps.googleusercontent.com";

// from: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token#node.js
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
  });
  const { sub, email } = ticket.getPayload();
  console.log(sub, email);
  const isAdmin = adminEmails.includes(email);
  console.log("isAdmin: ", isAdmin);
  return { email, isAdmin };
}

route.get("/", (req, res) => {
  res.render("auth");
});

route.post("/", async (req, res) => {
  const { email, isAdmin } = await verify(req.body.credential);
  req.session.email = email;
  req.session.isAdmin = isAdmin; // Store the isAdmin status in the session

  if (isAdmin) {
    // console.log("redirecting");
    return res.redirect("/admin"); // Redirect to /admin if the user is an admin
  }

  res.status(201).end();
});

function isAdmin(req, res, next) {
  console.log("checking if admin");
  if (req.session && req.session.isAdmin) {
    console.log("is admin");
    return next(); // Allow access to the next middleware or route
  } else {
    return res
      .status(403)
      .send("Forbidden: You do not have access to this page.");
  }
}

route.get("/admin", isAdmin, (req, res) => {
  // This will only be reached if the user is an admin
  console.log("rendering admin");
  res.render("admin"); // or any other content specific to admin users
});

module.exports = route;
