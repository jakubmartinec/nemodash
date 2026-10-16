import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  env: {
    // Ostrá data z Firestore: na Vercelu (přístup bez klíče přes OIDC) nebo s klíčem
    // v FIREBASE_SERVICE_ACCOUNT. Lokálně běží demo data; NEMODASH_DEMO=1 vynutí demo i na Vercelu.
    NEXT_PUBLIC_LIVE_DATA:
      process.env.NEMODASH_DEMO !== "1" && (process.env.VERCEL === "1" || process.env.FIREBASE_SERVICE_ACCOUNT)
        ? "1"
        : "",
  },
};

export default withNextIntl(nextConfig);
