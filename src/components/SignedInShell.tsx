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
    <header className="shrink-0 border-b border-rule bg-cream">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href={PRODUCT_BUILDER_PATH}
            className="font-serif text-xl font-semibold text-ink shrink-0 tracking-tight"
          >
            TinyGPT
          </Link>
          <span className="text-rule" aria-hidden="true">
            /
          </span>
          <p className="text-sm font-medium text-stone truncate">{section.label}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {section.showBackToAgents ? (
            <Link href={PRODUCT_BUILDER_PATH} className="text-sm font-medium text-terracotta">
              Your agents
            </Link>
          ) : null}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-sm font-medium text-stone hover:text-ink disabled:opacity-60"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
