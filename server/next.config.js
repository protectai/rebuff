/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["rebuff"],
  reactStrictMode: true,
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.resolve.fallback = {
      // chromadb imports this in a try-catch, but without this next line, Next.js will fail to
      // compile if it can't find the module.
      "@visheratin/web-ai": false
    };
    return config;
  },
};

module.exports = nextConfig;
