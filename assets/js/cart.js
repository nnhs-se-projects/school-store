const warnUserOOSInput = document.getElementById("warningOOS");
const warnUserQuantInput = document.getElementById("warningQuant");
const quantitySelectors = document.querySelectorAll("select.quantity-dropdown");
const googleId = document.getElementById("googleId").value;

if (warnUserOOSInput.value === "true") {
  // If the warning input is present, display the alert
  const message =
    "Warning: One or more items in your cart are out of stock and have been removed. Please check your cart for details.";
  alert(message);
}

if (warnUserQuantInput.value === "true") {
  // If the warning input is present, display the alert
  const message =
    "Warning: One or more items in your cart have insufficient quantity in stock. Please check your cart for details.";
  alert(message);
}

quantitySelectors.forEach((button) => {
  // Perform actions on each button
  button.addEventListener("change", async (event) => {
    const itemId = button.getAttribute("data-id");
    const quantity = event.target.value;

    const response = await fetch("/cart/updateQuant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ googleId, itemId, quantity }),
    });

    if (response.ok) {
      console.log("Item updated in cart");
      // Optionally, you can refresh the cart or update the UI here
    } else {
      console.error("Failed to update item in cart");
    }
  });
});
