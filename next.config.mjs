import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Suppress pg-native optional dependency warning
    config.resolve.fallback = { ...config.resolve.fallback, 'pg-native': false };
    return config;
  },
};

export default withNextIntl(nextConfig);
