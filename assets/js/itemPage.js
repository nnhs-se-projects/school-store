// js for adding item to a cart

document.addEventListener("DOMContentLoaded", function () {
  const sizeSelector = document.getElementById("size");
  const quantitySelector = document.getElementById("quantity");
  const toggleImageButton = document.getElementById("toggle-image");
  const primaryImage = document.getElementById("primary-image");
  const secondaryImage = document.getElementById("secondary-image");

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

  sizeSelector.addEventListener("change", function () {
    updateQuantityOptions();
  });

  const addToCartButton = document.getElementById("add-to-cart");
  const itemId = document.getElementById("itemId").value;
  const googleId = document.getElementById("googleId").value;

  toggleImageButton.addEventListener("click", () => {
    if (primaryImage.style.display === "none") {
      primaryImage.style.display = "block";
      secondaryImage.style.display = "none";
      toggleImageButton.textContent = "View Alternate Image";
    } else {
      primaryImage.style.display = "none";
      secondaryImage.style.display = "block";
      toggleImageButton.textContent = "View Primary Image";
    }
  });

  addToCartButton.addEventListener("click", async () => {
    const size = sizeSelector.value;
    const sizeIndex = sizeSelector.selectedIndex;
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
