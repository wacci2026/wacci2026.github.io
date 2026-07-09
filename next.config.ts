import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProduction ? "/WACCI-2026" : "",
  assetPrefix: isProduction ? "/WACCI-2026/" : "",
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: isProduction ? "/WACCI-2026" : "",
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
      },
      {
        hostname: "lh3.googleusercontent.com",
      },
      {
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
