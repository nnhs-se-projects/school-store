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

  const sizesMap = new Map();
  if (sizeCheck) {
    const sizeEntries = document.querySelectorAll(".size-entry");
    sizeEntries.forEach((entry) => {
      const size = entry.querySelector("input[name='size[]']").value;
      const quantity = entry.querySelector(
        "input[name='size-quantity[]']"
      ).value;
      sizesMap.set(size, quantity);
    });
  } else {
    const quantity = document.querySelector("input#quantity").value;
    sizesMap.set("default", quantity);
  }

  console.log("Sizes Map:", sizesMap);

  reader.onloadend = async function () {
    const base64String = reader.result;
    console.log(base64String);

    // Convert the Map to an object for JSON serialization
    const sizesObject = Object.fromEntries(sizesMap);

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
