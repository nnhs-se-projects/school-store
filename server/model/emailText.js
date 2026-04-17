const mongoose = require("mongoose");

const EmailTextSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  }
});

const SplashContentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
});

module.exports = {
  EmailText: mongoose.model("EmailText", EmailTextSchema),
  SplashContent: mongoose.model("SplashContent", SplashContentSchema),
};
