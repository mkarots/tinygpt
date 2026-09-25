import type { Metadata } from 'next';
import { SignedInShell } from '../../components/SignedInShell';

export const metadata: Metadata = {
  title: {
    default: 'Internal',
    template: '%s · TinyGPT',
  },
};

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <SignedInShell />
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
