import type { Metadata } from 'next';
import { SupabaseAgentRepository } from '../infrastructure/repositories/SupabaseAgentRepository';
import { documentTitleForAgent } from './pageTitle';
import { createClient } from './supabase-server';

/** Absolute tab title for /chat/[id] and /embed/[id]. */
export async function publicAgentMetadata(agentId: string | undefined): Promise<Metadata> {
  const title = await documentTitleForAgent(agentId, async (id) => {
    const repo = new SupabaseAgentRepository(await createClient());
    const agent = await repo.getById(id);
    return agent?.config.name ?? null;
  });
  return { title: { absolute: title } };
}
