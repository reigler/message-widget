//
// SUPABASE MESSAGE WIDGET
//

// CONFIGURE THESE 2 VALUES
const SUPABASE_URL = "REPLACE WITH YOUR SUPABASE URL";
const SUPABASE_KEY = "REPLACE WITH YOUR SUPABASE ANON KEY";

// REST endpoint
const ENDPOINT = "/rest/v1/messages?select=text&order=updated_at.desc&limit=1";

async function fetchLatestMessage() {
  try {
    const req = new Request(SUPABASE_URL + ENDPOINT);
    req.method = "GET";
    req.headers = {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json"
    };

    const json = await req.loadJSON();
    return json[0]?.text || null;
  } catch (error) {
    return null;
  }
}

function getTimeBasedColors() {
  const hour = new Date().getHours();
  
  // Zwischen 21 Uhr und 6 Uhr: Dunkler Modus
  if (hour >= 21 || hour < 6) {
    return {
      background: "#1A1A1A",  // Dunkelgrau statt Schwarz
      text: "#F0F0F0",        // Fast weiß
      placeholder: "#999999"   // Mittleres Grau
    };
  }
  
  // Tagsüber: Heller Modus
  return {
    background: "#FFFFFF",
    text: "#000000",
    placeholder: "#888888"
  };
}

async function createWidget() {
  const message = await fetchLatestMessage();
  const colors = getTimeBasedColors();
  
  // Widget-Größe erkennen
  const isMediumWidget = !config.runsInApp && config.widgetFamily === "medium";
  const isLargeWidget = !config.runsInApp && config.widgetFamily === "large";
  const isSmallWidget = !config.runsInApp && config.widgetFamily === "small";

  let widget = new ListWidget();
  widget.backgroundColor = new Color(colors.background);
  
  if (message) {
    let messageText = widget.addText(message);
    
    // Optimierte Schriftgrößen für bessere Lesbarkeit
    if (isLargeWidget) {
      messageText.font = Font.systemFont(32);  // Größer im großen Widget
    } else if (isMediumWidget) {
      messageText.font = Font.systemFont(28);  // Mittelgroß
    } else if (isSmallWidget) {
      messageText.font = Font.systemFont(20);  // Normal im kleinen
    } else {
      messageText.font = Font.systemFont(16);  // Default
    }
    
    messageText.textColor = new Color(colors.text);
    messageText.lineLimit = 0;
    messageText.minimumScaleFactor = 0.8;  // Text kann schrumpfen wenn nötig
    
    // Zentrieren in größeren Widgets
    if (isMediumWidget || isLargeWidget || isSmallWidget) {
      messageText.centerAlignText();
    }
  } else {
    let placeholder = widget.addText("Keine Nachrichten");
    
    if (isLargeWidget) {
      placeholder.font = Font.systemFont(17);
    } else if (isMediumWidget) {
      placeholder.font = Font.systemFont(15);
    } else {
      placeholder.font = Font.systemFont(14);
    }
    
    placeholder.textColor = new Color(colors.placeholder);
    
    if (isMediumWidget || isLargeWidget) {
      placeholder.centerAlignText();
    }
  }

  // Dynamisches Padding für bessere Balance
  if (isLargeWidget) {
    widget.setPadding(24, 24, 24, 24);
  } else if (isMediumWidget) {
    widget.setPadding(20, 20, 20, 20);
  } else if (isSmallWidget) {
    widget.setPadding(16, 16, 16, 16);
  } else {
    widget.setPadding(14, 14, 14, 14);
  }

  return widget;
}

let widget = await createWidget();

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}

widget.refreshAfterDate = new Date(Date.now() + 60 * 1000);
Script.complete();
