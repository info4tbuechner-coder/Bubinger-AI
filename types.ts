
export enum Role {
  USER = 'user',
  MODEL = 'model',
  ASSISTANT = 'assistant', // for placeholder/info messages
}

export interface ChatMessageFile {
  name: string;
  type: string;
  dataUrl: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  files?: ChatMessageFile[];
  isError?: boolean;
  isPinned?: boolean;
}

// FIX: Moved SearchResult here to be shared across components
export interface SearchResult {
    messageId: string;
    matchIndex: number;
}

export interface DashboardStats {
  messageCount: number;
  userMessages: number;
  modelMessages: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

export type AiModelId = 'gemini-2.5-flash';

export interface ModelConfig {
  model: AiModelId;
  temperature: number;
  topP: number;
  topK: number;
  systemInstruction: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  config: ModelConfig;
  isPinned?: boolean;
  isWebSearchEnabled?: boolean;
}

export interface Persona {
  id: string;
  name: string;
  instruction: string;
  isDefault?: boolean;
  isKids?: boolean;
}

export type AppMode = 'chat' | 'image';