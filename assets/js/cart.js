document.addEventListener("DOMContentLoaded", (event) => {
  const warnUserOOSInput = document.getElementById("warningOOS");
  const warnUserQuantInput = document.getElementById("warningQuant");

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
    const quantitySelected = parseInt(
      document.querySelector(".quantity-selected").textContent.trim(),
      10
    );

    if (quantitySelected.length === 0) {
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

  const decreaseButtons = document.querySelectorAll(
    ".quantity-button-within[id^='decrease']"
  );
  const increaseButtons = document.querySelectorAll(
    ".quantity-button-within[id^='increase']"
  );

  decreaseButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const index = button.getAttribute("data-index");
      const quantityElement = button.nextElementSibling; // Get the next sibling element which displays the quantity
      let quantity = parseInt(quantityElement.textContent);

      if (quantity === 1) {
        const confirmRemoval = confirm(
          "Are you sure you want to remove this item from the cart?"
        );
        if (!confirmRemoval) {
          return;
        }
      }
      quantity -= 1;

      // Update the quantity of the item in the cart
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

  increaseButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const index = button.getAttribute("data-index");
      const quantityElement = button.previousElementSibling; // Get the previous sibling element which displays the quantity
      let quantity = parseInt(quantityElement.textContent);
      quantity += 1;

      // Update the quantity of the item in the cart
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

  const removeButtons = document.querySelectorAll(".remove-button");

  removeButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const index = button.getAttribute("data-index");
      const quantity = 0;
      const confirmRemoval = confirm(
        "Are you sure you want to remove this item from the cart?"
      );
      if (!confirmRemoval) {
        return;
      }

      // Remove the item from the cart
      const response = await fetch("/cart/updateQuant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ googleId, index, quantity }),
      });

      if (response.ok) {
        console.log("Item removed from cart");
        window.location.reload();
      } else {
        console.error("Failed to remove item from cart");
      }
    });
  });
});
