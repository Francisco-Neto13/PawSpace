import type { MetadataRoute } from 'next';

const siteUrl = 'https://pawspace-alpha.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/landing',
          '/login',
          '/reset-password',
          '/auth/callback',
          '/overview',
          '/tree',
          '/library',
          '/journal',
          '/achievements',
          '/settings',
          '/api/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
