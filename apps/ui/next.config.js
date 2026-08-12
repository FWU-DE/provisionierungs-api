import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: (globalThis.process.env.APP_ALLOWED_IMAGE_DOMAINS ?? '').split(',').filter(Boolean),
  },
  eslint: {
    ignoreDuringBuilds: true, // We run this separately
  },
  experimental: {
    // Next 16.2.x misclassifies a streaming initial response as a cache restore
    // in Firefox-based browsers, then its dev debug channel calls
    // location.reload() before hydration. This produces an infinite reload
    // loop on async routes such as /valorant. Fixed upstream for Next 16.3:
    // https://github.com/vercel/next.js/pull/94128
    // Remove this override after upgrading to a stable 16.3+ release.
    reactDebugChannel: false,
  },
};

const withNextIntl = createNextIntlPlugin('./i18n.ts');

export default withNextIntl(nextConfig);
