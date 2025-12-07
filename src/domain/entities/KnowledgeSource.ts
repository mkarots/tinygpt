export type KnowledgeType = 'file' | 'url' | 'text';

export interface KnowledgeItem {
  id: string;
  type: KnowledgeType;
  name: string;
  content: string;
  status: 'pending' | 'active' | 'error';
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

