// js for adding item to a cart

const addToCartButton = document.getElementById("addToCart");

addToCartButton.addEventListener("click", async () => {
  const itemId = document.getElementById("itemId").value;
  const quantity = document.getElementById("quantity").value;

  const response = await fetch("/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ googleId, itemId, quantity }),
  });

  if (response.ok) {
    window.location = "/cart";
  } else {
    console.error("error adding item to cart");
  }
});
