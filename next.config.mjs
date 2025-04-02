/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.json'];
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // ✅ Allow images from any domain
      },
    ],
  },
};

export default nextConfig;
