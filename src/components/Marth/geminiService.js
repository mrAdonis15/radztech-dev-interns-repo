import { GoogleGenerativeAI } from "@google/generative-ai";
import stockCard from "./stockCard.json";
import dummyProducts from "./dummyProducts.json";
import ledger from "./ledger.json";
import stockCardGraph from "./stockCardGraph.json";
import { getStockCardData } from "./chartUtils.js";

const apiKey = "AIzaSyAZWsMwJ16J41jz69FL2QlbIa8fSYpkDdQ";

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

  getStockData: () => {
    return stockCard;
  },

  getLedgerData: () => {
    return ledger;
  },
  getStockChartData: () => {
    const data = stockCardGraph;
    const chartData = getStockCardData(data);
    return chartData;
  },
};

// Tool Declarations
const tools = [
  {
    functionDeclarations: [
      // {
      //   name: "getProductBalance",
      //   description: "Get the current balance for a product",
      //   parameters: {
      //     type: "OBJECT",
      //     properties: {
      //       description: {
      //         type: "STRING",
      //         description: "The product description, e.g., 'Aerox'",
      //       },
      //     },
      //     required: ["description"],
      //   },
      // },

      {
        name: "getStockData",
        description:
          "Get stock summary for specific products. Use this when user ask anything related to stock or inventory of a certain product.",
        parameters: {
          type: "OBJECT",
        },
      },
      {
        name: "getLedgerData",
        description:
          "Get the full ledger data for more complex queries or analysis. Use this when user ask anything related to ledger or transactions.",
        parameters: {
          type: "OBJECT",
        },
      },
      {
        name: "getStockChartData",
        description:
          "Get the chart data for stock card. Use this when user ask to provide stock card for a certain product.",
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

  const systemContext = `
You are a professional business support assistant for Ulap Biz chat.

ROLE:
- Assist users with business-related questions including finance, sales, inventory, reports, and operational insights.
- You may call functions when structured data is required.
- Use function results to generate clear, business-friendly explanations.

DATA HANDLING RULES:
- Never expose raw database fields, column names, JSON keys, or technical identifiers.
- Never repeat internal field names such as system codes, formulas, or property names.
- Transform structured data into natural business language before responding.
- Do not explain how data was retrieved.
- Do not output raw JSON unless explicitly required.

FINANCIAL INTERPRETATION RULES:
- Format all monetary values with comma separators and exactly 2 decimal places.
- Interpret debit/credit correctly based on account classification.
- Never interpret debit as profit unless the account classification is Revenue or Profit/Loss.
- Always explain net movement relative to the account type.
- If interpretation depends on account classification and it is unclear, state that interpretation depends on account type.

CHART & STRUCTURED OUTPUT RULES:
- Provide a concise business summary and insights.
- Do not describe the chart configuration, technical structure, or internal keys.
- Focus on trends, comparisons, growth/decline, highest/lowest values, and notable patterns.
- If the data represents financial values, apply proper financial interpretation rules.
- Do not mention field names, JSON keys, or system properties in the explanation.
- Keep insights clear, actionable, and business-oriented.

RESPONSE STYLE:
- Be concise, clear, and professional.
- Provide insight, not just numbers.
- Avoid technical language unless necessary.
- Focus on helping business users understand what the data means.

Your goal is to convert structured business data into meaningful insights suitable for non-technical business users.
`;

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

      // console.log("Initial response:", response);

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

        console.log("functionResult:", functionResult);

        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name,
              response: { content: functionResult },
            },
          },
        ]);

        if (functionResult?.chartType) {
          return {
            type: "chart",
            data: functionResult,
            text: followUp.response.text(),
          };
        }

        return {
          type: "text",
          text: followUp.response.text(),
        };
      }

      if (response.text) {
        const reply =
          typeof response.text === "function" ? response.text() : response.text;
        if (reply != null && String(reply).trim()) return String(reply).trim();
      }

      lastError = new Error("Empty reply from model");
    } catch (err) {
      lastError = err;
      console.log("error:", err);
      console.warn("Gemini model " + modelName + " failed:", err);
    }
  }

  console.error("Gemini API error (all models failed):", lastError);
  // const msg = lastError?.message || String(lastError);
  return "Something went wrong. Please try again.";
}
