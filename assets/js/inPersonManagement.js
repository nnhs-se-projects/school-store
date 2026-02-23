async function updateStock(id, action) {
  const itemInfo = id.split('\\').slice(1);

  const response = await fetch("/inPersonManagement/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      item: itemInfo[0],
      size: itemInfo[1],
      action
    })
  });

  if (response.ok) {
    location.reload();
  } else {
    alert("Error updating stock: " + response.status + "\nPlease try again later.");
  }
}

const subStockButtons = document.querySelectorAll('.sub-stock');
for (const subBtn of subStockButtons) {
  subBtn.addEventListener("click", async () => { await updateStock(subBtn.id, '-'); });
}

const addStockButtons = document.querySelectorAll('.add-stock');
for (const addBtn of addStockButtons) {
  addBtn.addEventListener("click", async () => { await updateStock(addBtn.id, '+'); });
}

