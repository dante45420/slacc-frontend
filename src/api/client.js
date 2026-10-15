// Single source of truth for the backend location.
// VITE_API_ORIGIN = "https://api.example.com" (preferred) or legacy
// VITE_API_BASE_URL = "https://api.example.com/api".
const LEGACY_BASE = import.meta.env.VITE_API_BASE_URL;

export const API_ORIGIN = (
  import.meta.env.VITE_API_ORIGIN ||
  (LEGACY_BASE ? LEGACY_BASE.replace(/\/api\/?$/, "") : "") ||
  "http://localhost:5000"
).replace(/\/+$/, "");

export const API_BASE_URL = `${API_ORIGIN}/api`;
const BASE_URL = API_BASE_URL;

/** Absolute URL for a backend-served file (e.g. "/uploads/x.jpg"). */
export function assetUrl(path) {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function getToken() {
  return localStorage.getItem("access_token");
}

/** Authorization header only (use with FormData bodies). */
export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}


async function parseError(res) {
  const text = await res.text();
  let message = "";
  let data = null;
  try {
    data = JSON.parse(text);
    message = data.error || data.message || data.msg || "";
  } catch {
    // Not JSON. Never surface HTML error pages (e.g. a proxy or Flask 500) to users.
    message = /^\s*</.test(text) ? "" : text.trim().slice(0, 300);
  }
  // Empty message when the server gave no usable text, so callers fall back to
  // their own translated copy.
  const error = new Error(message);
  error.status = res.status;
  if (data && typeof data === "object") {
    if (data.code) error.code = data.code;
    if (data.fields) error.fields = data.fields;
  }
  return error;
}

async function request(method, path, body, { form = false } = {}) {
  const hasJsonBody = !form && body !== undefined;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: hasJsonBody
      ? { "Content-Type": "application/json", ...authHeaders() }
      : authHeaders(),
    body: form ? body : hasJsonBody ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const error = await parseError(res);
    // 401/404 are expected outcomes that callers handle (login state, not-found pages).
    if (![401, 404].includes(res.status)) {
      console.error(`API ${method} ${path} failed (${res.status}):`, error.message || res.statusText);
    }
    throw error;
  }
  if (res.status === 204) return null;
  const type = res.headers.get("content-type") || "";
  return type.includes("application/json") ? res.json() : res.text();
}

export function apiGet(path) {
  return request("GET", path);
}

export function apiPost(path, body) {
  return request("POST", path, body || {});
}

export function apiPut(path, body) {
  return request("PUT", path, body || {});
}

export function apiDelete(path) {
  return request("DELETE", path);
}

export function apiPostForm(path, formData) {
  return request("POST", path, formData, { form: true });
}

export function apiPutForm(path, formData) {
  return request("PUT", path, formData, { form: true });
}
