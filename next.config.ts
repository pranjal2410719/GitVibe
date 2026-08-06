import type { NextConfig } from "next";

// Security headers applied to every response.
// CSP note: "connect-src https://avatars.githubusercontent.com" is required for
// the identity-card PNG export, which inlines the avatar image via fetch.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://avatars.githubusercontent.com https://github.com",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss: https://avatars.githubusercontent.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Allow opening the dev server via the machine's LAN IP (e.g. from another
  // device on the same network) without Next.js blocking dev resources.
  allowedDevOrigins: ["172.16.13.199"],
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
