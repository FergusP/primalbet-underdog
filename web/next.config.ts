import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // Image optimization
  images: {
    domains: [],
  },

  // Performance optimizations
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'betbeast-arena',
  }
};

export default nextConfig;
