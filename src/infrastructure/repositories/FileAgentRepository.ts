import { IAgentRepository } from '../../domain/interfaces/IAgentRepository';
import { Agent } from '../../domain/entities/Agent';
import fs from 'fs/promises';
import path from 'path';

export class FileAgentRepository implements IAgentRepository {
  private storageDir: string;

  constructor() {
    this.storageDir = path.join(process.cwd(), 'public', 'agents');
  }

  private async ensureDir() {
    try {
      await fs.access(this.storageDir);
    } catch {
      await fs.mkdir(this.storageDir, { recursive: true });
    }
  }

  async save(agent: Agent): Promise<void> {
    await this.ensureDir();
    const filePath = path.join(this.storageDir, `${agent.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(agent, null, 2));
  }

  async getById(id: string): Promise<Agent | null> {
    try {
      const filePath = path.join(this.storageDir, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as Agent;
    } catch {
      return null;
    }
  }
}

