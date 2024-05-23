document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById("upload");
  const fileLabel = document.querySelector(".custom-file-upload");
  const submitButton = document.getElementById("submit");
  const status = document.getElementById("status");

  const updateFileLabel = (file) => {
    fileLabel.classList.add("uploaded");
    fileLabel.textContent = file.name;
  };

  const showStatus = (message) => {
    status.textContent = message;
  };

  const calculateDataObj = (sheet) => {
    const [campaignName, ...languages] = sheet[0];
    const types = sheet.slice(1).map((row) => row[0]);

    return {
      campaignName,
      dataObj: languages.reduce((acc, lang, langIndex) => {
        acc[lang] = sheet.slice(1).reduce((langData, row, rowIndex) => {
          langData[types[rowIndex]] = row[langIndex + 1];

          return langData;
        }, {});

        return acc;
      }, {}),
    };
  };

  const processFile = (file, templateName) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
        { header: 1 }
      );

      const { campaignName, dataObj } = calculateDataObj(sheet);

      parent.postMessage(
        {
          pluginMessage: {
            type: "create-frames",
            data: dataObj,
            campaignName,
            templateName,
          },
        },
        "*"
      );

      showStatus("Procesamiento completo");
    };
    reader.readAsArrayBuffer(file);
  };

  uploadInput.addEventListener("change", function () {
    if (this.files[0]) {
      updateFileLabel(this.files[0]);
    }
  });

  submitButton.addEventListener("click", () => {
    const file = uploadInput.files[0];
    if (!file) {
      showStatus("Por favor, seleccione un archivo válido");

      return null;
    }

    const templateName = document.getElementById("template-name").value;
    if (!templateName) {
      showStatus("Por favor, introduzca el nombre del template");

      return null;
    }

    processFile(file, templateName);
  });
});
