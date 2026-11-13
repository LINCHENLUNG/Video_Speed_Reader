/** @type {import('next').NextConfig} */
const nextConfig = {
  // Course M1 rule: the build must not be gated on type errors (types still show in the editor).
  typescript: { ignoreBuildErrors: true },
  // Old Vite-era routes → new names used from M1 on.
  async redirects() {
    return [
      { source: "/signin", destination: "/sign-in", permanent: true },
      { source: "/signup", destination: "/sign-up", permanent: true },
    ];
  },
};

export default nextConfig;
