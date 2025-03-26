document.addEventListener("DOMContentLoaded", (event) => {
  const warnUserOOSInput = document.getElementById("warningOOS");
  const warnUserQuantInput = document.getElementById("warningQuant");
  const quantitySelectors = document.querySelectorAll(
    "select.quantity-dropdown"
  );
  const checkoutButton = document.getElementById("checkout-button");
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

  checkoutButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent the default form submission
    if (quantitySelectors.length === 0) {
      alert(
        "Your cart is empty. Please add items to your cart before checking out."
      );
      return;
    }
    // Proceed with checkout if there are items in the cart

    const response = await fetch("/cart/checkout", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log("Checkout successful");
      window.location.href = "/cart/checkout"; // Redirect to checkout page
    } else {
      console.error("Failed to initiate checkout");
    }
  });

  console.log(quantitySelectors);
  quantitySelectors.forEach((button) => {
    // Perform actions on each button
    button.addEventListener("change", async (event) => {
      const quantity = event.target.value;
      const index = button.getAttribute("data-index");
      if (quantity === "0") {
        const confirmRemoval = confirm(
          "Are you sure you want to remove this item from the cart?"
        );
        if (!confirmRemoval) {
          event.target.value = button.getAttribute("data-original-quantity");
          return;
        }
      }

      const response = await fetch("/cart/updateQuant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ googleId, index, quantity }),
      });

      if (response.ok) {
        console.log("Item updated in cart");
        window.location.reload();
      } else {
        console.error("Failed to update item in cart");
      }
    });
  });
});
