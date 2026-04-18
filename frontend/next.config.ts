import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "5080", pathname: "/images/**" },
    ],
  },
};

export default nextConfig;
