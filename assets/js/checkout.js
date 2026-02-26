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

  // Function to convert time string (e.g., "9:00 AM") to minutes since midnight
  function timeToMinutes(timeStr) {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // Function to convert minutes since midnight back to time string
  function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${String(mins).padStart(2, "0")} ${period}`;
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
        // Convert opening and closing times to minutes since midnight
        const openMinutes = timeToMinutes(timeSlot.openTime);
        const closeMinutes = timeToMinutes(timeSlot.closeTime);

        // Generate 30-minute intervals
        for (
          let currentMinutes = openMinutes;
          currentMinutes < closeMinutes;
          currentMinutes += 30
        ) {
          const startTime = minutesToTime(currentMinutes);
          const endMinutes = Math.min(currentMinutes + 30, closeMinutes);
          const endTime = minutesToTime(endMinutes);
          const option = document.createElement("option");
          option.value = `${startTime} - ${endTime}`;
          option.textContent = `${startTime} - ${endTime}`;
          pickupTimeSelect.appendChild(option);
        }
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
    const userConfirmed = confirm(
      "All orders must be paid for IN CASH at the time of pickup at the school store. ",
    );
    if (!userConfirmed) {
      return;
    }

    const response = await fetch("/cart/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ googleId, pickUpDate, pickUpPeriod, totalCost }),
    });

    if (response.ok) {
      window.location.href = "/cart/confirmation";
    } else {
      alert("Failed to place order. Please try again.");
    }
  });
});
