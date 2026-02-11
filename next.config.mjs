import nextPwa from "next-pwa";
import runtimeCaching from "next-pwa/cache.js";

/** @type {import("next").NextConfig} */
const nextConfig = {
  /* config options here */
};

const withPWA = nextPwa({
  dest: "public",
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: ({ request }) =>
        request.mode === "navigate" || request.destination === "document",
      handler: "NetworkOnly",
    },
    ...runtimeCaching,
  ],
});

export default withPWA(nextConfig);
