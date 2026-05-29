/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/chat': ['./data/**/*', './networks/**/*', '../rag/data/**/*'],
    },
  },
}
export default nextConfig
