import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  outputFileTracingRoot: here,
  images: { formats: ["image/webp"], minimumCacheTTL: 31536000 },
  experimental: { optimizePackageImports: ["lucide-react", "motion"] },
  webpack(config) {
    config.resolve.alias["@"] = here;
    return config;
  },
};
export default nextConfig;
