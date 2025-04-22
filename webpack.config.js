const path = require("path");

module.exports = {
  entry: {
    addItem: "./assets/js/addItem.js", // Entry point for addItem.js
    editItem: "./assets/js/editItem.js", // Entry point for editItem.js
  },
  output: {
    filename: "[name].bundle.js", // Output file name pattern (e.g., addItem.bundle.js, editItem.bundle.js)
    path: path.resolve(__dirname, "dist"), // Output directory
  },
  mode: "production", // Use "production" for optimized builds
};
