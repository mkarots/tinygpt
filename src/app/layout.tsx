import React from 'react';
import type { Metadata } from 'next';
import { AuthProvider } from '../components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'tinygpt',
  description: 'TinyGPT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

