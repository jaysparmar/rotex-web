import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['rotex.ezzystack.com'],
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "cdn.rotex.com" },
      { protocol: "https", hostname: "rotex.ezzystack.com" },
      ...(process.env.AWS_S3_BUCKET
        ? [
            {
              protocol: "https" as const,
              hostname: `${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION ?? "us-east-1"}.amazonaws.com`,
            },
          ]
        : []),
    ],
  },
  
  experimental: {
    // Admin media uploads (video especially) exceed the 1MB Server Action default.
    serverActions: { bodySizeLimit: "200mb" },
  },
  async rewrites() {
    return {
      beforeFiles: [],
      // afterFiles runs only when nothing in public/ matched, so files that were
      // present at build time keep their fast static path and newly uploaded
      // ones fall through to the API route that reads from disk.
      afterFiles: [{ source: "/uploads/:path*", destination: "/api/uploads/:path*" }],
      fallback: [],
    };
  },
};

export default nextConfig;
