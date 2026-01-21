document.addEventListener("DOMContentLoaded", () => {
  const popupModal = document.getElementById("popup-modal");
  const closeBtn = document.getElementById("popup-close-btn");

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
