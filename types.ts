
export type KnowledgeType = 'file' | 'url' | 'text';

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  content: string;
  size: number;
}

export interface KnowledgeItem {
  id: string;
  type: KnowledgeType;
  name: string;
  content: string;
  status: 'pending' | 'active' | 'error';
  size?: number;
  dateAdded: number;
}

export interface AgentConfig {
  name: string;
  description: string;
  primaryColor: string;
  greeting: string;
  tone: 'professional' | 'friendly' | 'concise' | 'humorous';
  quickQuestions: { text: string; emoji: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}

export type DashboardTab = 'knowledge' | 'appearance' | 'deploy';

export interface CompanyInfo {
  name: string;
  website: string;
  industry: string;
  email?: string;
}

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

declare global {
  interface Window {
    confetti: any;
  }
}
