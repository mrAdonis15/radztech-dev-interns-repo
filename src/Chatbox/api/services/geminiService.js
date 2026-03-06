import axios from "axios";
import { getBizToken } from "../selectedBiz";
import { result } from "lodash";

const BASE_URL = "http://localhost:3000/api";
const FALL_BACK_MSG =
  "Sorry, I'm having trouble processing your request. Please try again.";

function getHeaders() {
  const token = getBizToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-access-tokens": token,
  };

  return headers;
}

function checkItems(data) {
  if (data.length > 10) {
    return {
      status: "error",
      error: "too many exist",
      data: data.slice(0, 10),
    };
  }
  if (data.length > 1) {
    return {
      status: "success",
      error: "multiple_exist",
      data: data,
    };
  }

  if (data.length === 0) {
    return {
      status: "error",
      error: "not_found",
      text: "Sorry, I couldn't find the item,",
    };
  }
  return {
    status: "success",
    data: data,
  };
}

// TOOLS
const functions = {
  search_prod: async (args) => {
    console.log(args.q);
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/lib/prod`;

      const response = await axios.post(url, args, {
        headers,
      });
      const items = response.data.items || {};

      const products = checkItems(items);

      console.log(products);

      return products;
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
  get_prod_bal: async (args) => {
    console.log(args);
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/trans/search/prod/inv-bal`;

      const response = await axios.get(url, {
        headers: headers,
        params: args,
      });

      const bal = response.data;

      return bal;
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
};

const tools = [
  {
    functionDeclarations: [
      {
        name: "search_prod",
        description: "Use this to search for specific products.",
        parameters: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "The name or category of the product",
            },
          },
          required: ["q"],
        },
      },
      {
        name: "get_prod_bal",
        description:
          "Get the balance of a certain product. Only use this if the user specifically needs the balance of a certain product.",
        parameters: {
          type: "object",
          properties: {
            ixProd: {
              type: "integer",
              description: "The id of the product",
            },
            ixWH: {
              type: "integer",
              description: "Use 4282 as ixWH",
            },
          },
          required: ["ixProd"],
        },
      },
    ],
  },
];

//  MAIN FUNCTION
export async function sendToGemini(userMessage, messageHistory = []) {
  const token = localStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-access-tokens": token,
  };

  if (!token) {
    return { type: "text", text: "Sorry, I'm not configured properly." };
  }

  const isChart = /graph|chart|plot|visual/i.test(userMessage);

  // Initialize the conversation
  const messages = [
    ...messageHistory.slice(-10).map((m) => ({
      role: m.sender === "me" ? "user" : "assistant",
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  let finalData = {};

  try {
    let geminiResponse;

    while (true) {
      // Send current conversation to Gemini
      const payload = { contents: messages, tools };
      const response = await axios.post(`${BASE_URL}/ai/gemini`, payload, {
        headers,
      });
      geminiResponse = response.data;

      const candidates = geminiResponse.candidates;
      // if (!candidates) break;

      // Check for functionCall
      const functionCallPart =
        geminiResponse?.candidates?.[0]?.content?.parts?.find(
          (p) => p.functionCall,
        );

      if (!functionCallPart) break; // no more tools to call

      const { name, args } = functionCallPart.functionCall;

      if (!functions[name]) throw new Error(`Function ${name} not defined`);

      // Execute tool locally
      const result = await functions[name](args || {});
      finalData = result;

      // Append the tool result as assistant message
      console.log(result.error || "");

      if (result.status === "error" || typeof result === "string") {
        messages.push({
          role: "model",
          parts: [
            {
              text:
                result.status === "error"
                  ? result.text
                  : JSON.stringify(result),
            },
          ],
        });
      } else {
        messages.push({
          role: "tool",
          parts: [
            {
              functionResponse: {
                name,
                response: result,
              },
            },
          ],
        });
      }
    }

    // Build final response text
    const finalText =
      geminiResponse?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        ?.join("") || FALL_BACK_MSG;

    if (isChart) {
      return { type: "chart", data: finalData, text: finalText };
    }

    return { type: "text", text: finalText };
  } catch (err) {
    console.error("Gemini error:", err);
    return {
      type: "text",
      text: "Sorry, I'm having trouble processing your request.",
    };
  }
}
