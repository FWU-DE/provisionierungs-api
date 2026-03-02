import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // @todo: Remove after UI development.
    domains: ['picsum.photos'],
  },
  eslint: {
    ignoreDuringBuilds: true, // We run this separately
  },
};

export default withNextIntl(nextConfig);
