const notLoggedInItems = document.querySelectorAll("#not-logged-in");
const notLoggedInAsStudentItems = document.querySelectorAll("#not-logged-in-as-student");

const jumpToStore = document.getElementById("jump-to-store");

notLoggedInItems.forEach(item => {
  item.addEventListener("click", function() {
    alert("Please log in to view item details.");
  });
});

notLoggedInAsStudentItems.forEach(item => {
  item.addEventListener("click", function() {
    alert("Please log in as a student to view item details.");
  });
});

jumpToStore.addEventListener("click", () => {
  window.location.href = "#item-list-skip";
});

setTimeout(() => {
  jumpToStore.style.opacity = 1;
  console.log("button showing", jumpToStore.style.display);
}, 4000);
