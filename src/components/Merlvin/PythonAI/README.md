# Python AI Chatbox Integration

This folder contains the Python AI chatbox implementation and API client for integrating with your Python AI backend.

## Files Overview

### 1. `config.js`

Configuration file for Python AI API settings.

- Stores the API key
- Configures the base URL for the Python AI backend
- Uses environment variable `REACT_APP_PYTHON_AI_URL` (falls back to `http://localhost:5000/api`)

### 2. `pythonAIClient.js`

Axios client configured for Python AI API requests.

- Automatically includes API key in Authorization header
- Handles request/response interceptors
- Error handling with descriptive messages

### 3. `pythonAIService.js`

Service layer for API operations.

**Available Functions:**

- `sendMessageToPythonAI(message, conversationId)` - Send user message to AI
- `getChatHistory(conversationId, limit)` - Retrieve conversation history
- `createConversation(title)` - Start a new conversation
- `deleteConversation(conversationId)` - Delete a conversation
- `generateChart(data, chartType)` - Generate charts from data

### 4. `ChatBoxMerlvin.js`

Main chatbox React component.

- Similar UI to the existing Chatbox folder
- Uses Python AI service for message handling
- Auto-scrolls to latest messages
- Loading states and error handling
- Supports structured responses (text, charts, etc.)

### 5. `ChatBoxMerlvin.css`

Styling for the chatbox component.

- Gradient purple theme (#667eea to #764ba2)
- Responsive design for mobile/desktop
- Smooth animations and transitions

### 6. `index.js`

Central export file for easy imports.

## Usage

### In your main App.js or another component:

```javascript
import { ChatBoxMerlvin } from "./components/Merlvin/PythonAI";

function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatBoxMerlvin defaultOpen={false} />
    </div>
  );
}
```

### Using the API Service directly:

```javascript
import { sendMessageToPythonAI, generateChart } from "./components/Merlvin/PythonAI";

// Send a message
const response = await sendMessageToPythonAI("Hello AI", "conv-123");
console.log(response); // { reply: "...", type: "text", etc. }

// Generate a chart
const chart = await generateChart({ labels: [...], values: [...] }, "bar");
```

## Environment Setup

Add to your `.env` file:

```
REACT_APP_PYTHON_AI_URL=http://localhost:5000/api
```

Or use the default `http://localhost:5000/api` if running locally.

## API Key

The API key is currently hardcoded in `config.js`:

```
3GanPJF22xz1SxEb8BuIN3MfjraFdiDaiGIkkzgB6HA
```

For production, consider:

1. Moving the API key to environment variables
2. Using secure token management
3. Rotating keys regularly

## Expected Python Backend Response Format

The chatbox expects responses in this format:

```json
{
  "reply": "Your response text",
  "message": "Your response text (alternative field)",
  "type": "text",
  "data": null,
  "id": "message-123",
  "conversation_id": "conv-123"
}
```

For chart responses:

```json
{
  "reply": "Here's your chart",
  "type": "chart",
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "values": [10, 20, 15]
  }
}
```

## Styling Customization

The chatbox uses a gradient purple theme. To customize:

- Modify color values in `ChatBoxMerlvin.css`
- Update gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Adjust sizing and spacing as needed
