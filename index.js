require('dotenv').config({override: true});
const express = require('express');
const bodyParser = require('body-parser');
const expressWs = require('express-ws');
const twilio = require('twilio');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const NGROK_DOMAIN = process.env.NGROK_DOMAIN;

// Initialize express-ws
expressWs(app);
// Enable CORS
app.use(bodyParser.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies

// Enable json parsing of request bodies
const jsonParser = bodyParser.json()

const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

// Basic HTTP endpoint
app.get('/', (req, res) => {
    res.send('WebSocket Server Running');
});

// Initial TwiML setup for incoming calls
app.post('/n8n', (req, res) => {

  const twiml = new twilio.twiml.VoiceResponse();
  const connect = twiml.connect();
  const conversationrelay = connect.conversationRelay({
    url: `wss://${NGROK_DOMAIN}/echo`,
    welcomeGreeting: 'Hi! Thank you for your call! How can I help you today?'
  });
  conversationrelay.language({
      code: 'en-US',
      ttsProvider: 'ElevenLabs',
      voice: 'NYC9WEgkq1u4jiqBseQ9'
  });
  res.type('text/xml');
  res.send(twiml.toString());
})

// WebSocket route for handling messages from the client
app.ws('/echo', (ws, req) => {
  // For now I am using a hardcoded session_id, but this should be generated dynamically in a real application.
  let session_id = "1233321";
  let phone_number = "";
  ws.on('message', async (msg) => {
    console.log('Received:', msg);
    const json_msg = JSON.parse(msg);
    if (json_msg.type === 'prompt') {
      const n8n_response = await axios.post(
        N8N_WEBHOOK_URL, 
        {
          message: json_msg.voicePrompt,
          language: json_msg.lang,
          session_id: session_id,
          phone: phone_number
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        } 
      ); 
      console.log("n8n Response:");
      console.log(n8n_response.data);
      ws.send(JSON.stringify(n8n_response.data)); // Send message back to client
    } else if (json_msg.type === 'setup') {
      session_id = json_msg.sessionId;
      phone_number = json_msg.from;
    };
  });
});

// Start the server
app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    } else {
        console.error('Failed to start server:', error);
    }
    process.exit(1);
});
