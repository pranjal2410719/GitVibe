import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow opening the dev server via the machine's LAN IP (e.g. from another
  // device on the same network) without Next.js blocking dev resources.
  allowedDevOrigins: ["172.16.13.199"],
};

export default nextConfig;
