const submitButton = document.querySelector("input.submit");

submitButton.addEventListener("click", async () => {
  const name = document.querySelector("input.name").valu;
  const price = document.querySelector("input.price").value;
  const description = document.querySelector("textarea.description").value;
  const image = document.querySelector("input.image").value;
  const size = document.querySelector("input.size").value;

  const item = { name, price, description, image, size };

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
});
