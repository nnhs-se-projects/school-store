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
const User = require("../model/user");

const client = new OAuth2Client();
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
  });
  const { sub, email, name } = ticket.getPayload();
  console.log(sub, email, name);
  const isAdmin = adminEmails.includes(email);
  console.log("isAdmin: ", isAdmin);
  return { googleId: sub, email, name, isAdmin };
}

route.post("/", async (req, res) => {
  try {
    const { googleId, email, name, isAdmin } = await verify(
      req.body.credential
    );
    let user = await User.findOne({ googleId });

    if (!user) {
      console.log("Creating new user");
      user = new User({ googleId, email, name });
      await user.save();
    }
    req.session.email = email;
    req.session.isAdmin = isAdmin;
    req.session.user = user;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).send("Internal Server Error");
      }
      // Session saved successfully, send a response
      res.status(200).send("Authentication successful");
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = route;
