import Link from 'next/link';
import { OwnedAgentSummary } from '../../../domain/interfaces/IAgentRepository';
import { agentListSubtitle } from '../../../lib/agentList';
import { PRODUCT_CREATE_PATH, adminEditPath, adminSharePath } from '../../../lib/routes';
import { Heading } from '../../core/typography/Heading';

export function AgentDashboard({ agents }: { agents: OwnedAgentSummary[] }) {
  return (
    <div className="min-h-full bg-paper px-6 py-12 text-ink">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Heading level={1}>Your agents</Heading>
            <p className="text-stone mt-2 text-sm">Open a chat, copy the embed snippet, or start another agent.</p>
          </div>
          <Link
            href={PRODUCT_CREATE_PATH}
            className="shrink-0 rounded-[10px] bg-terracotta px-4 py-2 text-sm font-medium text-cream"
          >
            Create an agent
          </Link>
        </div>

        {agents.length === 0 ? (
          <div className="bg-cream rounded-xl border border-rule p-8 text-center space-y-3">
            <p className="text-ink font-medium">No agents yet</p>
            <p className="text-stone text-sm">Create one from your site or files, then come back here to find it.</p>
            <Link href={PRODUCT_CREATE_PATH} className="inline-block text-sm font-medium text-terracotta">
              Create your first agent
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {agents.map((agent) => {
              const subtitle = agentListSubtitle(agent, agents);
              return (
              <li key={agent.id} className="bg-cream rounded-xl border border-rule p-5">
                <p className="font-medium text-ink">{agent.name}</p>
                {subtitle ? <p className="text-sm text-stone mt-1">{subtitle}</p> : null}
                {agent.description ? <p className="text-sm text-stone mt-1">{agent.description}</p> : null}
                <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium">
                  <Link href={`/chat/${agent.id}`} className="text-terracotta">Chat</Link>
                  <Link href={adminSharePath(agent.id)} className="text-terracotta">Embed snippet</Link>
                  <Link href={adminEditPath(agent.id)} className="text-terracotta">Edit</Link>
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
