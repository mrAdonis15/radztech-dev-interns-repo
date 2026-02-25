

const API_BASE = process.env.REACT_APP_API_BASE || "";

export const API_URLS = {
  login: `${API_BASE}/api/login`,
  logout: `${API_BASE}/api/logout`,
  selectBiz: `${API_BASE}/api/select-biz`,
  setBiz: `${API_BASE}/api/set-biz`,
  businesses: `${API_BASE}/api/businesses`,
};


export function request(url, options = {}) {
  const { method = "GET", headers = {}, body } = options;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
    xhr.onload = () => {
      resolve({ status: xhr.status, text: xhr.responseText });
    };
    xhr.onerror = () => reject(new Error("XHR failed"));
    xhr.send(body != null ? body : null);
  });
}

export default request;
