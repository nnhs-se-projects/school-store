import heic2any from "heic2any";

const submitButton = document.querySelector("input.submit");
const addSizeButton = document.getElementById("add-size");
const sizesContainer = document.getElementById("sizes");

submitButton.addEventListener("click", async () => {
  const id = document.querySelector("input#id").value;
  const name = document.querySelector("input#name").value;
  const price = document.querySelector("input#price").value;
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

      base64String = canvas.toDataURL("image/jpeg");

      const item = {
        name,
        price,
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
  };

  if (file) {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    if (fileType === "") {
      // Check for HEIC in file name
      const fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);

      if (fileExtension === "heic") {
        try {
          // Convert the HEIC file to JPEG using heic2any
          const convertedBlob = await heic2any({
            blob: file, // Input file as a Blob
            toType: "image/jpeg", // Output format
          });

          // Read the converted Blob as a Data URL
          reader.readAsDataURL(convertedBlob);
        } catch (error) {
          console.error("Error converting HEIC file:", error);
        }
      } else {
        console.error("File type not supported");
      }
    } else {
      // Current file types supported include:
      // image/jpeg, image/png, image/webp, image/gif, image/avif
      console.log("File type: ", file);
      reader.readAsDataURL(file);
    }
  } else {
    console.log(sizes);
    const item = {
      name,
      price,
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
