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
        itemsCell.colSpan = 9; // Span across all columns
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

const deleteButtons = document.querySelectorAll(".delete-order");

deleteButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this order?"
    );
    if (!confirmDelete) {
      event.preventDefault();
      return;
    }
    const orderId = button.getAttribute("order-id");
    const response = await fetch("/deleteOrder", {
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

// const checkOffButtons = document.querySelectorAll(".check-off-order");

// checkOffButtons.forEach((button) => {
//   button.addEventListener("click", async (event) => {
//     const confirmCheckOff = confirm(
//       "Are you sure you want to check off this order?"
//     );
//     if (!confirmCheckOff) {
//       event.preventDefault();
//       return;
//     }

//     const orderId = button.getAttribute("order-id");
//     const response = await fetch("/checkOffOrder", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ orderId }),
//     });

//     if (response.ok) {
//       console.log("Order checked off successfully");
//       window.location.reload(); // Reload the page to reflect the changes
//     } else {
//       console.error("Failed to check off order");
//     }
//   });
// });

const checkOffButtons = document.querySelectorAll(".check-off-order");

checkOffButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    const confirmCheckOff = confirm(
      "Are you sure you want to check off this order?"
    );
    if (!confirmCheckOff) {
      event.preventDefault();
      return;
    }

    const orderId = button.getAttribute("order-id");
    const response = await fetch("/checkOffOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });

    if (response.ok) {
      console.log("Order checked off successfully");

      // Update the status cell in the DOM
      const statusCell = button.closest("tr").querySelector(".status");
      statusCell.textContent = "completed";

      // Optionally disable the button to prevent further clicks
      button.disabled = true;
      button.textContent = "Checked Off";
    } else {
      console.error("Failed to check off order");
    }
  });
});
