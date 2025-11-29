import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Ignorar arquivos específicos
  typescript: {
    ignoreBuildErrors: false
  }
};

export default nextConfig;
