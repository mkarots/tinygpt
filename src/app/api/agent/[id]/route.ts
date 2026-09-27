import { NextResponse } from 'next/server';
import { IAgentRepository } from '../../../../domain/interfaces/IAgentRepository';
import { SupabaseAgentRepository } from '../../../../infrastructure/repositories/SupabaseAgentRepository';
import { createClient as createServerSupabase } from '../../../../lib/supabase-server';

export type GetAgentDeps = {
  repository: IAgentRepository;
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

    const repo = deps?.repository ?? new SupabaseAgentRepository(await createServerSupabase());
    const agent = await repo.getById(agentId);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    return NextResponse.json(agent);

  } catch (error) {
    console.error('Failed to retrieve agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
