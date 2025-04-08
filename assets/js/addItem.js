import heic2any from "heic2any";

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

  const sizesObject = {};
  // If size check is checked, get the sizes from the size boxes
  // If size check is not checked, set the sizes equal to what is in the quantity box, parameter is of name "placeholder"

  if (sizeCheck) {
    console.log("Size check is checked");
    const sizeEntries = document.querySelectorAll(".size-entry");
    sizeEntries.forEach((entry) => {
      const size = entry.querySelector("input[name='size[]']").value;
      const quantity = parseInt(
        entry.querySelector("input[name='size-quantity[]']").value,
        10
      );
      sizesObject[size] = quantity;
      console.log(`Size: ${size}, Quantity: ${quantity}`);
    });
  } else {
    sizesObject.placeholder = document.querySelector(
      "input#generic-quantity"
    ).value;
  }

  console.log("Sizes Object:", sizesObject);

  reader.onloadend = async function () {
    const img = new Image();
    img.src = reader.result;

    img.onload = async function () {
      console.log("Image loaded successfully");
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
        sizes: sizesObject,
      };

      console.log("Item object:", item);

      const response = await fetch("/addItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item }),
      });

      if (response.ok) {
        window.location = "/admin";
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
        // Mysterious file type? Implement support later on
        console.error("File type not supported");
      }
    } else {
      // Current file types supported include:
      // image/jpeg, image/png, image/webp, image/gif, image/avif
      console.log("File type: ", file);
      reader.readAsDataURL(file);
    }
  } else {
    console.error("No file selected");
  }
});
