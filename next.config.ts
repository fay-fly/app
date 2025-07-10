import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ovlcstnavogaxoxh.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
