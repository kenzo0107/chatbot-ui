import { OpenAIModel } from './openai';
import { ChatFile } from '@/types/chat-file'

export interface Message {
  role: Role;
  content: string;
  fileItems: ChatFile[]
}

export interface ChatMessage {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  model: OpenAIModel;
  messages: Message[];
  key: string;
  prompt: string;
  temperature: number;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: OpenAIModel;
  prompt: string;
  temperature: number;
  folderId: string | null;
}
