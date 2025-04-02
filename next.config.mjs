/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.json'];
    return config;
  }
};

export default nextConfig;
