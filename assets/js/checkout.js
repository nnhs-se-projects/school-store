document.addEventListener("DOMContentLoaded", (event) => {
  const googleId = document.getElementById("googleId").value;
  const checkoutButton = document.getElementById("checkout-button");

  checkoutButton.addEventListener("click", async (event) => {
    const pickUpDate = document.getElementById("pickup-date").value;
    const pickUpPeriod = document.getElementById("pickup-time").value;
    const totalCost = document.getElementById("total-cost").value;
    if (!pickUpDate || !pickUpPeriod) {
      alert("Please fill in all fields before proceeding to checkout.");
      return;
    }
    confirm(
      "All orders must be paid for IN CASH at the time of pickup at the school store. "
    );
    const response = await fetch("/cart/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ googleId, pickUpDate, pickUpPeriod, totalCost }),
    });

    if (response.ok) {
      console.log("Checkout successful");
      window.location.href = "/cart/confirmation";
    } else {
      console.error("Failed to checkout");
    }
  });
});
