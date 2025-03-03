const submitButton = document.querySelector("input.submit");

submitButton.addEventListener("click", async () => {
  const name = document.querySelector("input#name").value;
  const price = document.querySelector("input#price").value;
  const quantity = document.querySelector("input#quantity").value;
  const description = document.querySelector("input#description").value;
  const imageInput = document.querySelector("input#image");
  const file = imageInput.files[0];
  const reader = new FileReader();

  reader.onloadend = async function () {
    const base64String = reader.result;
    console.log(base64String);

    // Display the image

    const item = { name, price, quantity, description, image: base64String };

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
