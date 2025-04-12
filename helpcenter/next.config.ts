import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['proj3helpcenter.s3.ap-southeast-1.amazonaws.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
