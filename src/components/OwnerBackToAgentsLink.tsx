'use client';

import Link from 'next/link';
import { PRODUCT_BUILDER_PATH } from '../lib/routes';
import { useAuth } from './AuthProvider';

/**
 * Way back to the agent list for a signed-in owner on the public widget.
 * Visitors (no session) see nothing. Account chrome stays on the owner shell.
 */
export function OwnerBackToAgentsLink() {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return null;

  return (
    <div className="shrink-0 border-b border-rule bg-cream px-4 py-2">
      <Link href={PRODUCT_BUILDER_PATH} className="text-sm font-medium text-terracotta">
        Your agents
      </Link>
    </div>
  );
}
