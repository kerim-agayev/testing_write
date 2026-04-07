import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['az', 'en', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'az';

export default getRequestConfig(async ({ requestLocale }) => {
  // Try URL-based locale first (if routing middleware sets it)
  let locale = await requestLocale;

  // Fall back to cookie-based locale (used when there's no URL prefix routing)
  if (!locale || !locales.includes(locale as Locale)) {
    try {
      const cookieStore = await cookies();
      const cookieLocale = cookieStore.get('scriptflow-locale')?.value;
      locale = (cookieLocale && locales.includes(cookieLocale as Locale))
        ? cookieLocale
        : defaultLocale;
    } catch {
      // cookies() not available during static generation — use default
      locale = defaultLocale;
    }
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
