const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

// VITE_API_BASE_URL looks like "http://localhost:4000/api" — strip the "/api"
// suffix to get the plain origin that uploaded files (e.g. "/uploads/x.jpg")
// are served from. In dev the frontend (Vite, :5173) and backend (:4000) are
// on different origins, so a bare relative path would resolve against the
// wrong one; in production both are served from the same origin, where this
// is a harmless no-op prefix.
export const API_ORIGIN = apiBase.replace(/\/api\/?$/, "");

export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${API_ORIGIN}${url}`;
}
