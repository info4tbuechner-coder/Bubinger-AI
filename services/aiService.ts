import type { GenerateContentResponse } from '@google/genai';
import { Part } from '@google/genai';
import type { AiModelId, ChatMessage, ModelConfig } from '../types';
import { geminiAiService } from './geminiService';

export interface IAiChatSession {
    sendMessageStream(params: { message: Part[] }): Promise<AsyncIterable<GenerateContentResponse>>;
}

export interface IAiService {
    createChatSession(history: ChatMessage[], config?: Partial<ModelConfig>): IAiChatSession;
    generateKeywords(messages: ChatMessage[]): Promise<string[]>;
    generateTitle(messages: ChatMessage[]): Promise<string>;
    fileToGenerativePart(file: File): Promise<Part>;
    dataUrlToGenerativePart(dataUrl: string, mimeType: string): Part;
    generateImages(prompt: string): Promise<string[]>;
}

const services: Record<AiModelId, IAiService> = {
    'gemini-2.5-flash': geminiAiService,
    // Hier könnten in Zukunft weitere Modelle hinzugefügt werden
    // 'another-model': anotherAiService,
};

export const getAiService = (modelId: AiModelId): IAiService => {
    const service = services[modelId];
    if (!service) {
        console.warn(`Kein KI-Service für das Modell "${modelId}" gefunden. Fallback auf "gemini-2.5-flash".`);
        return services['gemini-2.5-flash'];
    }
    return service;
};