# N8N Twilio Voice Integration

This is a Node.js project for integrating N8N with Twilio voice services.

## Requirements

- Node.js 16+
- npm or yarn

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your Twilio credentials:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

## Running the Project

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on `http://localhost:3000` by default.

## Available Endpoints

- `GET /` - Health check
- `POST /voice` - Voice response endpoint for Twilio
- `WS /echo` - WebSocket echo endpoint

## Dependencies

- **express** - Web framework
- **express-ws** - WebSocket support for Express
- **body-parser** - Middleware for parsing request bodies
- **twilio** - Twilio SDK
- **axios** - HTTP client
- **dotenv** - Environment variable management
