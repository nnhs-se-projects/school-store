document.addEventListener("DOMContentLoaded", () => {
  const popupModal = document.getElementById("popup-modal");
  const closeBtn = document.getElementById("popup-close-btn");

  // Fetch and display stats
  fetchStats();

  // Show popup when page loads
  if (popupModal) {
    popupModal.classList.remove("hidden");
  }

  // Close popup when X button is clicked
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popupModal.classList.add("hidden");
    });
  }

  // Close popup when clicking outside the popup content
  if (popupModal) {
    popupModal.addEventListener("click", (event) => {
      if (event.target === popupModal) {
        popupModal.classList.add("hidden");
      }
    });
  }
});

async function fetchStats() {
  try {
    const response = await fetch("/api/stats");
    const data = await response.json();

    document.getElementById("orders-count").textContent = data.totalOrders;
    document.getElementById("items-count").textContent = data.totalItems;
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
}
