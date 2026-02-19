require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expressWs = require('express-ws');
const twilio = require('twilio');
const axios = require('axios');

const app = express();

// Initialize express-ws
ExpressWs(app);
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

// n8n configuration
app.post('/n8n', (req, res) => {

  const twiml = new twilio.twiml.VoiceResponse();
  //console.log(twiml);
  //twiml.say("Hello there!");
  const connect = twiml.connect();
  const conversationrelay = connect.conversationRelay({
    url: 'wss://8477-2001-a61-a09-dd01-345d-fa07-8494-6620.ngrok-free.app/echo',
    welcomeGreeting: 'Hi! Ask me anything!'
  });
  conversationrelay.language({
      code: 'en-US',
      ttsProvider: 'google',
      voice: 'en-US-Journey-O'
  });
  res.type('text/xml');
  res.send(twiml.toString());
})

// WebSocket route
app.ws('/echo', (ws, req) => {
  let session_id = "123";
  ws.on('message', async (msg) => {
    console.log('Received:', msg);
    const json_msg = JSON.parse(msg);
    if (json_msg.type === 'prompt') {
      const n8n_response = await axios.post(
        'https://n8n-solutions.app.n8n.cloud/webhook/agent', 
        {
          message: json_msg.voicePrompt,
          language: json_msg.lang,
          session_id: session_id
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
