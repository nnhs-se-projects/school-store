// js for adding item to a cart

document.addEventListener("DOMContentLoaded", function () {
  const sizeSelector = document.getElementById("size");
  const quantitySelector = document.getElementById("quantity");
  const addToCartBtn = document.getElementById("add-to-cart");

  function updateQuantityOptions() {

    const sizeSelectorText = sizeSelector ? Object.keys(itemSizes)[sizeSelector.selectedIndex] : "N/A";
    const maxQuantity = itemSizes[sizeSelectorText] - itemsInOrders[formatItemNameAndSize(itemName, sizeSelectorText)]; // `itemSizes`, `itemName`, `itemsInOrders`, and `formatItemNameAndSize` are defined in the EJS

    // Clear existing options
    quantitySelector.innerHTML = "";

    if (maxQuantity === 0) {
      addToCartBtn.disabled = true;
      addToCartBtn.value = "Size/Type Out of Stock";

      const option = document.createElement("option");
      option.value = 0;
      option.textContent = "0";
      quantitySelector.appendChild(option);
    } else {
      addToCartBtn.disabled = false;
      addToCartBtn.value = "Add to Cart";

      // Add new options based on the selected size's quantity

      for (let i = 1; i <= Math.min(10, maxQuantity); i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        quantitySelector.appendChild(option);
      }
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
  addToCartButton.addEventListener("click", async () => {
    const size = sizeSelector?.value || "N/A";
    const sizeIndex = sizeSelector?.selectedIndex || 0;
    const quantity = document.getElementById("quantity").value;

    const response = await fetch("/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId, quantity, size, sizeIndex }),
    });

    if (response.ok) return (window.location = "/cart");
    if ([401, 403].includes(response.status))
      return alert("Please log in as a student to add items to your cart.");

    console.error("error adding item to cart");
  });
});
