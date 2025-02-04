const submitButton = document.querySelector("input.submit");

submitButton.addEventListener("click", async () => {
  const id = document.querySelector("input#id").value;
  const name = document.querySelector("input#name").value;
  const price = document.querySelector("input#price").value;
  const quantity = document.querySelector("input#quantity").value;
  const description = document.querySelector("input#description").value;
  console.log(id);

  const imageInput = document.querySelector("input#image");

  const image = imageInput.files[0];

  const item = {
    name,
    price,
    quantity,
    description,
    image,
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
});
