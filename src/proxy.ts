import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";

export default createMiddleware(routing);

export const config = {
  // Zachytí všechny cesty kromě interních Next.js cest a statických souborů
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
