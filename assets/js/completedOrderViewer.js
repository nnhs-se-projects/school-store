document.addEventListener("DOMContentLoaded", () => {
  const viewCompletedItemsButtons = document.querySelectorAll(
    ".view-items-completed"
  );

  viewCompletedItemsButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const orderRow = button.closest("tr");
      const items = JSON.parse(orderRow.getAttribute("data-items"));
      const nextRow = orderRow.nextElementSibling;

      // Check if the next row is already an expanded items row
      if (nextRow && nextRow.classList.contains("items-row")) {
        nextRow.remove(); // Collapse the items row
      } else {
        // Create a new row for the items
        const itemsRow = document.createElement("tr");
        itemsRow.classList.add("items-row");
        const itemsCell = document.createElement("td");
        itemsCell.colSpan = 8; // Span across all columns
        itemsCell.innerHTML = generateItemsTable(items);
        itemsRow.appendChild(itemsCell);
        orderRow.parentNode.insertBefore(itemsRow, orderRow.nextElementSibling);
      }
    });
  });

  // Function to generate the HTML for the items table
  function generateItemsTable(items) {
    if (!items || items.length === 0) {
      return "<p>No items in this order.</p>";
    }

    let html =
      "<table class='items-table'><thead><tr><th>Item Name</th><th>Size</th><th>Quantity</th></tr></thead><tbody>";
    items.forEach((item) => {
      html += `<tr>
        <td>${item.name}</td>
        <td>${item.size}</td>
        <td>${item.quantity}</td>
      </tr>`;
    });
    html += "</tbody></table>";
    return html;
  }
});
