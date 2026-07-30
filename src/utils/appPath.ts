// import.meta.env.BASE_URL reflects Vite's `base` config (e.g. "/pospro-frontend/"
// on GitHub Pages, "/" everywhere else). Anything that navigates via window.open
// or a raw <a href> bypasses React Router entirely, so it needs this prefix
// applied by hand — Router-based navigation (Link, useNavigate) gets it for
// free once BrowserRouter is given the same basename.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function appPath(path: string): string {
  return `${BASE}${path}`;
}
