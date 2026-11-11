import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";

export default createMiddleware(routing);

export const config = {
  // Zachytí všechny cesty kromě API, interních Next.js cest a statických souborů
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
