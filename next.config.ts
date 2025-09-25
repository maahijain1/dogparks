import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily disable image optimization to avoid server errors
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
