import axios from "axios";
import { tools } from "./geminiTools.js";
import { functions, getHeaders } from "./geminiFunctions.js";
import {
  SESSION_ID_KEY,
  CHAT_FALL_BACK_MSG,
} from "../constants/chatboxConstants.js";

const BASE_URL = "http://localhost:3000/api";

//  MAIN FUNCTION
export async function sendToGemini({ signal, userMessage }) {
  const headers = getHeaders();
  if (!headers["x-access-tokens"] && typeof localStorage !== "undefined") {
    headers["x-access-tokens"] = localStorage.getItem("authToken");
  }

  let session_id = localStorage.getItem(SESSION_ID_KEY);

  // console.log("session_id", session_id);

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
      signal,
    });
    // console.log("genai-response", response);
    if (!session_id) {
      session_id = response.data.session_id;
      localStorage.setItem(SESSION_ID_KEY, session_id);
    }

    let functionCall;
    let result;

    while (true) {
      if (signal.aborted) break;

      if (
        (result && result?.type === "img") ||
        (response?.data?.text && response?.data?.text.includes('"type": "img"'))
      ) {
        try {
          const data = JSON.parse(response?.data?.text);
          console.log("img", data);
          return { ...data, session_id, statusCode: response.status };
        } catch (error) {
          console.error("Invalid JSON:", error);
          return {
            session_id,
            status: "error",
            error: "invalid image/s",
            text: CHAT_FALL_BACK_MSG,
            statusCode: response.status,
          };
        }
      }

      functionCall = response?.data?.function_call;
      if (!functionCall) break;
      const { name, args } = functionCall;

      if (!functions[name]) throw new Error(`Function ${name} not defined`);
      result = await functions[name](args || {});
      // console.log("result", result);

      const resultPayload = {
        session_id,
        message: JSON.stringify(result),
      };

      response = await axios.post(
        `${genai_base_url}/genai/chat`,
        resultPayload,
        {
          headers,
          signal,
        },
      );

      console.log("response", response);
      if (result && result?.type === "chart")
        return {
          ...result,
          session_id,
          statusCode: response.status,
          text: response?.data.text,
        };
    }

    const text = response?.data?.text;

    return {
      type: "text",
      text: text || CHAT_FALL_BACK_MSG,
      session_id,
      statusCode: response.status,
    };
  } catch (err) {
    let isCancelled = false;
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
    } else if (err.code === "ERR_CANCELED") {
      text = "";
      isCancelled = true;
      console.error(err);
    } else {
      text =
        "Sorry, I'm having trouble processing your request. Please try again.";
    }
    return {
      session_id,
      isCancelled,
      type: "text",
      text,
      statusCode: status,
    };
  }
}
