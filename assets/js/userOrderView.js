const deleteButtons = document.querySelectorAll(".delete-order");

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