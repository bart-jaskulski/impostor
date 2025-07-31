import type React from 'react';
import type { Viewport } from 'next/types';
import '@/app/globals.css';

type Props = {
  children: React.ReactNode;
  locale: string;
};

export const viewport: Viewport = {
  themeColor: '#ba274a',
  width: 'device-width',
  initialScale: 1,
};

export default function Document({ children, locale }: Props) {
  return (
    <html className="font-sana" lang={locale}>
      <body>{children}</body>
    </html>
  );
}
