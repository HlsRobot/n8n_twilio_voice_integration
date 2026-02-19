# N8N Twilio Voice Integration

A Node.js application that integrates Twilio voice services with N8N automation platform through WebSocket communication for real-time voice processing and AI-powered responses.

## Overview

This project creates a bridge between Twilio's voice service and N8N's automation workflows. When a call comes in through Twilio, the audio stream is captured via WebSocket and sent to an N8N webhook for processing. This enables voice-based automation, voice assistant functionality, and real-time voice interaction with N8N workflows.

## Features

- **Twilio Voice Integration** - Accept and process inbound/outbound voice calls
- **WebSocket Streaming** - Real-time audio stream handling through WebSockets
- **N8N Webhook Integration** - Process voice prompts through N8N automation workflows
- **Session Management** - Maintain session IDs for conversation continuity
- **Language Support** - Support for multiple languages with Google Text-to-Speech
- **Express Server** - Fast HTTP and WebSocket server

## Project Structure

```
├── index.js                 # Main application server
├── package.json            # Project dependencies and scripts
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Requirements

- Node.js 16 or higher
- npm or yarn
- Twilio account with phone number
- N8N instance with webhook capability
- ngrok (for local development tunneling)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration:
   - `ACCOUNT_SID` - Your Twilio Account SID
   - `AUTH_TOKEN` - Your Twilio Auth Token
   - `NGROK_DOMAIN` - Your ngrok domain for WebSocket URL
   - `N8N_WEBHOOK_URL` - Your N8N webhook endpoint URL
   - `PORT` - Server port (default: 3001)

## Running the Project

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on the port specified in `.env` (default: 3001).

## Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `ACCOUNT_SID` | Your Twilio Account SID | Yes | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `AUTH_TOKEN` | Your Twilio Auth Token | Yes | `your_auth_token_here` |
| `NGROK_DOMAIN` | Your ngrok domain for WebSocket URL | Yes | `xxxx-xx-xxx-xxx-xx.ngrok.io` |
| `N8N_WEBHOOK_URL` | Your N8N webhook endpoint URL | Yes | `https://n8n-instance.com/webhook/voice-agent` |
| `PORT` | Server port | No | `3001` |

## API Endpoints

### GET `/`
Health check endpoint - returns server status.

**Response:**
```
WebSocket Server Running
```

### POST `/n8n`
Generates a Twilio VoiceResponse with WebSocket stream configuration.

This endpoint is called by Twilio when a voice call is received. It returns TwiML (Twilio Markup Language) that instructs Twilio to stream the call's audio to the WebSocket endpoint.

**Response:** XML (TwiML format)

### WebSocket `/echo`
Handles real-time voice stream and communication with N8N workflows.

**Message Types:**

**1. Setup Message** - Initialize session
```json
{
  "type": "setup",
  "sessionId": "user_session_123"
}
```

**2. Prompt Message** - Send voice prompt to N8N
```json
{
  "type": "prompt",
  "voicePrompt": "What is the weather today?",
  "lang": "en-US"
}
```

**Response:**
```json
{
  "response": "The weather is sunny and warm.",
  "sessionId": "user_session_123"
}
```

## How It Works

1. **Incoming Call** - Twilio receives an inbound call and routes it to the `/n8n` endpoint
2. **TwiML Generation** - Server generates TwiML instructions with WebSocket stream URL
3. **Audio Streaming** - Twilio streams call audio to the WebSocket endpoint (`/echo`)
4. **Message Processing** - Voice prompts are sent to N8N webhook for AI processing
5. **Response Handling** - N8N responses are sent back through WebSocket to Twilio
6. **Audio Output** - Twilio converts response text to speech and plays it to the caller

## Code Explanation

### Main Server Setup (index.js)

**Dependencies:**
```javascript
const express = require('express');           // Web framework
const expressWs = require('express-ws');      // WebSocket support
const bodyParser = require('body-parser');    // Request parsing
const twilio = require('twilio');             // Twilio SDK
const axios = require('axios');               // HTTP client for webhooks
```

**Middleware:**
- `bodyParser.json()` - Parse JSON request bodies
- `express.urlencoded()` - Parse form-encoded request bodies
- `expressWs(app)` - Enable WebSocket support

**Key Functions:**

