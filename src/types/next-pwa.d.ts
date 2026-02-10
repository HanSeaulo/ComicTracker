declare module "next-pwa" {
  import type { NextConfig } from "next";

  type NextPwaOptions = {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: unknown;
    workboxOptions?: Record<string, unknown>;
  };

  export default function nextPwa(options: NextPwaOptions): (config: NextConfig) => NextConfig;
}

declare module "next-pwa/cache" {
  const runtimeCaching: unknown;
  export default runtimeCaching;
}
