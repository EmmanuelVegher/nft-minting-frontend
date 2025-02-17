import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**', // Allow all pathnames under this hostname
      },
      // Add more hostnames here if you use images from other external sources
    ],
  },
};

export default nextConfig;
