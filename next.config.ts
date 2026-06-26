import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["silent-bullfrog-663.convex.cloud", "img.clerk.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        port: "",
        pathname: "/api/storage/**",
      },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