1. **GET / (Health Check)**
   - Simple endpoint to verify server is running
   - Used for testing connectivity

2. **POST /n8n (Twilio Webhook)**
   - Creates Twilio VoiceResponse with WebSocket stream
   - Configures language and TTS settings
   - Returns TwiML XML to Twilio

3. **WS /echo (WebSocket Handler)**
   - Receives audio and message data from Twilio
   - Processes two message types: `setup` and `prompt`
   - Sends prompts to N8N webhook using axios
   - Maintains session state
   - Returns responses to caller

### Session Management

Sessions are tracked using `session_id`:
- Initialized in `setup` message
- Used in all subsequent `prompt` messages
- Enables N8N to maintain conversation context

### Error Handling

- Port conflict detection (EADDRINUSE)
- WebSocket connection error handling
- HTTP request error handling for N8N webhooks
- JSON parsing error handling

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework for HTTP/WebSocket server |
| express-ws | ^5.0.2 | WebSocket support for Express |
| body-parser | ^1.20.2 | Middleware for parsing request bodies |
| twilio | ^5.3.6 | Twilio SDK for voice integration |
| axios | ^1.6.0 | HTTP client for N8N webhook requests |
| dotenv | ^16.3.1 | Environment variable management |

## Local Development with ngrok

For local testing with Twilio webhooks:

1. **Install ngrok**
   ```bash
   brew install ngrok  # macOS
   # or download from https://ngrok.com
   ```

2. **Start ngrok tunnel**
   ```bash
   ngrok http 3001
   ```
   This will output a URL like: `https://xxxx-xx-xxx-xxx-xx.ngrok.io`

3. **Update .env**
   ```
   NGROK_DOMAIN=xxxx-xx-xxx-xxx-xx.ngrok.io
   ```

4. **Configure Twilio Webhook**
   In your Twilio console, set the webhook URL to:
   ```
   https://<NGROK_DOMAIN>/n8n
   ```

## N8N Workflow Integration

Your N8N workflow should:

1. **Use a Webhook trigger** to accept incoming POST requests

2. **Expect request body format:**
   ```json
   {
     "message": "voice prompt text",
     "language": "en-US",
     "session_id": "session_123"
   }
   ```

3. **Process the request** (e.g., with LLM, API calls, logic)

4. **Return response in format:**
   ```json
   {
     "response": "response text",
     "sessionId": "session_123"
   }
   ```

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port 3001
lsof -i :3001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
```

### WebSocket Connection Failed
- Verify ngrok is running: `ngrok http 3001`
- Check NGROK_DOMAIN is correctly set in `.env`
- Confirm Twilio webhook URL points to correct ngrok domain
- Check firewall/network settings allow WebSocket connections

### N8N Webhook Not Responding
- Verify N8N_WEBHOOK_URL is accessible from your network
- Test webhook with curl or Postman
- Check N8N workflow is active and accepting requests
- Review N8N logs for execution errors
- Ensure webhook response format matches expected structure

### Invalid JSON in WebSocket Messages
- Ensure all messages are valid JSON format
- Include required fields: `type`, and context-specific fields
- Check message encoding (should be UTF-8)

## Best Practices

1. **Security**
   - Never commit `.env` file to version control
   - Rotate Twilio credentials regularly
   - Use environment variables for sensitive data

2. **Debugging**
   - Enable console logs to track message flow
   - Test N8N webhook independently with curl
   - Monitor ngrok request inspector for traffic

3. **Performance**
   - Keep N8N workflows efficient for low latency
   - Implement timeout handling for hung connections
   - Consider rate limiting for webhook endpoints

## Future Enhancements

- [ ] Session persistence with database storage
- [ ] Call recording and playback support
- [ ] Automatic language detection
- [ ] Rate limiting and authentication
- [ ] Detailed call analytics and logging
- [ ] Webhook retry logic with exponential backoff
- [ ] Integration with multiple LLM providers
- [ ] Message queueing for high-volume calls
- [ ] Sentiment analysis on caller voice

## License

ISC

## Support

For issues or questions, refer to:
- [Twilio Voice Documentation](https://www.twilio.com/docs/voice)
- [N8N Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base-webhook/)
- [Express.js Guide](https://expressjs.com)
- [WebSocket Protocol](https://tools.ietf.org/html/rfc6455)

