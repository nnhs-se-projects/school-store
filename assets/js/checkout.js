document.addEventListener("DOMContentLoaded", (event) => {
  const googleId = document.getElementById("googleId").value;
  const checkoutButton = document.getElementById("checkout-button");

  checkoutButton.addEventListener("click", async (event) => {
    confirm(
      "All orders must be paid for IN CASH at the time of pickup at the school store. "
    );
    const response = await fetch("/cart/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ googleId }),
    });

    if (response.ok) {
      console.log("Checkout successful");
      window.location.href = "/cart/checkout";
    } else {
      console.error("Failed to checkout");
    }
  });
});
