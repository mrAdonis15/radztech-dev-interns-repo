// Use relative URLs so in dev the request goes to same origin (localhost) and
// Create React App proxy (see package.json "proxy": "https://clone.ulap.biz/") forwards to the API.
// That avoids CORS. In production, if the app is on another domain, set REACT_APP_API_BASE.
const base = process.env.REACT_APP_API_BASE || "";
const endPoints = {
  execute: `${base}/api/reports/agr-simulator/execute`,
  save: `${base}/api/setup/sub/1705616`,
};

export default endPoints;