const checkoutFunctions = await import("./checkout.js");
const localDateString = checkoutFunctions.localDateString;
const timeToMinutes = checkoutFunctions.timeToMinutes;
const minutesToTime = checkoutFunctions.minutesToTime;
const populateTimeOptions = checkoutFunctions.populateTimeOptions;

const deleteButtons = document.querySelectorAll(".delete-order");
const changeTimeButtons = document.querySelectorAll(".change-time");

const changeTimeDialog = document.getElementById("change-time-dialog");
const quitTimeDialogButton = document.getElementById("quit-time-dialog");
const changeTimeButton = document.getElementById("change-time-button");
const pickupDateSelect = document.getElementById("pickup-date");
const pickupTimeSelect = document.getElementById("pickup-time");

let latestSelectedOrderId = null;

populateTimeOptions(pickupDateSelect, pickupTimeSelect, storeHoursData);

deleteButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    const confirmDelete = confirm(
      "Please refrain from canceling orders within 48 hours of their pickup time.\nAre you sure you want to delete this order?"
    );
    if (!confirmDelete) {
      event.preventDefault();
      return;
    }
    const orderId = button.getAttribute("order-id");
    const response = await fetch("/userDeleteOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });

    if (response.ok) {
      console.log("Order deleted successfully");
      window.location.reload(); // Reload the page to reflect the changes
    } else {
      console.error("Failed to delete order");
    }
  });
});

quitTimeDialogButton.addEventListener("click", () => {
  changeTimeDialog.close();
});

changeTimeButton.addEventListener("click", async () => {
  const pickUpDate = pickupDateSelect.value;
  const pickUpTime = pickupTimeSelect.value;

  if (!pickUpDate || !pickUpTime) {
    alert("Please fill in all fields before proceeding.");
    return;
  }
  const userConfirmed = confirm(
    "All orders must be paid for IN CASH at the time of pickup at the school store.",
  );
  if (!userConfirmed) {
    return;
  }

  const response = await fetch("/userChangeTime", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId: latestSelectedOrderId,
      pickUpDate,
      pickUpTime
    })
  });

  if (response.ok) {
    window.location.reload();
  } else {
    alert("Failed to change pickup time. Please try again.");
  }
});

changeTimeButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    latestSelectedOrderId = button.getAttribute("order-id");

    changeTimeDialog.showModal();
  });
});