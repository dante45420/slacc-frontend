const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
const BASE_URL = `${API_ORIGIN}/api`;

function headers() {
  const h = { "Content-Type": "application/json" };
  const token = localStorage.getItem("access_token");
  if (token) {
    h["Authorization"] = `Bearer ${token}`;
    console.log("Token found:", token.substring(0, 20) + "...");
  } else {
    console.log("No token found");
  }
  return h;
}

export async function apiGet(path) {
  console.log(`GET ${BASE_URL}${path}`);
  const res = await fetch(`${BASE_URL}${path}`, { headers: headers() });
  console.log(`Response status: ${res.status}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API Error: ${errorText}`);
    throw new Error(errorText);
  }
  return res.json();
}

export async function apiPost(path, body) {
  console.log(`POST ${BASE_URL}${path}`, body);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body || {})
  });
  console.log(`Response status: ${res.status}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API Error: ${errorText}`);
    throw new Error(errorText);
  }
  return res.json();
}

export async function apiPostForm(path, formData) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


