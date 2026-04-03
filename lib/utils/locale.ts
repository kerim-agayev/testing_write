import { cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from '@/i18n';

export async function getLocaleFromRequest(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('scriptflow-locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }
  return defaultLocale;
}
