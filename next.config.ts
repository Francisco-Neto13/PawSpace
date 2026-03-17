import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl) {
  const parsed = new URL(supabaseUrl);
  remotePatterns.push({
    protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
    hostname: parsed.hostname,
    port: parsed.port,
    pathname: '/storage/v1/object/public/**',
  });
}

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75],
    remotePatterns,
  },
};

export default nextConfig;
