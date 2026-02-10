import nextPwa from "next-pwa";
import runtimeCaching from "next-pwa/cache.js";

/** @type {import("next").NextConfig} */
const nextConfig = {
  /* config options here */
};

const withPWA = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching,
  navigateFallback: "/offline",
  navigateFallbackDenylist: [/^\/api\//],
});

export default withPWA(nextConfig);
