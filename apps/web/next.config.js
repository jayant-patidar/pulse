/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pulse/types', '@pulse/validators', '@pulse/ui'],
};

module.exports = nextConfig;
