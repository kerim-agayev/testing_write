'use client';

import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';

export function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);
  const [locale, setLocale] = useState<'az' | 'en' | 'ru'>('az');

  useEffect(() => {
    if (window.innerWidth < 768) setIsMobile(true);

    // Read locale from cookie
    const match = document.cookie.match(/scriptflow-locale=([^;]+)/);
    const cookieLocale = match?.[1];
    if (cookieLocale === 'en' || cookieLocale === 'ru') setLocale(cookieLocale);
  }, []);

  if (!isMobile) return null;

  const messages = {
    az: {
      title: 'ScriptFlow kompüter üçündür',
      body: 'Bu platforma telefon və ya planşetdən istifadəni dəstəkləmir. Zəhmət olmasa kompüterdən daxil olun.',
    },
    en: {
      title: 'ScriptFlow is for desktop',
      body: 'This platform does not support mobile or tablet access. Please use a desktop or laptop computer.',
    },
    ru: {
      title: 'ScriptFlow предназначен для компьютера',
      body: 'Эта платформа не поддерживает мобильные устройства. Пожалуйста, используйте компьютер или ноутбук.',
    },
  };

  const msg = messages[locale];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8F7F4] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#2D2B6B]/10 flex items-center justify-center mb-6">
        <Monitor className="w-8 h-8 text-[#2D2B6B]" />
      </div>
      <h1 className="text-xl font-semibold text-[#1A1A1A] mb-3">{msg.title}</h1>
      <p className="text-sm text-[#6B6960] max-w-xs leading-relaxed">{msg.body}</p>
    </div>
  );
}
