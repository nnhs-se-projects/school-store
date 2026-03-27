const saveBtn = document.getElementById("save-btn");

function setIfEmpty(text) {
  if (text) {
    return text;
  } else {
    return "\n";
  }
}

saveBtn.addEventListener("click", async () => {
  const confirmUpdateText = setIfEmpty(
    document.getElementById("confirm-update-text").value,
  );

  const SplashUpdate = {
    confirmUpdateText,
  };
  const response = await fetch("/editSplash", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(SplashUpdate),
  });

  if (response.ok) {
    window.location.reload();
  } else {
    console.error("error editing splash text: " + response.status);
  }
});
