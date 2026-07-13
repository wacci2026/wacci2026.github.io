import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const isRootDeployment = existsSync(join(process.cwd(), ".deploy-root"));
const productionBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (isProduction && !isRootDeployment ? "/WACCI-2026" : "");

const nextConfig: NextConfig = {
  output: "export",
  ...(productionBasePath
    ? {
        basePath: productionBasePath,
        assetPrefix: `${productionBasePath}/`,
        env: {
          NEXT_PUBLIC_BASE_PATH: productionBasePath,
        },
      }
    : {}),
  trailingSlash: true,
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
