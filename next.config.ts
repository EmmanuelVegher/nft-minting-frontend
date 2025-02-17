// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Uncomment and set basePath if your application is not at the root
  //basePath: '/nft-minting-frontend',
  // Uncomment and set assetPrefix if you're serving assets from a CDN or different path
  //assetPrefix: '/nft-minting-frontend/',
  images: {
    //unoptimized: true, // Disable Next.js image optimization if not needed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**',
      },
      // Add other remote patterns as needed
    ],
  },
};

module.exports = nextConfig;
