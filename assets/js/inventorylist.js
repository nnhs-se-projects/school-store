const exportXLSX = document.getElementById("inventorylistxlsx");
const exportXLSXText = exportXLSX.innerText;
const exportXLSXLoadingText = "Generating...";
const exportXLSXErrorText = "Error generating XLSX File";

// download XLSX file when export button is clicked
exportXLSX.addEventListener("click", async () => {
  exportXLSX.innerText = exportXLSXLoadingText;

  try {
    const response = await fetch("/inventorylist/xlsx")
    const data = await response.json();

    const link = document.createElement("a");
    link.href = data.xlsxDownload;
    link.download = "inventory_list.xlsx";

    link.click();

    exportXLSX.innerText = exportXLSXText;
  } catch(error) {
    console.error("Error fetching XLSX:", error);
    exportXLSX.innerText = exportXLSXErrorText;
  }

});