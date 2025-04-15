document.addEventListener("DOMContentLoaded", () => {
  const orderRows = document.querySelectorAll(".order-row");

  orderRows.forEach((row) => {
    row.addEventListener("click", () => {
      const items = JSON.parse(row.getAttribute("data-items"));
      const nextRow = row.nextElementSibling;

      // Check if the next row is already an expanded items row
      if (nextRow && nextRow.classList.contains("items-row")) {
        nextRow.remove(); // Collapse the items row
      } else {
        // Create a new row for the items
        const itemsRow = document.createElement("tr");
        itemsRow.classList.add("items-row");
        const itemsCell = document.createElement("td");
        itemsCell.colSpan = 6; // Span across all columns
        itemsCell.innerHTML = generateItemsTable(items);
        itemsRow.appendChild(itemsCell);
        row.parentNode.insertBefore(itemsRow, row.nextElementSibling);
      }
    });
  });

  // Function to generate the HTML for the items table
  function generateItemsTable(items) {
    if (!items || items.length === 0) {
      return "<p>No items in this order.</p>";
    }

    let html =
      "<table class='items-table'><thead><tr><th>Item Name</th><th>Quantity</th><th>Price</th></tr></thead><tbody>";
    items.forEach((item) => {
      html += `<tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${item.price}</td>
      </tr>`;
    });
    html += "</tbody></table>";
    return html;
  }
});
