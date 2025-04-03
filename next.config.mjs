/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.extensions.push('.ts', '.tsx', '.js', '.json');
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all HTTPS image sources
      },
    ],
    domains: ["*"], // Alternative approach to allow all domains (optional)
    unoptimized: true, // Allows images from any source without optimization
  },
};

export default nextConfig;
