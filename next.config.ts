import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  env: {
    // Ostrá data z Firestore, jakmile má server přístup (klíč servisního účtu).
    // Bez něj aplikace běží nad demo daty — lokálně i v náhledech.
    NEXT_PUBLIC_LIVE_DATA: process.env.FIREBASE_SERVICE_ACCOUNT ? "1" : "",
  },
};

export default withNextIntl(nextConfig);
