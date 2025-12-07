import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Helper to ensure directory exists
async function ensureDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    const agentData = await request.json();
    
    // Generate a simple ID
    const agentId = Math.random().toString(36).substring(2, 10);
    
    // Define storage path (public/agents for local dev)
    const storageDir = path.join(process.cwd(), 'public', 'agents');
    await ensureDir(storageDir);
    
    const filePath = path.join(storageDir, `${agentId}.json`);
    
    // Save to file
    await fs.writeFile(filePath, JSON.stringify({
      id: agentId,
      ...agentData,
      createdAt: Date.now()
    }, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      agentId,
      url: `/chat/${agentId}` 
    });

  } catch (error) {
    console.error('Failed to save agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent share link' },
      { status: 500 }
    );
  }
}

