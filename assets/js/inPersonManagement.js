async function updateStock(id, action) {
  const itemInfo = id.split(".").slice(1);

  const response = await fetch("/inPersonManagement/" + id, {
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

  // FIXME: do things with response and make sure it's all good
}

const subStockButtons = document.querySelectorAll('.sub-stock');
for (const subBtn of subStockButtons) {
  subBtn.addEventListener("click", await updateStock(subBtn, '-'));
}

const addStockButtons = document.querySelectorAll('.add-stock');
for (const addBtn of addStockButtons) {
  addBtn.addEventListener("click", await updateStock(addBtn, '+'));
}