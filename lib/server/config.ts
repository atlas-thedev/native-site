/** Server-only configuration. Never import from client components. */
export const REPO = process.env.NATIVE_REPO ?? "atlas-thedev/native-client";
// The backend never moves off api.nativelaunch.xyz — only the website/email domains change.
export const API_URL = (process.env.NATIVE_API_URL ?? "https://api.nativelaunch.xyz").replace(/\/$/, "");
export const SITE_KEY = process.env.NATIVE_SITE_KEY ?? process.env.NOCTRA_SITE_KEY ?? "";

export const ghHeaders = (): HeadersInit => ({
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "native-site",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});
