import { NextResponse } from 'next/server';
import { FileAgentRepository } from '../../../../infrastructure/repositories/FileAgentRepository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    
    if (!agentId) {
       return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    const repo = new FileAgentRepository();
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
