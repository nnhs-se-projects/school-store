/**
 * Sends the credentials from the Google Sign-In popup to the server for authentication
 *
 * @param {Object} res - the response object from the Google Sign-In popup
 */

// eslint-disable-next-line no-unused-vars

const cartButtonNotLoggedIn = document.querySelector("#alert-button-2");

const cartButtonLoggedInStudent = document.querySelector("#alert-button-1");

if (cartButtonNotLoggedIn) {
  cartButtonNotLoggedIn.addEventListener("click", () => {
    alert("You need to log in before you can access the cart page");
  });
}

if (cartButtonLoggedInStudent) {
  cartButtonLoggedInStudent.addEventListener("click", () => {
    alert(
      "You need to log in as a student before you can access the cart page"
    );
  });
}

async function handleCredentialResponse(res) {
  await fetch("/auth", {
    // send the googleUser's id_token which has all the data we want to the server with a POST request
    method: "POST",
    body: JSON.stringify({
      credential: res.credential,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  // redirect to the index page
  window.location.href = "/";
}

function toggleMobileNavbar() {
  const navbar = document.querySelector(".nav-links");
  const menu_button = document.getElementById("open-menu");

  if (navbar.classList.contains("show")) {
    navbar.classList.remove("show");
    menu_button.innerText = "Open Menu";
  } else {
    navbar.classList.add("show");
    menu_button.innerText = "Close Menu";
  }
}
