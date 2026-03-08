import { getRequestConfig } from "next-intl/server";
import { routing } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Ověř, že locale je platné
  if (!locale || !routing.locales.includes(locale as "cs" | "en")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
