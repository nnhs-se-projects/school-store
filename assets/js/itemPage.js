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
  addToCartButton.addEventListener("click", async () => {
    const size = sizeSelector?.value || "placeholder";
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
