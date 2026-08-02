import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.27.183.172"],
  reactStrictMode: true,
  experimental: {
    useTypeScriptCli: true,
  },
};

export default nextConfig;
