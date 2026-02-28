/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify removed — default in Next.js 14+
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'api.clerk.com' },
    ],
  },
  // TypeScript and ESLint are checked separately in CI via tsc --noEmit and eslint
  // Keeping build fast by not double-checking during next build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
