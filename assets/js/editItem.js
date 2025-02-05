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
  const item = { name, price, quantity, description, image: base64String };

  await (reader.onloadend = await async function () {
    console.log(file);
    base64String = reader.result;
    console.log(base64String);
    item.image = base64String;
    console.log("okewgheswiougbnweuigqwhnfuigwbhguir4ebgiu:       " + item);
  });

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

  if (file) {
    reader.readAsDataURL(file);
  }
});
