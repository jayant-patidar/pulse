/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pulse/types', '@pulse/validators', '@pulse/ui'],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
