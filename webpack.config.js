const path = require("path");

module.exports = {
  entry: "./assets/js/addItem.js", // Path to your main JavaScript file
  output: {
    filename: "bundle.js", // The bundled file name
    path: path.resolve(__dirname, "dist"), // Output directory
  },
  mode: "production", // Use "production" for optimized builds
};
