'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PRODUCT_BUILDER_PATH } from '../lib/routes';
import { createClient } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/supabase-config';
import { signedInSection } from '../lib/signedInSection';
import { signOutToLanding } from '../lib/signOutToLanding';

export function SignedInShell() {
  const pathname = usePathname() ?? '/admin';
  const router = useRouter();
  const section = signedInSection(pathname);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    document.title = section.title;
  }, [section.title]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOutToLanding({
        signOut: async () => {
          if (!isSupabaseConfigured()) return;
          await createClient().auth.signOut();
        },
        goToLanding: () => {
          router.replace('/');
          router.refresh();
        },
      });
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href={PRODUCT_BUILDER_PATH}
            className="flex items-center gap-2 text-brand-600 font-bold text-lg shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-mono text-sm">
              T
            </span>
            TinyGPT
          </Link>
          <span className="text-slate-300" aria-hidden="true">
            /
          </span>
          <p className="text-sm font-medium text-slate-700 truncate">{section.label}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {section.showBackToAgents ? (
            <Link href={PRODUCT_BUILDER_PATH} className="text-sm font-medium text-brand-600">
              Your agents
            </Link>
          ) : null}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-60"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
