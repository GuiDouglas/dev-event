import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true, // for dev, only enable this if you have a lot of files  
  },
};

export default nextConfig;
