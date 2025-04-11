/**
 * Routes for authentication using the Google Sign-In API
 */

// cSpell:ignoreRegExp /[^\s]{40,}/

const express = require("express");
const route = express.Router();

const { adminEmails, volunteerEmails } = require("../../whitelist.json");

const CLIENT_ID =
  "409921621424-4at7hadkvuvrcvjh25fvgggqkahk78eh.apps.googleusercontent.com";

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

  const domain = email.split("@")[1];
  const isAdmin = adminEmails.includes(email);
  const isVolunteer = volunteerEmails.includes(email);

  let clearance = 0;
  // Clearance 0 is used for people who don't login, should have same permissions as clearance 1

  if (isAdmin) {
    // Users have the ability to access all systems, including but not limited to viewing orders and managing inventory
    console.log("Admin email: ", email);
    clearance = 4;
  } else if (isVolunteer) {
    // Users have the ability to view orders, but can't manage inventory
    console.log("Volunteer email: ", email);
    clearance = 3;
  } else if (domain === "stu.naperville203.org") {
    // Users have the ability to place orders, but can't view orders or manage inventory
    console.log("Student email: ", email);
    clearance = 2;
  } else {
    // Only used in the case a user logs in and is not a student. Cannot place orders, but can view store
    console.log("Non-student email: ", email);
    clearance = 1;
  }

  console.log("Clearance: ", clearance);
  return { googleId: sub, email, name, clearance };
}

route.post("/", async (req, res) => {
  try {
    const { googleId, email, name, clearance } = await verify(
      req.body.credential
    );
    let user = await User.findOne({ googleId });

    if (!user) {
      console.log("Creating new user");
      user = new User({ googleId, email, name });
      await user.save();
    }
    req.session.email = email;
    req.session.clearance = clearance;
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
