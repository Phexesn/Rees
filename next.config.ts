import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Prompt files and compliance rules are read from disk at runtime; make sure
  // they ship with every serverless function.
  outputFileTracingIncludes: {
    "/**": ["./prompts/**/*", "./compliance/*.yaml"],
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default withNextIntl(nextConfig);
