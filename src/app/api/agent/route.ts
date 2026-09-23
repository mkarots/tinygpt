import { NextResponse } from 'next/server';
import { CreateAgentUseCase } from '../../../application/use-cases/CreateAgentUseCase';
import { SupabaseAgentRepository } from '../../../infrastructure/repositories/SupabaseAgentRepository';
import { createClient as createServerSupabase } from '../../../lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { config, knowledge, agentId } = body;

    if (!config || !knowledge) {
       return NextResponse.json({ error: 'Missing config or knowledge' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required to save an agent' }, { status: 401 });
    }

    const agentRepository = new SupabaseAgentRepository(supabase);
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
