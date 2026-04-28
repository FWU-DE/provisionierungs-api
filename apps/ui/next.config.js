import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: (globalThis.process.env.APP_ALLOWED_IMAGE_DOMAINS ?? '').split(',').filter(Boolean),
  },
  eslint: {
    ignoreDuringBuilds: true, // We run this separately
  },
};

const withNextIntl = createNextIntlPlugin('./i18n.ts');

export default withNextIntl(nextConfig);
