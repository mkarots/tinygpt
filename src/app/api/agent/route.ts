import { NextResponse } from 'next/server';
import { CreateAgentUseCase, isUuid } from '../../../application/use-cases/CreateAgentUseCase';
import { IAgentRepository } from '../../../domain/interfaces/IAgentRepository';
import { SupabaseAgentRepository } from '../../../infrastructure/repositories/SupabaseAgentRepository';
import { createClient as createServerSupabase } from '../../../lib/supabase-server';

export type CreateAgentDeps = {
  getUser: () => Promise<{ id: string } | null>;
  repository: IAgentRepository;
};

export async function handleCreateAgent(request: Request, deps?: CreateAgentDeps) {
  try {
    const body = await request.json();
    const { config, knowledge, agentId } = body;

    if (!config || !knowledge) {
       return NextResponse.json({ error: 'Missing config or knowledge' }, { status: 400 });
    }

    let user: { id: string } | null;
    let agentRepository: IAgentRepository;
    if (deps) {
      user = await deps.getUser();
      agentRepository = deps.repository;
    } else {
      const supabase = await createServerSupabase();
      const { data } = await supabase.auth.getUser();
      user = data.user;
      agentRepository = new SupabaseAgentRepository(supabase);
    }
    if (!user) {
      return NextResponse.json({ error: 'Sign in required to save an agent' }, { status: 401 });
    }

    if (agentId != null && agentId !== '' && (typeof agentId !== 'string' || !isUuid(agentId))) {
      return NextResponse.json({ error: 'Agent id must be a UUID' }, { status: 400 });
    }

    const createAgentUseCase = new CreateAgentUseCase(agentRepository);

    const agent = await createAgentUseCase.execute(
      config,
      knowledge,
      typeof agentId === 'string' && agentId.length > 0 ? agentId : undefined
    );
    
    return NextResponse.json({ 
      success: true, 
      agentId: agent.id,
      url: `/chat/${agent.id}` 
    });

  } catch (error: any) {
    console.error('Failed to save agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create agent' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return handleCreateAgent(request);
}
