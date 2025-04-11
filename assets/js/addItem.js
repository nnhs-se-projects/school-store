const submitButton = document.querySelector("input.submit");

submitButton.addEventListener("click", async () => {
  const name = document.querySelector("input#name").value;
  const price = document.querySelector("input#price").value;
  const description = document.querySelector("input#description").value;
  const imageInput = document.querySelector("input#image");
  const file = imageInput.files[0];
  const reader = new FileReader();
  let base64String = null;

  const sizes = {};
  const sizeChecked = document.querySelector("input#sized-check").checked;

  // Populate the sizes object
  if (sizeChecked) {
    document.querySelectorAll(".size-entry").forEach((entry) => {
      const size = entry.querySelector(".size").value.trim();
      const quantity = parseInt(entry.querySelector(".quantity").value, 10);

      if (size && !isNaN(quantity)) {
        sizes[size] = quantity;
      }
    });
  } else {
    sizes.placeholder = parseInt(
      document.querySelector("input#generic-quantity").value,
      10
    );
  }

  console.log(sizes); // Debugging: Check the sizes object

  reader.onloadend = async function () {
    const img = new Image();
    img.src = reader.result;

    img.onload = async function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const height = 600;
      const width = 600;

      canvas.width = width;
      canvas.height = height;

      const minSize = Math.min(img.width, img.height);
      const cropX = (img.width - minSize) / 2;
      const cropY = (img.height - minSize) / 2;

      ctx.drawImage(img, cropX, cropY, minSize, minSize, 0, 0, width, height);

      base64String = canvas.toDataURL("image/jpeg");

      const item = {
        name,
        price,
        description,
        image: base64String,
        sizes,
      };

      const response = await fetch("/addItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item }),
      });

      if (response.ok) {
        window.location = "/manageItems";
      } else {
        console.error("Error adding item");
      }
    };
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    const item = {
      name,
      price,
      description,
      image: base64String,
      sizes,
    };

    const response = await fetch("/addItem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item }),
    });

    if (response.ok) {
      window.location = "/manageItems";
    } else {
      console.error("Error adding item");
    }
  }
});

const addSizeButton = document.querySelector("button#add-size");
const sizesContainer = document.querySelector(".size-entry");

addSizeButton.addEventListener("click", (event) => {
  alert("Size added");
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

function toggleSizeInput() {
  const sizeInput = document.getElementById("size-input");
  const checkBox = document.getElementById("sized-check");
  const genericSizeInput = document.getElementById("generic-size-input");
  if (checkBox.checked) {
    sizeInput.style.display = "block";
    genericSizeInput.style.display = "none";
  } else {
    sizeInput.style.display = "none";
    genericSizeInput.style.display = "block";
  }
}
