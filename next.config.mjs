import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
// One three.js for the whole site: the copy skinview3d is built against, so 3D cosmetics
// (lib/ncm.ts) share classes with the skin viewer's scene.
const threeModule = path.join(path.dirname(require.resolve("three", { paths: [path.dirname(require.resolve("skinview3d"))] })), "three.module.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  outputFileTracingRoot: here,
  images: { formats: ["image/webp"], minimumCacheTTL: 31536000 },
  experimental: { optimizePackageImports: ["lucide-react", "motion"] },
  async redirects() {
    return [
      // the cloak wall used to live at /capes; /capes/*.png (classic cape textures) stay put
      { source: "/capes", destination: "/store?c=capes", permanent: true },
      { source: "/capes/:id([a-z0-9-]+)", destination: "/cloaks/:id", permanent: true },
    ];
  },
  webpack(config) {
    config.resolve.alias["@"] = here;
    config.resolve.alias["three$"] = threeModule;
    return config;
  },
};
export default nextConfig;
