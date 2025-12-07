import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    
    if (!agentId) {
       return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'agents', `${agentId}.json`);
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const agentData = JSON.parse(fileContent);
      return NextResponse.json(agentData);
    } catch (e) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Failed to retrieve agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

