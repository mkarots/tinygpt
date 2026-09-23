export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

