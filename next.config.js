/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  eslint: {
    // TypeScript already catches real errors via `pnpm typecheck`.
    // ESLint stylistic rules should not block production builds.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      { source: '/agent', destination: '/zara', permanent: true },
      { source: '/agent/:path*', destination: '/zara/:path*', permanent: true },
      { source: '/search', destination: '/digest', permanent: true },
      { source: '/onboarding', destination: '/inbox', permanent: true },
      { source: '/copilot', destination: '/zara', permanent: true },
    ];
  },
};

export default config;
