import React from 'react';
import type { Metadata } from 'next';
import { Figtree, Fraunces } from 'next/font/google';
import { AuthProvider } from '../components/AuthProvider';
import { documentTitle } from '../lib/pageTitle';
import './globals.css';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-landing-sans' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-landing-serif' });

export const metadata: Metadata = {
  title: { absolute: documentTitle() },
  description: 'TinyGPT',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${figtree.variable} ${fraunces.variable}`}>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

