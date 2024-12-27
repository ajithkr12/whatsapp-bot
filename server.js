// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// WhatsApp API credentials
const WHATSAPP_API_URL =
  "https://graph.facebook.com/v21.0/544742372045526/messages";
const ACCESS_TOKEN =
  "EAAIZBBT2ZAKeIBO7cbKIJIHZAasBgeqOpUt5r1b9g381jTDfhGSGfNHjShjs9w9jfiUS4TJZAnxiNAMRGIbMKZBRVsYqhVcoZCiOtd7ZAP75HlbKhArV3s9bvMgyk96UPbLwmMvjX8X1FyU6RocXNpaaNTtzvlfY6PaZCvCUyG5JTxHfZBXsCcJNZCcr7k5BN33OxSiXSyjj7sWch0j2gZCiJGZCgRQHNPwZD";

// Store user data
const userData = {};

// Endpoint for webhook (receives messages from WhatsApp)
app.post("/webhook", (req, res) => {
  console.log("Webhook payload:", JSON.stringify(req.body, null, 2)); // Log incoming data

  // Check if the payload contains messages
  const messages = req.body?.entry?.[0]?.changes?.[0]?.value?.messages;
  if (messages && messages[0]) {
    const message = messages[0];
    const from = message.from; // Sender's phone number
    const text = message.text?.body?.toLowerCase() || ""; // Incoming message text

    console.log(`Received message from ${from}: ${text}`); // Log message details

    // Initialize user data if it doesn't exist
    if (!userData[from] || Object.keys(userData[from]).length === 0) {
      userData[from] = { step: 0 };
    }

    const user = userData[from];

    // Process user steps
    switch (user.step) {
      case 0:
        sendMessage(from, "Hi! What's your name?");
        user.step++;
        break;
      case 1:
        if (text.includes(from)) {
          sendMessage(
            from,
            "Sorry, I didn't catch your name. Can you repeat it?"
          );
          return;
        }
        user.name = text;
        sendMessage(from, "Great! What's your email?");
        user.step++;
        break;
      case 2:
        user.email = text;
        sendMessage(from, "Got it! How old are you?");
        user.step++;
        break;
      case 3:
        user.age = text;
        sendGenderTemplate(from);
        user.step++;
        break;
      case 4:
        user.gender = text;
        sendMessage(from, "Where are you located?");
        user.step++;
        break;
      case 5:
        user.location = text;
        sendMessage(from, "Lastly, what's your salary?");
        user.step++;
        break;
      case 6:
        user.salary = text;
        sendMessage(
          from,
          `Thanks for sharing your details! Here's what we got:\nName: ${user.name}\nEmail: ${user.email}\nAge: ${user.age}\nGender: ${user.gender}\nLocation: ${user.location}\nSalary: ${user.salary}`
        );
        user.step++;
        break;
      default:
        sendMessage(from, "Thanks! If you need anything else, let me know.");
    }
  }

  res.sendStatus(200); // Acknowledge the request
});

// Function to send messages via WhatsApp API
async function sendMessage(to, message) {
  try {
    await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: to,
        text: { body: message },
      },
      {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }
    );
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response?.data || error.message
    );
  }
}

// Function to send gender selection template
async function sendGenderTemplate(to) {
  try {
    await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: "Please select your gender:",
          },
          action: {
            buttons: [
              { type: "reply", reply: { id: "male", title: "Male" } },
              { type: "reply", reply: { id: "female", title: "Female" } },
              { type: "reply", reply: { id: "other", title: "Other" } },
            ],
          },
        },
      },
      {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }
    );
  } catch (error) {
    console.error(
      "Error sending gender template:",
      error.response?.data || error.message
    );
  }
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
