import("./checkout.js").then((dateTimeFunctions) => {
  console.log("Date and Time Functions: ", dateTimeFunctions);
  // FIXME: store functions to variables to use later. Also need to get the times loaded
});

const deleteButtons = document.querySelectorAll(".delete-order");
const changeTimeButtons = document.querySelectorAll(".change-time");

const changeTimeDialog = document.getElementById("change-time-dialog");
const quitTimeDialogButton = document.getElementById("quit-time-dialog");
const changeTimeButton = document.getElementById("change-time-button");

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

changeTimeButton.addEventListener("click", () => {
  changeTimeDialog.close();
});

changeTimeButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    const orderId = button.getAttribute("order-id");

    changeTimeDialog.showModal();
  });
});