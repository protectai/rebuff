/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["rebuff"],
  reactStrictMode: true,
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
};

module.exports = nextConfig;
