import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // Image optimization
  images: {
    domains: [],
  },

  // Performance optimizations
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'aurelius-colosseum',
  }
};

export default nextConfig;
