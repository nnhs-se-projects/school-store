const warnUserInput = document.getElementById("warning");
if (warnUserInput.value === "true") {
  // If the warning input is present, display the alert
  const message =
    "Warning: One or more items in your cart are out of stock and have been removed. Please check your cart for details.";
  alert(message);
}
