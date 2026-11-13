import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import { LEGACY_PATHS } from "./src/lib/legacy-paths";

/**
 * Media hosts that next/image may optimise.
 * The Strapi host is read from env so local uploads (http://localhost:1337/uploads/...)
 * and production hosts (https://cms.mint.gov.et) both work. S3 and Cloudinary are
 * included for the upload providers supported by the CMS.
 */
const strapiHosts = [process.env.NEXT_PUBLIC_STRAPI_URL, process.env.STRAPI_URL, "http://localhost:1337"]
  .filter((value): value is string => Boolean(value))
  .map((value) => {
    try {
      return new URL(value);
    } catch {
      return null;
    }
  })
  .filter((value): value is URL => value !== null);

const remotePatterns: RemotePattern[] = [
  ...strapiHosts.map((url) => ({
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    port: url.port || undefined,
    pathname: "/**",
  })),
  { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
  { protocol: "https", hostname: "**.amazonaws.com", pathname: "/**" },
  { protocol: "https", hostname: "**.cloudfront.net", pathname: "/**" },
];

const isPrivateHost = (hostname: string) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.startsWith("10.") ||
  hostname.startsWith("192.168.") ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

const nextConfig: NextConfig = {
  // Classic ISR (fetch revalidate) is used instead of Cache Components.
  cacheComponents: false,
  poweredByHeader: false,
  images: {
    remotePatterns,
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
    // Strapi on localhost / an internal network: allow the optimiser to fetch it.
    // On a public CMS host this stays false.
    dangerouslyAllowLocalIP: strapiHosts.some((url) => isPrivateHost(url.hostname)),
  },
  // Old mint.gov.et paths (kept in imported CMS menus and external links) -> current routes.
  async redirects() {
    return Object.entries(LEGACY_PATHS).flatMap(([from, target]) => {
      const to = target.split("#")[0];
      return [
      { source: `/:locale(en|am)${from}`, destination: `/:locale${to}`, permanent: true },
      { source: from, destination: `/en${to}`, permanent: true },
      ];
    });
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
