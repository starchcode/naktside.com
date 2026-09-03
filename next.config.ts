import { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const images: NextConfig["images"] = {
  remotePatterns: [{ protocol: "https", hostname: "img.youtube.com" }],
};

const nextConfig = (phase: string): NextConfig => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      env: {
        environment: "DEVELOPMENT",
        db_collection: "local_naktside",
      },
      images,
    };
  }

  return {
    env: {
      environment: "PRODUCTION",
      db_collection: "prod_naktside",
    },
    images,
  };
};

export default nextConfig;
