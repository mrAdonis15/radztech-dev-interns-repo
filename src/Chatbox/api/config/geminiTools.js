
export const tools = [
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
    name: "getCurrentYearRange",
    description:
      "Use this to get the date range for reports that requires yearly range. Only use this if the user didn't specify the date range.  ",
    parameters: {
      type: "object",
    },
  },
];
