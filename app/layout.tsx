import React from 'react';
import type { Metadata } from 'next';

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
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      brand: {
                        50: '#f5f3ff',
                        100: '#ede9fe',
                        200: '#ddd6fe',
                        300: '#c4b5fd',
                        400: '#a78bfa',
                        500: '#8b5cf6',
                        600: '#7c3aed',
                        700: '#6d28d9',
                        800: '#5b21b6',
                        900: '#4c1d95',
                      }
                    },
                    fontFamily: {
                      sans: ['Inter', 'system-ui', 'sans-serif'],
                      mono: ['Fira Code', 'monospace'],
                    },
                    animation: {
                      'fade-in': 'fadeIn 0.5s ease-out',
                      'slide-up': 'slideUp 0.5s ease-out',
                    },
                    keyframes: {
                      fadeIn: {
                        '0%': { opacity: '0' },
                        '100%': { opacity: '1' },
                      },
                      slideUp: {
                        '0%': { transform: 'translateY(20px)', opacity: '0' },
                        '100%': { transform: 'translateY(0)', opacity: '1' },
                      }
                    }
                  }
                }
              }
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                font-family: 'Inter', sans-serif;
                background-color: #fafafa;
                color: #171717;
              }
              /* Custom scrollbar for chat */
              .scrollbar-hide::-webkit-scrollbar {
                  display: none;
              }
              .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

