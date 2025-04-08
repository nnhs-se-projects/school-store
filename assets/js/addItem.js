const submitButton = document.querySelector("input.submit");

submitButton.addEventListener("click", async (event) => {
  event.preventDefault(); // Prevent the default form submission

  const name = document.querySelector("input#name").value;
  const price = document.querySelector("input#price").value;
  const description = document.querySelector("input#description").value;
  const imageInput = document.querySelector("input#image");
  const file = imageInput.files[0];
  const reader = new FileReader();

  const sizeCheck = document.querySelector("input#sized-check").checked;

  const sizes = {};

  // If size check is checked, get the sizes from the size boxes
  // If size check is not checked, set the sizes equal to what is in the quantity box, parameter is of name "placeholder"

  if (sizeCheck) {
    document.querySelectorAll(".size-entry").forEach((entry) => {
      const size = entry.querySelector(".size").value;
      const quantity = entry.querySelector(".quantity").value;
      sizes[size] = parseInt(quantity, 10);
      console.log(sizes[size]);
    });
  } else {
    sizes.placeholder = parseInt(
      document.querySelector("input#generic-quantity").value,
      10
    );
  }

  console.log("Sizes Object:", sizes);

  reader.onloadend = async function () {
    const img = new Image();
    img.src = reader.result;

    img.onload = async function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas size to:

      const height = 600;
      const width = 600;

      canvas.width = width;
      canvas.height = height;

      // Calculate the cropping area
      const minSize = Math.min(img.width, img.height);
      const cropX = (img.width - minSize) / 2;
      const cropY = (img.height - minSize) / 2;

      // Draw the cropped and resized image onto the canvas
      ctx.drawImage(img, cropX, cropY, minSize, minSize, 0, 0, width, height);

      const base64String = canvas.toDataURL("image/jpeg");

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
        console.error("error creating entry");
      }
    };
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    console.error("No file selected");
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
