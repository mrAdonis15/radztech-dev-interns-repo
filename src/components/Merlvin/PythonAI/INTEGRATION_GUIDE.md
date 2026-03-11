# Python AI Integration - Quick Reference

## ✅ Your Setup is Complete!

Your Python AI service is already integrated and ready to use. Here's how to use it:

---

## Basic Usage

### Import the Service

```javascript
import {
  sendMessageToPythonAI,
  getInventory,
  getBalance,
  generateChart,
} from "./pythonAIService";
```

### Send a Chat Message

```javascript
const response = await sendMessageToPythonAI("What is my current inventory?");
console.log(response);
```

### Get Inventory Data

```javascript
const inventory = await getInventory("all"); // or specific category
console.log(inventory);
```

### Get Balance Information

```javascript
const balance = await getBalance();
console.log(balance);
```

### Generate Charts

```javascript
const chartData = await generateChart("Show sales over time", "line");
// chartType options: 'line', 'bar', 'pie'
console.log(chartData);
```

---

## How It Works

### Token Flow

1. **User logs into clone.ulap.biz** → Gets `authToken` (stored in localStorage)
2. **Python AI service initializes** → Gets AI backend JWT token (auto-managed)
3. **User sends message** → Service includes both tokens:
   - `Authorization: Bearer {aiToken}` (header)
   - `user_auth_token: {authToken}` (request body)
4. **Backend fetches data** → Uses `authToken` to get data from clone.ulap.biz
5. **Response returns to frontend** → Display to user

### File Structure

```
src/components/Merlvin/PythonAI/
├── pythonAIService.js      ← Main service (you use this)
├── pythonAIClient.js       ← Axios client with interceptors
├── tokenManager.js         ← AI token management (auto)
├── ChatBoxPythonAI.js      ← Chat UI component
└── PythonAIPage.js         ← Page wrapper
```

---

## Current Features

✅ **Auto Token Management** - AI backend tokens refresh automatically  
✅ **User Auth Integration** - Uses your existing clone.ulap.biz token  
✅ **Error Handling** - Automatic retry on 401 errors  
✅ **Request Interceptors** - Tokens added to all requests automatically  
✅ **localStorage Persistence** - Tokens persist across page reloads

---

## API Endpoints

### Chat

- **POST** `/api/chat`
- Body: `{ message, user_auth_token }`

### Inventory

- **POST** `/api/inventory`
- Body: `{ category, user_auth_token }`

### Balance

- **POST** `/api/balance`
- Body: `{ data_source, user_auth_token }`

### Chart

- **POST** `/api/chart`
- Body: `{ chart_type, message, user_auth_token }`

---

## Example: Using in a Component

```javascript
import React, { useState } from "react";
import { sendMessageToPythonAI } from "../pythonAIService";

function MyComponent() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    setLoading(true);
    try {
      const result = await sendMessageToPythonAI("Show me inventory");
      setResponse(result);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleAskAI} disabled={loading}>
        {loading ? "Loading..." : "Ask AI"}
      </button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
}
```

---

## Troubleshooting

### "Failed to initialize Python AI"

→ Make sure backend is running: `http://localhost:8000`

### "401 Unauthorized"

→ User needs to log in to clone.ulap.biz again (token expired)

### CORS errors

→ Backend has CORS enabled for localhost:3000

### Check tokens

```javascript
// In browser console:
localStorage.getItem("authToken"); // User token
localStorage.getItem("python_ai_jwt_token"); // AI token
```

---

## Configuration

Backend URL is set in `tokenManager.js`:

```javascript
const tokenManager = new TokenManager("http://localhost:8000");
```

User token is read from localStorage:

```javascript
const userToken = localStorage.getItem("authToken");
```

---

## Need Help?

- Check [ChatBoxPythonAI.js](./ChatBoxPythonAI.js) for full implementation example
- Backend docs: `/Users/mcbair/Desktop/pythonbotAI/docs/`
- Test in browser console: `import { sendMessageToPythonAI } from './pythonAIService'`
