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
    // console.log(args.q);
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/lib/prod`;

      const response = await axios.post(url, args, {
        headers,
      });
      const items = response.data.items || {};

      const products = checkItems(items);

      // console.log(products);

      return products;
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },
  get_prod_bal: async (args) => {
    // console.log(args);
    const headers = getHeaders();

    try {
      const url = `${BASE_URL}/trans/search/prod/inv-bal`;

      const response = await axios.get(url, {
        headers: headers,
        params: args,
      });

      const bal = response.data.qtyBAL;
      console.log(bal);

      return {
        status: "success",
        data: bal,
      };
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

  const isChart = /graph|chart|plot|visual/i.test(userMessage);

  let finalData = {};

  try {
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: userMessage,
            },
          ],
        },
      ],
      tools,
    };
    // console.log("payload", payload);
    let response;
    response = await axios.post(`${BASE_URL}/ai/gemini`, payload, {
      headers,
    });

    // console.log("initial", response);

    while (true) {
      let functionResponses = [];
      const functionCalls =
        response?.data?.candidates?.[0]?.content?.parts?.filter(
          (p) => p.functionCall,
        ) || [];

      if (!functionCalls.length) break;

      for (const func of functionCalls) {
        const { name, args } = func.functionCall;

        if (!functions[name]) throw new Error(`Function ${name} not defined`);

        const result = await functions[name](args || {});

        functionResponses.push({
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

        // console.log("array", functionResponses);
      }

      // console.log("funcRes", result);

      const modelContent = response?.data?.candidates?.[0]?.content;

      const toolPayload = {
        contents: [...payload.contents, modelContent, ...functionResponses],
        tools,
      };
      console.log("secondary", toolPayload);

      response = await axios.post(`${BASE_URL}/ai/gemini`, toolPayload, {
        headers,
      });

      // console.log("secondary", response);
    }

    const finalText =
      response?.data?.candidates?.[0]?.content?.parts
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
