import axios from "axios";
import { getBizToken } from "../selectedBiz";
import { result } from "lodash";

const BASE_URL = "http://localhost:3000/api";
const FALL_BACK_MSG =
  "Sorry, I'm having trouble processing your request. Please try again.";

let currentEndpoints = {};

function getEndpoint(id) {
  const endpoint = currentEndpoints.find((e) => e.id === id);

  console.log("selected-endpoint", endpoint);

  if (typeof endpoint.keyword === "string") {
    endpoint.keyword = JSON.parse(endpoint.keyword);
  }

  if (typeof endpoint.parameters === "string") {
    endpoint.parameters = JSON.parse(endpoint.parameters);
  }

  return endpoint;
}

// TOOLS
const functions = {
  fetchEndpoints: async () => {
    currentEndpoints = {};
    const token = getBizToken();

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-access-tokens": token,
    };

    const payload = { keys: "ChatAI_Endpoint" };
    try {
      const url = `${BASE_URL}/setup/biz/kvs/items`;

      const response = await axios.post(
        url,
        {
          payload,
        },
        {
          headers,
        },
      );

      const endpoints = response.data[1].value;
      currentEndpoints = endpoints;

      // console.log("endpoints", endpoints);

      if (response.data.length === 0) {
        return {
          type: "text",
          text: "Sorry, I currently don't have access to the access to the data.",
        };
      }

      return {
        status: "success",
        data: endpoints,
      };
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },

  callEndpoint: async (args) => {
    const endpoint = getEndpoint(args.id);

    console.log("formatted-endpoint", endpoint);

    if (!endpoint) {
      return { status: "error", message: "Endpoint not found" };
    }

    const method = endpoint.method?.toUpperCase();

    const requiredParams = endpoint.parameters || [];

    const finalParams = {
      ...(args.parameters || {}),
    };

    const missing = requiredParams.filter((p) => !(p in finalParams));

    if (missing.length > 0) {
      return {
        status: "missing_params",
        requiredParams: missing,
      };
    }

    const token = getBizToken();

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-access-tokens": token,
    };

    try {
      const fullUrl = `${BASE_URL}${endpoint.endpoints}`;
      let response;

      if (method === "GET") {
        response = await axios.get(fullUrl, {
          headers,
          params: finalParams,
        });
      } else if (method === "POST") {
        response = await axios.post(fullUrl, finalParams, {
          headers,
        });
      } else if (method === "PUT") {
        response = await axios.put(fullUrl, finalParams, {
          headers,
        });
      } else {
        throw new Error("Unsupported method");
      }

      console.log("http-response", response.data);

      return {
        status: "success",
        data: response.data,
      };
    } catch (err) {
      return {
        status: "error",
        message: err.response?.data || err.message,
      };
    }
  },

  getDateRange: (args) => {
    const pad = (n) => (n ?? 0).toString().padStart(2, "0");

    const formatPH = (year, month, day, hour = 0, min = 0, sec = 0) =>
      `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(min)}:${pad(sec)}+08:00`;

    const parseDate = (dateStr) => {
      if (!dateStr) return {};

      const [month, day, year] = dateStr.split("-").map(Number);

      return { year, month, day };
    };

    const start = parseDate(args?.startDate);
    const end = parseDate(args?.endDate);

    const dt1 = formatPH(start.year, start.month, start.day);
    const dt2 = formatPH(end.year, end.month, end.day);

    return { dt1, dt2 };
  },
};

const tools = [
  {
    functionDeclarations: [
      {
        name: "fetchEndpoints",
        description:
          "Return all available endpoints including description, keywords and required parameters.",
        parameters: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "callEndpoint",
        description:
          "Execute a selected endpoint using its URL and required parameters.",
        parameters: {
          type: "object",
          properties: {
            url: { type: "string" },
            params: { type: "object" },
          },
          required: ["url", "params"],
        },
      },
      {
        name: "getDateRange",
        description:
          "Use this to format the required dt1 and dt2 parameters on reports.",
        parameters: {
          type: "object",
        },
      },
      {
        name: "search_product",
        description: "Use this to search for specific products.",
        parameters: {
          type: "object",
          properties: {
            q: { type: "string" },
          },
          required: ["q"],
        },
      },
    ],
  },
];

//  MAIN FUNCTION
export async function sendToGemini(userMessage) {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-access-tokens": token,
  };

  let payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ],
    tools,
  };

  let messages = [...payload.contents];

  try {
    let finalData = {};
    let max_loops = 2;

    let response = await axios.post(
      `${BASE_URL}/ai/gemini`,
      { contents: messages },
      { headers },
    );

    while (true) {
      const candidate = response.data.candidates?.[0];
      if (!candidate) {
        console.log("no candidate break");
        break;
      }

      const parts = candidate.content?.parts || [];

      const functionCall = parts.find((p) => p.functionCall);

      if (!functionCall) {
        console.log("no functionCall break");
        break;
      }

      const { name, args } = functionCall.functionCall;

      if (!functions[name]) {
        throw new Error(`Function ${name} not defined`);
      }

      messages.push({
        role: "model",
        parts: parts,
      });

      const result = await functions[name](args || {});
      finalData = result;

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

      response = await axios.post(
        `${BASE_URL}/ai/gemini`,
        { contents: messages },
        { headers },
      );
    }

    const finalText =
      response.data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        ?.join("") || FALL_BACK_MSG;

    return {
      type: "text",
      text: finalText,
      data: finalData,
    };
  } catch (err) {
    console.error(err);
  }
}
