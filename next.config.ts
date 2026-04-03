import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 の自動生成型ファイルのバグを回避
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
