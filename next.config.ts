import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure Cesium assets are properly served
  async headers() {
    return [
      {
        source: '/cesium/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  // Copy Cesium assets to public folder during build
  async rewrites() {
    return [
      {
        source: '/cesium/:path*',
        destination: '/cesium/:path*',
      },
    ];
  },
};

export default nextConfig;
