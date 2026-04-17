import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow HMR WebSocket connections when accessing dev server from Tailscale
  // or any hostname other than localhost. Without this, Next.js 16 blocks the
  // connection and React cannot hydrate — the page renders but is non-interactive.
  allowedDevOrigins: [
    "kepler",
    "kepler.tail*",
    "100.112.13.98",
    "*.ts.net",
  ],
};

export default nextConfig;
