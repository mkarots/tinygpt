import Link from 'next/link';
import { OwnedAgentSummary } from '../../../domain/interfaces/IAgentRepository';
import { PRODUCT_CREATE_PATH, adminSharePath } from '../../../lib/routes';
import { Heading } from '../../core/typography/Heading';

export function AgentDashboard({ agents }: { agents: OwnedAgentSummary[] }) {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Heading level={1}>Your agents</Heading>
            <p className="text-slate-500 mt-2">Open a chat, copy the embed snippet, or start another agent.</p>
          </div>
          <Link
            href={PRODUCT_CREATE_PATH}
            className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
          >
            Create an agent
          </Link>
        </div>

        {agents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
            <p className="text-slate-900 font-medium">No agents yet</p>
            <p className="text-slate-500 text-sm">Create one from your site or files, then come back here to find it.</p>
            <Link href={PRODUCT_CREATE_PATH} className="inline-block text-sm font-medium text-brand-600">
              Create your first agent
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {agents.map((agent) => (
              <li key={agent.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="font-medium text-slate-900">{agent.name}</p>
                {agent.description ? <p className="text-sm text-slate-500 mt-1">{agent.description}</p> : null}
                <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium">
                  <Link href={`/chat/${agent.id}`} className="text-brand-600">Chat</Link>
                  <Link href={adminSharePath(agent.id)} className="text-brand-600">Embed snippet</Link>
                  <Link href={PRODUCT_CREATE_PATH} className="text-brand-600">Recreate</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
