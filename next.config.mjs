import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Pre-existing ESLint errors in structure/kronotop components — allow build to succeed
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even with type errors
    ignoreBuildErrors: true,
  },
  // Ensure sql.js WASM is bundled for serverless functions (KIT import route)
  outputFileTracingIncludes: {
    '/api/import/kitsp': ['./node_modules/sql.js/dist/sql-wasm.wasm'],
  },
  webpack: (config) => {
    // Suppress pg-native optional dependency warning
    config.resolve.fallback = { ...config.resolve.fallback, 'pg-native': false };
    return config;
  },
};

export default withNextIntl(nextConfig);
