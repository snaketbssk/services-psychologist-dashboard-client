import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  // Add image remote patterns here when needed:
  // images: {
  //   remotePatterns: [{ protocol: "https", hostname: "example.com" }],
  // },
};

export default withNextIntl(nextConfig);
