const warnUserOOSInput = document.getElementById("warningOOS");
const warnUserQuantInput = document.getElementById("warningQuant");
const removeButton = document.querySelector("button.remove-item");
const quantityButton = document.querySelector("button.update-quantity");
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

removeButton.addEventListener("click", async () => {
  const itemId = removeButton.getAttribute("data-id");
  const response = await fetch("/cart/remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      googleId,
      itemId,
    }),
  });
  if (response.ok) {
    window.location.reload();
  } else {
    console.error("Error removing item from cart");
  }
});
