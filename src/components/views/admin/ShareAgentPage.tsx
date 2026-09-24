'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, CheckCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { agentShareLinks } from '../../../lib/agentShare';
import { Heading } from '../../core/typography/Heading';
import { Button } from '../../core/button/Button';

function subscribeToOrigin(onStoreChange: () => void) {
  window.addEventListener('focus', onStoreChange);
  return () => window.removeEventListener('focus', onStoreChange);
}

function readOrigin() {
  return window.location.origin;
}

export default function ShareAgentPage() {
  const params = useParams();
  const agentId = typeof params.id === 'string' ? params.id : '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('Your agent');
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);
  const origin = useSyncExternalStore(subscribeToOrigin, readOrigin, () => '');

  useEffect(() => {
    if (!agentId) return;

    let cancelled = false;
    fetch(`/api/agent/${encodeURIComponent(agentId)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(typeof data.error === 'string' ? data.error : 'Agent not found');
        }
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        const agentName = data?.config?.name;
        setName(typeof agentName === 'string' && agentName ? agentName : 'Your agent');
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Agent not found');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [agentId]);

  const copy = async (value: string, which: 'link' | 'code') => {
    await navigator.clipboard.writeText(value);
    setCopied(which);
    window.setTimeout(() => setCopied(null), 2000);
  };

  if (!agentId || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (error || !agentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
          <Heading level={1}>Agent unavailable</Heading>
          <p className="text-slate-500 mt-2">{error || 'This share link is not valid.'}</p>
          <Link href="/admin" className="inline-block mt-6 text-sm font-medium text-brand-600">
            Back to your agents
          </Link>
        </div>
      </div>
    );
  }

  const links = origin ? agentShareLinks(origin, agentId) : null;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Heading level={1}>{name} is saved</Heading>
          <p className="text-slate-500 mt-2">
            Share the public chat link, or embed the widget on your site.
          </p>
        </div>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 text-lg">Shareable link</h2>
          <p className="text-sm text-slate-500">
            Anyone with this link can chat with the agent. They do not need an account.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono text-slate-700 truncate">
              {links?.shareUrl ?? 'Preparing link…'}
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={!links}
              onClick={() => links && copy(links.shareUrl, 'link')}
            >
              {copied === 'link' ? 'Copied' : 'Copy'}
            </Button>
            {links && (
              <a
                href={links.shareUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <ExternalLink className="w-4 h-4" /> Open
              </a>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 text-lg">Website embed</h2>
            <p className="text-sm text-slate-500 mt-1">
              Paste this snippet before the closing body tag. It loads the same saved agent.
            </p>
          </div>
          <div className="p-6 bg-slate-900 relative">
            <code className="text-sm font-mono text-green-400 block break-all leading-relaxed">
              {links?.snippet ?? 'Preparing snippet…'}
            </code>
            <button
              type="button"
              disabled={!links}
              className={`absolute top-4 right-4 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 ${
                copied === 'code' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              onClick={() => links && copy(links.snippet, 'code')}
            >
              {copied === 'code' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied === 'code' ? 'Copied' : 'Copy code'}
            </button>
          </div>
          {links && (
            <div className="px-6 py-4 border-t border-slate-100">
              <a
                href={links.embedUrl}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Open embed preview
              </a>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
