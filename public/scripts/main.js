document.addEventListener("DOMContentLoaded", function () {
  const uploadInput = document.getElementById("upload");
  const fileLabel = document.querySelector(".custom-file-upload");
  const submitButton = document.getElementById("submit");
  const status = document.getElementById("status");

  uploadInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      fileLabel.classList.add("uploaded");
      fileLabel.textContent = file.name;
    }
  });

  submitButton.addEventListener("click", function () {
    const file = uploadInput.files[0];
    if (!file) {
      status.textContent = "Por favor, seleccione un archivo válido";
      return;
    }

    const templateName = document.getElementById("template-name").value;
    if (!templateName) {
      status.textContent = "Por favor, introduzca el nombre del template";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const binaryData = e.target.result;
      const workbook = XLSX.read(binaryData, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });

      const campaignName = sheet[0][0];
      const languages = sheet[0].slice(1);
      const types = sheet.slice(1).map((row) => row[0]);
      const data = {};

      languages.forEach((lang, langIndex) => {
        const langData = {};
        sheet.slice(1).forEach((row, rowIndex) => {
          langData[types[rowIndex]] = row[langIndex + 1];
        });
        data[lang] = langData;
      });

      parent.postMessage(
        {
          pluginMessage: {
            type: "create-frames",
            data,
            campaignName,
            templateName,
          },
        },
        "*"
      );

      status.textContent = "Procesamiento completo";
    };
    reader.readAsBinaryString(file);
  });
});
