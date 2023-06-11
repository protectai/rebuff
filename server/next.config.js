/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@rebuff/sdk"],
  reactStrictMode: true,
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
};

module.exports = nextConfig;
