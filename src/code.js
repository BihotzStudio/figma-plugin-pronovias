figma.showUI(__html__, { width: 500, height: 500 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === "create-frames") {
    const { data, campaignName, templateName } = msg;

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

    for (const [language, textData] of Object.entries(data)) {
      const newFrame = templateFrame.clone();
      newFrame.x = templateFrame.x;
      newFrame.y = offsetY;
      newFrame.name = `${campaignName}_${language}`; // Configurar el nombre del frame con el idioma y campaña

      // Buscar y reemplazar los textos dentro del nuevo frame
      for (const [textType, textValue] of Object.entries(textData)) {
        const node = newFrame.findOne(
          (n) => n.name === textType && n.type === "TEXT"
        );
        if (node && textValue) {
          await figma.loadFontAsync(node.fontName);
          node.characters = textValue;
        }
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
