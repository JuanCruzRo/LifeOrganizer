import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Clerk needs its own origins allowed for the sign-in widgets and for the
// Botcha widget it may load. Adding a CSP is only safe if the auth pages still
// render, so these values are verified against the real app, not guessed.
const csp = [
  "default-src 'self'",
  // Next.js injects inline bootstrap scripts; Turbopack also needs eval in dev.
  // blob: is required because Clerk and Next both spin up workers from blob URLs.
  `script-src 'self' 'unsafe-inline' blob:${isDev ? " 'unsafe-eval'" : ""} https://*.clerk.accounts.dev https://clerk.com`,
  `worker-src 'self' blob:`,
  `style-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // The AI features call Groq/Tavily and Mercado Pago from the server only, so
  // the browser never needs them; Clerk does.
  "connect-src 'self' https://*.clerk.accounts.dev wss://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
  "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://*.clerk.accounts.dev https://www.mercadopago.com.ar https://www.mercadopago.com",
  "object-src 'none'"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }])
];

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Service worker and the PWA manifest must never be cached by the CDN.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] }
    ];
  }
};

export default nextConfig;
