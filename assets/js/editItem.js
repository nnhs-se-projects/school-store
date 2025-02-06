const submitButton = document.querySelector("input.submit");

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

  reader.onloadend = async function () {
    base64String = reader.result;
    const item = { name, price, quantity, description, image: base64String };
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
    const item = { name, price, quantity, description, image: base64String };

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
