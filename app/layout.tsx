import type { Metadata } from 'next';
import { Inter, Courier_Prime, JetBrains_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from '@/components/providers/Providers';
import { MobileWarning } from '@/components/ui/MobileWarning';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-screenplay',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ScriptFlow — Write deeper. See the story.',
  description: 'Professional screenplay writing platform with character arc tracking, Story Grid analytics, and mentor review system.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('scriptflow-theme')?.value ?? 'system';
  const resolvedTheme = themeCookie === 'system' ? 'light' : themeCookie;

  return (
    <html
      lang={locale}
      data-theme={resolvedTheme}
      className={`${inter.variable} ${courierPrime.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=document.cookie.match(/scriptflow-theme=([^;]+)/);var t=s?s[1]:'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light')})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MobileWarning />
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
