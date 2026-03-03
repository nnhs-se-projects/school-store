const saveBtn = document.getElementById("save-btn");

saveBtn.addEventListener("click", async () => {
  const confirmStoreText = document.getElementById("confirm-store-text").value;
  const confirmStudentText = document.getElementById("confirm-student-text").value;
  const cancelStudentText = document.getElementById("cancel-student-text").value;

  const emailText = {
    confirmStoreText,
    confirmStudentText,
    cancelStudentText
  };
  const response = await fetch("/editEmail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(emailText)
  });

  if (response.ok) {
    window.location.reload();
  } else {
    console.error("error editing email text: " + response.status);
  }
});