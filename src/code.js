figma.showUI(__html__, { width: 500, height: 550 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === "create-frames") {
    const { data, campaignName, templateName } = msg;

    const templateFrame = figma.currentPage.findOne(
      (node) => node.name === templateName && node.type === "FRAME"
    );

    if (!templateFrame) {
      figma.notify(`Template frame named "${templateName}" not found`);

      return null;
    }

    let offsetY = templateFrame.y + templateFrame.height + 50;

    for (const [language, textData] of Object.entries(data)) {
      const newFrame = createFrame(
        templateFrame,
        offsetY,
        `${campaignName}_${language}`
      );

      await replaceTextsInFrame(newFrame, textData);

      offsetY += newFrame.height + 50;

      figma.currentPage.appendChild(newFrame);
    }

    figma.notify("Frames created successfully");
    figma.closePlugin();
  }
};

function createFrame(templateFrame, yPosition, frameName) {
  const newFrame = templateFrame.clone();
  newFrame.x = templateFrame.x;
  newFrame.y = yPosition;
  newFrame.name = frameName;

  return newFrame;
}

async function replaceTextsInFrame(frame, textData) {
  for (const [textType, textValue] of Object.entries(textData)) {
    const node = frame.findOne((n) => n.name === textType && n.type === "TEXT");

    if (node && textValue) {
      try {
        await figma.loadFontAsync(node.fontName);
      } catch (e) {
        figma.notify("Error on load font");
      }

      node.characters = textValue;
    }
  }
}
