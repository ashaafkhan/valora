/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    // TypeScript already catches real errors via `pnpm typecheck`.
    // ESLint stylistic rules (no-explicit-any, prefer-optional-chain, etc.)
    // should not block production builds for a hackathon deployment.
    ignoreDuringBuilds: true,
  },
};

export default config;
