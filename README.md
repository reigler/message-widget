# Message Widget for iOS

A clean, minimal iOS widget that displays the latest message from your loved one using Supabase as a backend. Perfect for couples who want a simple way to stay connected throughout the day.

![Widget Mockup Dark](assets/mockup-light.jpg)
*Light mode version of the widget*

![Widget Mockup Light](assets/mockup-dark.jpg)
*Dark mode version of the widget*

---

## Features

- **Clean Minimal Design**: No distractions, just the message
- **Automatic Dark Mode**: Switches to dark theme from 9 PM to 6 AM
- **Responsive Layout**: Optimized for all widget sizes (small, medium, large)
- **Real-time Updates**: Fetches latest messages automatically
- **Easy Setup**: Simple configuration with Supabase backend

## Widget Preview

| Small Widget | Medium Widget | Large Widget |
|-------------|--------------|--------------|
| ![Small Widget](assets/widget-s.jpg) | ![Medium Widget](assets/widget-m.jpg) | ![Large Widget](assets/widget-l.jpg) |

---

## Quick Start

### 1. Prerequisites

- **iOS 14 or later**
- **[Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188)** app installed from the App Store
- A free **[Supabase](https://supabase.com)** account

### 2. Database Setup

1. **Create a new Supabase project**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Choose a name and secure password
   - Note your **Project URL** and **anon public key** (you'll need these later)

2. **Create the messages table**
   - In your Supabase project, go to **Table Editor** → **Create a new table**
   - Name the table: `messages`
   - Add these columns:
     - `id` (type: int8, Primary Key, Is Identity: true)
     - `text` (type: text, Nullable: false)
     - `created_at` (type: timestamptz, Default: `now()`)
     - `updated_at` (type: timestamptz, Default: `now()`)

3. **Enable Row Level Security (RLS)**
   - Go to **Authentication** → **Policies**
   - Click "Enable RLS" for the messages table
   - Create a new policy:
     - Policy Name: "Allow public read access"
     - Using expression: `true`
     - For: `SELECT` operations only

4. **Insert a test message**
   ```sql
   INSERT INTO messages (text) VALUES ('Hello! Thinking of you today.');
   ```

### 3. Widget Installation

1. **Copy the widget code**
   - Open Scriptable app on your iPhone
   - Tap the "+" button to create a new script
   - Paste the code below
   - Update the configuration variables with your Supabase details

2. **Configure the widget**
   ```javascript
   // ====================
   // CONFIGURATION
   // ====================
   const SUPABASE_URL = "https://your-project.supabase.co";  // Your Supabase URL
   const SUPABASE_KEY = "your-anon-public-key-here";         // Your anon public key
   ```

3. **Add to Home Screen**
   - Long-press on your home screen
   - Tap the "+" button in the top-left corner
   - Search for "Scriptable"
   - Choose your preferred widget size (small, medium, or large)
   - Tap the widget, then choose your script

---

## Full Widget Code

```javascript
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
  
  // Between 9pm and 6am: Dark Mode
  if (hour >= 21 || hour < 6) {
    return {
      background: "#1A1A1A",  // Dark grey
      text: "#F0F0F0",        // Offwhite
      placeholder: "#999999"   // Mid-Grey
    };
  }
  
  // Daytime (6am - 9pm): Lightmode
  return {
    background: "#FFFFFF",
    text: "#000000",
    placeholder: "#888888"
  };
}

async function createWidget() {
  const message = await fetchLatestMessage();
  const colors = getTimeBasedColors();
  
  // recognize widget size
  const isMediumWidget = !config.runsInApp && config.widgetFamily === "medium";
  const isLargeWidget = !config.runsInApp && config.widgetFamily === "large";
  const isSmallWidget = !config.runsInApp && config.widgetFamily === "small";

  let widget = new ListWidget();
  widget.backgroundColor = new Color(colors.background);
  
  if (message) {
    let messageText = widget.addText(message);
    
    // adjusted font size for widget size
    if (isLargeWidget) {
      messageText.font = Font.systemFont(32);  // big
    } else if (isMediumWidget) {
      messageText.font = Font.systemFont(28);  // medium
    } else if (isSmallWidget) {
      messageText.font = Font.systemFont(20);  // small
    } else {
      messageText.font = Font.systemFont(16);  // default
    }
    
    messageText.textColor = new Color(colors.text);
    messageText.lineLimit = 0;
    messageText.minimumScaleFactor = 0.8;  // text can shrink if necessary
    
    // align centre 
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

  // dynamic padding for better balance
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

widget.refreshAfterDate = new Date(Date.now() + 60 * 1000); // refresh after 1min
Script.complete();
```

---

## Customization

### Change Colors
Modify these lines in the code:
```javascript
// For day mode:
widget.backgroundColor = new Color("#FFFFFF");  // Background
messageText.textColor = new Color("#000000");   // Text color

// For night mode:
widget.backgroundColor = new Color("#121212");  // Background
messageText.textColor = new Color("#FFFFFF");   // Text color
```

### Adjust Font Sizes
```javascript
// Small widget
messageText.font = Font.systemFont(32);

// Medium widget  
messageText.font = Font.systemFont(28);

// Large widget
messageText.font = Font.systemFont(20);
```

### Change Refresh Interval
The widget updates every minute by default. To change this:
```javascript
// Update every 5 minutes:
widget.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);

// Update every hour:
widget.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000);
```

---

## Sending Messages

### Via Supabase Dashboard
1. Go to your Supabase project
2. Navigate to **Table Editor** → **messages**
3. Click "Insert row"
4. Enter your message in the `text` field
5. Click "Save"

### Via REST API
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/rest/v1/messages' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Your message here"}'
```

### Simple Web Interface
Create an HTML file like this:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Send Message</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.36.0/dist/umd/supabase.min.js"></script>

  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #f4f4f5;
      display: flex;
      justify-content: center;
      min-height: 100vh;
    }

    .container {
      width: 100%;
      max-width: 500px;
      background: white;
      padding: 24px;
      margin: 20px;
      border-radius: 14px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    }

    h3, h4 {
      margin-top: 80px;
      font-size: clamp(1.4rem, 4vw, 1.2rem);
    }

    h2 {
       margin-top: 0;
      font-size: clamp(1.8rem, 4vw, 1.8rem);
    }

    input, textarea, button {
      width: 100%;
      padding: 16px;
      margin-top: 14px;
      font-size: clamp(1.0rem, 3.5vw, 1.2rem);
      border-radius: 10px;
      border: 1px solid #d4d4d8;
      box-sizing: border-box;
    }

    textarea {
      resize: none;
      min-height: 120px;
    }

    button {
      background: black;
      color: white;
      border: none;
      font-weight: 600;
      transition: 0.2s;
    }

    button:hover {
      background: #333;
    }

    #logoutButton {
      background: #6d6868;
      margin-top: 24px;
    }

    #latestMessage {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      padding: 14px;
      border-radius: 10px;
      margin-top: 10px;
      font-size: clamp(1rem, 3.5vw, 1.1rem);
    }

    .hidden {
      display: none;
    }
  </style>
</head>

<body>

  <div class="container">
    <h2>Send a Message to the E-Ink Display</h2>

    <!-- Login Form -->
    <div id="loginBox">
      <h3>Login</h3>
      <input type="email" id="email" placeholder="Your email">
      <input type="password" id="password" placeholder="Password">
      <button onclick="login()">Login</button>
    </div>

    <!-- Message Form -->
    <div id="messageBox" class="hidden">
      <h3>Write a Message</h3>

      <textarea id="message" placeholder="Type your message..."></textarea>
      <button onclick="sendMessage()">Send</button>

      <h4>Latest Message</h4>
      <div id="latestMessage">(none yet)</div>

      <button id="logoutButton" onclick="logout()">Logout</button>
    </div>
  </div>

  <script>
  // Initialize Supabase
  const client = supabase.createClient(
    "REPLACE WITH YOUR SUPABASE URL",
    "REPLACE WITH YOUR SUPABASE ANON KEY"
  );

  async function login() {
  console.log("Login clicked");
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  console.log("Email:", email, "Password:", password);

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  console.log("Supabase response:", data, error);

  if (error) {
    alert("Login failed: " + error.message);
    return;
  }

  console.log("User data:", data.user);

  if (data.user) {
    
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("messageBox").classList.remove("hidden");
    loadLatestMessage();
  } else {
    alert("Login failed: no user returned");
  }
}

  async function sendMessage() {
    const text = document.getElementById("message").value;
    if (!text.trim()) return alert("Please type a message first.");

    const { data, error } = await client
      .from("messages")
      .insert([{ text }]);

    if (error) return alert("Error sending message: " + error.message);

    document.getElementById("message").value = "";
    loadLatestMessage();
  }

  async function loadLatestMessage() {
    const { data, error } = await client
      .from("messages")
      .select("text, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1);

    const box = document.getElementById("latestMessage");
    if (error || data.length === 0) return box.innerText = "(none)";
    box.innerText = data[0].text + "\n\n(" + data[0].updated_at + ")";
  }

  async function logout() {
    await client.auth.signOut();
    document.getElementById("messageBox").classList.add("hidden");
    document.getElementById("loginBox").classList.remove("hidden");
  }
</script>

</body>
</html>
```

## Setup and hosting

- Create a free Vercel account 
- Connect your GitHub webapp repository with vercel and host it for free
- Then follow instructions from: https://ios.gadgethacks.com/how-to/turn-any-website-into-full-screen-app-your-iphone-0384426/ if you want easy access to the Webapp (optional)


---

## Security Notes

- The widget uses Supabase's **anon public key** which only allows reading messages
- For additional security, you can:
  1. Enable email authentication in Supabase
  2. Create a secure API endpoint for sending messages
  3. Add rate limiting to prevent abuse
- The anon key is exposed in the widget code - this is acceptable for personal use but consider additional security for public apps

---

## Troubleshooting

### Widget shows "No messages yet"
1. Check your Supabase URL and API key are correct
2. Verify you have messages in the `messages` table
3. Ensure Row Level Security allows SELECT operations

### Widget doesn't update
1. Scriptable widgets refresh every 15 minutes minimum
2. Try removing and re-adding the widget
3. Restart the Scriptable app

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **[Scriptable](https://scriptable.app/)** - iOS automation app that makes this widget possible
- **[Supabase](https://supabase.com/)** - Open source Firebase alternative for the backend
- Inspired by the simple need to stay connected with loved ones

---

## Contributing

Found a bug or have an improvement? 
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Made with ❤️ for meaningful connections**

*If this project helped you, consider giving it a star!*
