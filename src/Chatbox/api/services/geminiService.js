import axios from "axios";
import { tools, functions, getHeaders } from "./tools.js";

const BASE_URL = "http://localhost:3000/api";

const FALL_BACK_MSG =
  "Sorry, I'm having trouble processing your request. Please try again.";

//  MAIN FUNCTION
export async function sendToGemini(userMessage) {
  const headers = getHeaders();
  if (!headers["x-access-tokens"] && typeof localStorage !== "undefined") {
    headers["x-access-tokens"] = localStorage.getItem("authToken");
  }

  let session_id = localStorage.getItem("session_id");

  console.log("session_id", session_id);

  try {
    const payload = {
      message: userMessage,
      ...(session_id && { session_id }),
      ...(session_id ? {} : { tools }),
    };

    // console.log("payload", payload);
    const genai_base_url = "http://localhost:3000";
    let response;
    response = await axios.post(`${genai_base_url}/genai/chat`, payload, {
      headers,
    });

    if (!session_id) {
      session_id = response.data.session_id;
      localStorage.setItem("session_id", session_id);
    }

    let functionCall;

    while (true) {
      functionCall = response?.data?.function_call;

      if (!functionCall) break;

      if (functionCall) {
        const { name, args } = functionCall;

        if (!functions[name]) throw new Error(`Function ${name} not defined`);
        const result = await functions[name](args || {});

        const resultPayload = {
          session_id,
          message: JSON.stringify(result),
        };

        response = await axios.post(
          `${genai_base_url}/genai/chat`,
          resultPayload,
          {
            headers,
          },
        );

        if (result?.type === "chart") {
          console.log("chart-data", result);
          return result;
        }
      }
    }

    const text = response?.data?.text;

    // If the model returns structured JSON with type: "img", surface it as an image payload.
    if (typeof text === "string") {
      try {
        const parsed = JSON.parse(text);
        if (
          parsed &&
          parsed.type === "img" &&
          Array.isArray(parsed.images)
        ) {
          return {
            type: "img",
            images: parsed.images,
            session_id,
          };
        }
      } catch {
        // fall through to plain text handling
      }
    }

    return { type: "text", text: text || FALL_BACK_MSG, session_id };
  } catch (err) {
    console.error("Gemini error:", err);
    const status = err.response?.status;
    const is504 =
      status === 504 ||
      /504|gateway timeout/i.test(String(err.message || err.code));
    const isNetworkError =
      !err.response &&
      (err.code === "ECONNABORTED" ||
        err.code === "ECONNREFUSED" ||
        err.code === "ERR_NETWORK" ||
        /network|failed to fetch|cors/i.test(String(err.message || "")));
    let text;
    if (is504) {
      text =
        "The request took too long (504 Gateway Timeout). Please try again or use a smaller date range for reports.";
    } else if (isNetworkError) {
      text =
        "Cannot reach the server. Check that the API is running at " +
        BASE_URL +
        " and try again. If using a different port or URL, set it in geminiService.js (BASE_URL).";
    } else {
      text =
        "Sorry, I'm having trouble processing your request. Please try again. " +
        (err.response?.data?.message || err.message || "").slice(0, 80);
    }
    return {
      type: "text",
      text,
    };
  }
}
