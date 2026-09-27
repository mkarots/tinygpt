import { NextResponse } from 'next/server';
import { IAgentRepository } from '../../../../domain/interfaces/IAgentRepository';
import { SupabaseAgentRepository } from '../../../../infrastructure/repositories/SupabaseAgentRepository';
import { createClient as createServerSupabase } from '../../../../lib/supabase-server';

export type GetAgentDeps = {
  repository: IAgentRepository;
  /** Signed-in user, when the caller already knows them. Omitted for a visitor. */
  viewerId?: string | null;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
  deps?: GetAgentDeps,
) {
  try {
    const { id: agentId } = await params;
    
    if (!agentId) {
       return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    let repo: IAgentRepository;
    let viewerId: string | null;
    if (deps) {
      repo = deps.repository;
      viewerId = deps.viewerId ?? null;
    } else {
      const supabase = await createServerSupabase();
      repo = new SupabaseAgentRepository(supabase);
      viewerId = (await supabase.auth.getUser()).data.user?.id ?? null;
    }
    const agent = await repo.getById(agentId);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const owned = viewerId ? await repo.listByUser(viewerId) : [];
    const viewerOwnsAgent = owned.some((row) => row.id === agent.id);

    return NextResponse.json({ ...agent, viewerOwnsAgent });

  } catch (error) {
    console.error('Failed to retrieve agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
