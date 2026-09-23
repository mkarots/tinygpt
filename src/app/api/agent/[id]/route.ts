import { NextResponse } from 'next/server';
import { SupabaseAgentRepository } from '../../../../infrastructure/repositories/SupabaseAgentRepository';
import { createClient as createServerSupabase } from '../../../../lib/supabase-server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    
    if (!agentId) {
       return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const repo = new SupabaseAgentRepository(supabase);
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
