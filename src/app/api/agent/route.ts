import { NextResponse } from 'next/server';
import { CreateAgentUseCase } from '../../../application/use-cases/CreateAgentUseCase';
import { FileAgentRepository } from '../../../infrastructure/repositories/FileAgentRepository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { config, knowledge } = body;

    if (!config || !knowledge) {
       return NextResponse.json({ error: 'Missing config or knowledge' }, { status: 400 });
    }

    const agentRepository = new FileAgentRepository();
    const createAgentUseCase = new CreateAgentUseCase(agentRepository);

    const agent = await createAgentUseCase.execute(config, knowledge);
    
    return NextResponse.json({ 
      success: true, 
      agentId: agent.id,
      url: `/chat/${agent.id}` 
    });

  } catch (error) {
    console.error('Failed to save agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent share link' },
      { status: 500 }
    );
  }
}


