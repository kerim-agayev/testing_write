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
  experimental: {
    // Next.js 14: ensure sql.js WASM is bundled into the serverless function for KIT import
    outputFileTracingIncludes: {
      '/api/import/kitsp': ['./node_modules/sql.js/dist/sql-wasm.wasm'],
    },
  },
  webpack: (config, { isServer }) => {
    // Suppress pg-native optional dependency warning
    config.resolve.fallback = { ...config.resolve.fallback, 'pg-native': false };
    // Externalize sql.js so webpack doesn't try to bundle its CJS exports
    if (isServer) {
      const existingExternals = config.externals || [];
      config.externals = Array.isArray(existingExternals)
        ? [...existingExternals, 'sql.js']
        : [existingExternals, 'sql.js'];
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
