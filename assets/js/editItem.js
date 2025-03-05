const submitButton = document.querySelector("input.submit");
const addSizeButton = document.getElementById("add-size");
const sizesContainer = document.getElementById("sizes");

submitButton.addEventListener("click", async () => {
  const id = document.querySelector("input#id").value;
  const name = document.querySelector("input#name").value;
  const price = document.querySelector("input#price").value;
  const quantity = document.querySelector("input#quantity").value;
  const description = document.querySelector("input#description").value;
  const imageInput = document.querySelector("input#image");
  const file = imageInput.files[0];
  const reader = new FileReader();
  let base64String = null;
  const sizes = {};

  document.querySelectorAll(".size-entry").forEach((entry) => {
    const size = entry.querySelector(".size").value;
    const quantity = entry.querySelector(".quantity").value;
    sizes[size] = parseInt(quantity, 10);
    console.log(sizes[size]);
  });
  console.log(sizes);

  reader.onloadend = async function () {
    base64String = reader.result;
    const item = {
      name,
      price,
      quantity,
      description,
      image: base64String,
      sizes,
    };

    const response = await fetch("/editItem/" + id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item }),
    });

    if (response.ok) {
      window.location = "/manageItems";
    } else {
      console.error("error creating entry");
    }
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    console.log(sizes);
    const item = {
      name,
      price,
      quantity,
      description,
      image: base64String,
      sizes,
    };

    const response = await fetch("/editItem/" + id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item }),
    });

    if (response.ok) {
      window.location = "/manageItems";
    } else {
      console.error("error creating entry");
    }
  }
});

addSizeButton.addEventListener("click", () => {
  const sizeEntry = document.createElement("div");
  sizeEntry.classList.add("size-entry");

  const sizeInput = document.createElement("input");
  sizeInput.type = "text";
  sizeInput.classList.add("size");
  sizeInput.placeholder = "Size";

  const quantityInput = document.createElement("input");
  quantityInput.type = "number";
  quantityInput.classList.add("quantity");
  quantityInput.placeholder = "Quantity";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.classList.add("delete-size");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    sizeEntry.remove();
  });

  sizeEntry.appendChild(sizeInput);
  sizeEntry.appendChild(quantityInput);
  sizeEntry.appendChild(deleteButton);

  sizesContainer.appendChild(sizeEntry);
});

document.querySelectorAll(".delete-size").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.target.closest(".size-entry").remove();
  });
});
