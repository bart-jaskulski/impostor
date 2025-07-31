import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next/types';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#ba274a',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Fremo - One memory, many perspectives',
    description: 'Share photos at events with friends and family',
    manifest: '/manifest.json',
    robots: {
      index: false,
      follow: true,
    },
  };
}

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return children;
}
