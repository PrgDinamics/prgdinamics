/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "intranet.lcsofttestings.xyz"
          }
        ],
        destination: "/dynedu/:path*"
      }
    ];
  }
};

module.exports = nextConfig;
