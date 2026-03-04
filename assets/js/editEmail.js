const saveBtn = document.getElementById("save-btn");

function setIfEmpty(text) {
  if (text) {
    return text;
  } else {
    return "\n";
  }
}

saveBtn.addEventListener("click", async () => {
  const confirmStoreText = setIfEmpty(document.getElementById("confirm-store-text").value);
  const confirmStudentText = setIfEmpty(document.getElementById("confirm-student-text").value);
  const cancelStudentText = setIfEmpty(document.getElementById("cancel-student-text").value);

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