<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## N8N Twilio Voice Integration Project

This is a Node.js application that integrates N8N with Twilio voice services.

### Project Structure
- `index.js` - Main Express server with Twilio integration
- `package.json` - Project dependencies and scripts
- `.env.example` - Environment variables template
- `README.md` - Project documentation

### Development Guidelines
- Start the server with `npm run dev` for development mode
- Use `npm start` for production
- Configure Twilio credentials in `.env` file
- WebSocket support available at `/echo` endpoint

### Key Technologies
- Express.js - Web framework
- Twilio SDK - Voice integration
- Express-WS - WebSocket support
- Axios - HTTP requests
- Body-parser - Request parsing
- Dotenv - Environment management
