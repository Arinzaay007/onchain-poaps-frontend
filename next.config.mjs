/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type-checking and linting run in CI / locally (`npx tsc --noEmit`, `next lint`);
  // skipping them inside `next build` keeps memory usage low on small machines.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    cpus: 1,
    workerThreads: false,
    webpackBuildWorker: false,
  },
  webpack: (config) => {
    // Optional x402 payment deps of @coinbase/cdp-sdk (pulled in transitively
    // via wagmi's baseAccount connector) are not needed by this app.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@x402/core/client": false,
      "@x402/core/schemes": false,
      "@x402/core": false,
      "@x402/svm/exact/client": false,
      "@x402/svm": false,
      "@x402/evm/exact/client": false,
      "@x402/evm": false,
    };
    return config;
  },
};

export default nextConfig;
