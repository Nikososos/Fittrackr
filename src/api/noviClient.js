// Auto include project ID within the header with each request

const BASE_URL = import.meta.env.VITE_NOVI_BASE_URL;
const PROJECT_ID = import.meta.env.VITE_NOVI_PROJECT_ID;

console.log("PROJECT_ID:", import.meta.env.VITE_NOVI_PROJECT_ID);
console.log("BASE_URL:", import.meta.env.VITE_NOVI_BASE_URL);


function buildHeaders(token, extraHeaders) {
    return {
        "Content-Type": "application/json",
        "novi-education-project-id": PROJECT_ID,
        ...(token ?  {Authorization: `Bearer ${token}` } : {}),
        ...(extraHeaders || {}),
    };
}

export async function noviFetch(path, { method = "GET", body, token, headers } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token, headers),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return null;
}