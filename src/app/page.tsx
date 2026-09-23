'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { Button } from '../components/core/button/Button';
import { Heading } from '../components/core/typography/Heading';

export default function Page() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/admin');
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
        <Heading level={1}>TinyGPT</Heading>
        <p className="text-slate-500">
          Sign in to create an agent from your site or files, save it, and share a chat link.
        </p>
        <Button
          className="w-full justify-center py-6"
          onClick={() => router.push('/login')}
        >
          Sign in to create an agent
        </Button>
      </div>
    </div>
  );
}
