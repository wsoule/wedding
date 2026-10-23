import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Phone photos are several MB; the default limit for both is 1 MB / 10 MB.
    serverActions: { bodySizeLimit: "16mb" },
    proxyClientMaxBodySize: "16mb",
  },
};

export default nextConfig;
