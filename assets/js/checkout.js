document.addEventListener("DOMContentLoaded", (event) => {
  const googleId = document.getElementById("googleId").value;
  const checkoutButton = document.getElementById("checkout-button");
  const pickupDateSelect = document.getElementById("pickup-date");
  const pickupTimeSelect = document.getElementById("pickup-time");

  // Function to format date string for comparison
  function localDateString(d) {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Populate time options when a date is selected
  pickupDateSelect.addEventListener("change", function () {
    const selectedDate = this.value;
    pickupTimeSelect.innerHTML =
      '<option value="" disabled selected>Select a time</option>';
    pickupTimeSelect.disabled = false;

    // Find matching store hours
    const matchingEntry = storeHoursData.find((entry) => {
      return localDateString(entry.date) === selectedDate;
    });

    if (matchingEntry && matchingEntry.times) {
      matchingEntry.times.forEach((timeSlot) => {
        const option = document.createElement("option");
        option.value = `${timeSlot.openTime} - ${timeSlot.closeTime}`;
        option.textContent = `${timeSlot.openTime} - ${timeSlot.closeTime}`;
        pickupTimeSelect.appendChild(option);
      });
    }
  });

  checkoutButton.addEventListener("click", async (event) => {
    const pickUpDate = pickupDateSelect.value;
    const pickUpPeriod = pickupTimeSelect.value;
    const totalCost = document.getElementById("total-cost").value;
    if (!pickUpDate || !pickUpPeriod) {
      alert("Please fill in all fields before proceeding to checkout.");
      return;
    }
    confirm(
      "All orders must be paid for IN CASH at the time of pickup at the school store. ",
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
