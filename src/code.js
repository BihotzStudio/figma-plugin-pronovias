figma.showUI(__html__, { width: 500, height: 500 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === "create-frames") {
    const { data, templateName } = msg;

    // Buscar el frame llamado según el nombre del template proporcionado por el usuario
    const templateFrame = figma.currentPage.findOne(
      (node) => node.name === templateName && node.type === "FRAME"
    );

    if (!templateFrame) {
      figma.notify(`Template frame named "${templateName}" not found`);
      return;
    }

    // Iterar sobre cada idioma y crear un frame debajo del anterior
    let offsetY = templateFrame.y + templateFrame.height + 50; // Espacio vertical entre frames

    for (const rowData of data) {
      const {
        language,
        title1,
        title2,
        description1,
        description2,
        buttonText,
        campaign,
      } = rowData;

      // Clonar el frame "Template"
      const newFrame = templateFrame.clone();
      newFrame.x = templateFrame.x;
      newFrame.y = offsetY;
      newFrame.name = `${campaign}_${language}`; // Configurar el nombre del frame con el idioma y campaña

      // Buscar y reemplazar los textos dentro del nuevo frame
      const titleNode1 = newFrame.findOne(
        (node) => node.name === "Title1" && node.type === "TEXT"
      );
      const titleNode2 = newFrame.findOne(
        (node) => node.name === "Title2" && node.type === "TEXT"
      );
      const descriptionNode1 = newFrame.findOne(
        (node) => node.name === "Description1" && node.type === "TEXT"
      );
      const descriptionNode2 = newFrame.findOne(
        (node) => node.name === "Description2" && node.type === "TEXT"
      );
      const buttonNode = newFrame.findOne(
        (node) => node.name === "Button" && node.type === "TEXT"
      );

      // Asignar textos a los nodos
      if (titleNode1 && title1) {
        await figma.loadFontAsync(titleNode1.fontName);
        titleNode1.characters = title1;
      }

      if (titleNode2 && title2) {
        await figma.loadFontAsync(titleNode2.fontName);
        titleNode2.characters = title2;
      }

      if (descriptionNode1 && description1) {
        await figma.loadFontAsync(descriptionNode1.fontName);
        descriptionNode1.characters = description1;
      }

      if (descriptionNode2 && description2) {
        await figma.loadFontAsync(descriptionNode2.fontName);
        descriptionNode2.characters = description2;
      }

      if (buttonNode && buttonText) {
        await figma.loadFontAsync(buttonNode.fontName);
        buttonNode.characters = buttonText;
      }

      // Actualizar el offset para el siguiente frame
      offsetY += newFrame.height + 50;

      // Agregar el nuevo frame a la página actual
      figma.currentPage.appendChild(newFrame);
    }

    // Notificar al usuario que la operación ha sido completada
    figma.notify("Frames created successfully");
    figma.closePlugin();
  }
};
