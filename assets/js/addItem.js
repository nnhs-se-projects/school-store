const submitButton = document.querySelector("input.submit");

submitButton.addEventListener("click", async () => {
  const name = document.querySelector("input#name").value;
  const price = document.querySelector("input#price").value;
  const quantity = document.querySelector("input#quantity").value;
  const description = document.querySelector("input#description").value;

  const item = { name, price, quantity, description };

  console.log(item);

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
