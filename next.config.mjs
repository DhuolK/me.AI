/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable webpack persistent cache during development on Windows to prevent lock collisions
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "sonner"],
  },
  async headers() {
    return [
      {
        source: "/api/packs/:slug",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=300",
          },
        ],
      },
      {
        source: "/api/reviews/:receiptId",
        headers: [
          {
            key: "Cache-Control",
            value: "private, max-age=300, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
