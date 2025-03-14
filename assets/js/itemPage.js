// js for adding item to a cart

document.addEventListener("DOMContentLoaded", function () {
  const sizeSelector = document.getElementById("size");
  const quantitySelector = document.getElementById("quantity");

  function updateQuantityOptions() {
    const selectedOption = sizeSelector.options[sizeSelector.selectedIndex];
    const maxQuantity = parseInt(
      selectedOption.getAttribute("data-quantity"),
      10
    );

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

  sizeSelector.addEventListener("change", function () {
    updateQuantityOptions();
  });

  const addToCartButton = document.getElementById("add-to-cart");
  const itemId = document.getElementById("itemId").value;
  const googleId = document.getElementById("googleId").value;
  const size = sizeSelector.value;
  const sizeIndex = sizeSelector.selectedIndex;

  addToCartButton.addEventListener("click", async () => {
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
});
