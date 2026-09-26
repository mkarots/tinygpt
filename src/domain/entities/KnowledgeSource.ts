export type KnowledgeType = 'file' | 'url' | 'text';

export interface KnowledgeItem {
  id: string;
  type: KnowledgeType;
  name: string;
  content: string;
  status: 'pending' | 'active' | 'error';
  /** Shop-owner reason when status is error; never used as chat context. */
  error?: string;
  size?: number;
  dateAdded: number;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  content: string;
  size: number;
}

