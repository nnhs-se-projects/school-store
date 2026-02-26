// js for adding item to a cart

document.addEventListener("DOMContentLoaded", function () {
  const sizeSelector = document.getElementById("size");
  const quantitySelector = document.getElementById("quantity");

  function updateQuantityOptions() {
    let maxQuantity;
    if (!sizeSelector) {
      maxQuantity = document.getElementById("placeholder").value; // Fallback to a placeholder value if sizeSelector is not present
    } else {
      const selectedOption = sizeSelector.options[sizeSelector.selectedIndex];
      maxQuantity = parseInt(selectedOption.getAttribute("data-quantity"), 10);
    }

    // Clear existing options
    quantitySelector.innerHTML = "";

    // Add new options based on the selected size's quantity

    for (let i = 1; i <= Math.min(10, maxQuantity); i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      quantitySelector.appendChild(option);
    }
  }

  // updates the quantity when the webpage first loads
  updateQuantityOptions();

  if (sizeSelector) {
    sizeSelector.addEventListener("change", function () {
      updateQuantityOptions();
    });
  }

  const addToCartButton = document.getElementById("add-to-cart");
  const itemId = document.getElementById("itemId").value;
  if (document.getElementById("googleId").value !== "") {
    const googleId = document.getElementById("googleId").value;

    addToCartButton.addEventListener("click", async () => {
      const size = sizeSelector ? sizeSelector.value : "placeholder";
      const sizeIndex = sizeSelector ? sizeSelector.selectedIndex : 0;
      const quantity = document.getElementById("quantity").value;
      console.log("googleID: ", googleId);
      const response = await fetch("/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ googleId, itemId, quantity, size, sizeIndex }),
      });

      if (response.ok) {
        window.location = "/cart";
      } else {
        console.error("error adding item to cart");
      }
    });
  } else {
    // FIXME: users who have access level 1 should also not be able to add to cart
    addToCartButton.addEventListener("click", () => {
      alert("Please log in as a student to add items to your cart.");
    });
  }
});
