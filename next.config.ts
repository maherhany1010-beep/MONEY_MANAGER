import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // تجاهل أخطاء ESLint أثناء البناء
    ignoreDuringBuilds: true,
  },
  typescript: {
    // تجاهل أخطاء TypeScript أثناء البناء (مؤقتاً)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
