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
    const base64String = reader.result;

    const item = {
      name,
      price,
      description,
      image: base64String,
      sizes: sizesObject,
    };

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

  if (file) {
    reader.readAsDataURL(file);
  } else {
    console.error("No file selected");
  }
});
