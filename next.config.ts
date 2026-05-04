import type { NextConfig } from "next";

const devOrigin = process.env.DEV_TUNNEL_ORIGIN;

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 80, 95, 100],
  },
  ...(devOrigin && { allowedDevOrigins: [devOrigin] }),
  ...(devOrigin && {
    experimental: {
      serverActions: { allowedOrigins: [devOrigin] },
    },
  }),
};

export default nextConfig;
