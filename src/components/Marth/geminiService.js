import { GoogleGenerativeAI } from "@google/generative-ai";
import stockCard from "./stockCard.json";
import dummyProducts from "./dummyProducts.json";

const apiKey =
  process.env.REACT_APP_GEMINI_API_KEY ||
  "AIzaSyBZclrjBj_Xo9_oMbEYMqZIgRqV-eijSTs";

const modelNames = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
];

// Actual Functions
const functions = {
  // response based on dummyProducts.json
  getProductBalance: ({ description }) => {
    if (!description || typeof description !== "string") {
      return "Please provide a valid product description.";
    }

    const matches = dummyProducts.filter((p) =>
      p.product.toLowerCase().includes(description.toLowerCase()),
    );

    if (matches.length === 0) {
      return `Sorry, no product found matching "${description}".`;
    }

    if (matches.length === 1) {
      const product = matches[0];
      return `The current balance of ${product.product} is ${product.balance}.`;
    }
    const options = matches.map((p) => p.product).join(", ");
    return `Multiple products match "${description}". Please specify which one: ${options}.`;
  },

  // response based on stockCard.json
  getTotals: () => {
    return stockCard.totals;
  },

  getData: () => {
    return stockCard;
  },
};

// Tool Declarations
const tools = [
  {
    functionDeclarations: [
      {
        name: "getProductBalance",
        description: "Get the current balance for a product",
        parameters: {
          type: "OBJECT",
          properties: {
            description: {
              type: "STRING",
              description: "The product description, e.g., 'Aerox'",
            },
          },
          required: ["description"],
        },
      },
      {
        name: "getTotals",
        description:
          "Get different totals such as total qyt in/out, order in/out, running balance, etc. based on user prompt",
        parameters: {
          type: "OBJECT",
        },
      },
      {
        name: "getData",
        description:
          "Get the full dataset for more complex queries or analysis. Use this when the user asks for detailed data or comparisons.",
        parameters: {
          type: "OBJECT",
        },
      },
    ],
  },
];

/**
 * @param {string} userMessage
 * @param {Array<{ sender: string, text: string }>} [messageHistory]
 * @returns {Promise<string>}
 */

export async function sendToGemini(userMessage, messageHistory) {
  if (!apiKey) {
    return "Gemini is not configured. Please set REACT_APP_GEMINI_API_KEY in your .env file.";
  }

  const systemContext =
    "You are a helpful support assistant for Ulap Biz chat. You can call functions that returns data when appropriate. If the response includes monery, place the correct separator with 2 decimal places. Be concise and clear.";

  function buildPrompt(history, current, context) {
    let text = context + "\n\n";
    if (Array.isArray(history) && history.length > 0) {
      const recent = history.slice(-10);
      recent.forEach((m) => {
        const role = m.sender === "me" ? "User" : "Assistant";
        text += role + ": " + m.text + "\n";
      });
    }
    text += "User: " + current + "\nAssistant:";
    return text;
  }

  const prompt = buildPrompt(messageHistory, userMessage, systemContext);
  const genAI = new GoogleGenerativeAI(apiKey);

  let lastError = null;

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.5,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
        ],
        tools,
      });

      const chat = model.startChat();

      // Message
      let result = await chat.sendMessage(prompt);
      let response = result.response;

      console.log("Initial response:", response);

      if (!response) {
        lastError = new Error("No response from model");
        continue;
      }

      const getFunction = response.candidates?.[0]?.content?.parts?.find(
        (p) => p.functionCall,
      );

      if (getFunction) {
        const { name, args } = getFunction.functionCall;

        if (!functions[name]) {
          throw new Error(`Function ${name} is not defined`);
        }

        const parsedArgs = args || {};
        const functionResult = await functions[name](parsedArgs);

        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name,
              response: { content: functionResult },
            },
          },
        ]);

        return followUp.response.text();
      }

      if (response.text) {
        const reply =
          typeof response.text === "function" ? response.text() : response.text;
        if (reply != null && String(reply).trim()) return String(reply).trim();
      }

      lastError = new Error("Empty reply from model");
    } catch (err) {
      lastError = err;
      console.warn("Gemini model " + modelName + " failed:", err);
    }
  }

  console.error("Gemini API error (all models failed):", lastError);
  const msg = lastError?.message || String(lastError);
  return (
    "Something went wrong: " + (msg.length > 80 ? msg.slice(0, 80) + "…" : msg)
  );
}
