import { GoogleGenAI, Chat, Type, Part } from '@google/genai';
import type { ChatMessage, ModelConfig } from '../types';
import { Role } from '../types';
import type { IAiService } from './aiService';

let ai: GoogleGenAI;

// Singleton-Muster, um sicherzustellen, dass die KI-Instanz nur einmal erstellt wird.
const getAi = (): GoogleGenAI => {
    if (!ai) {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API-Schlüssel für Gemini ist nicht konfiguriert.");
            throw new Error("API-Schlüssel für Gemini ist nicht konfiguriert.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};

const keywordExtractionSchema = {
    type: Type.OBJECT,
    properties: {
        keywords: {
            type: Type.ARRAY,
            description: "Eine Liste von 5-7 wichtigen und wiederkehrenden Schlüsselwörtern oder Konzepten aus der Konversation.",
            items: { type: Type.STRING }
        }
    },
    required: ["keywords"]
};

const titleGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "Ein sehr kurzer, prägnanter Titel für die Konversation, maximal 5 Wörter.",
        }
    },
    required: ["title"]
};


export const dataUrlToGenerativePart = (dataUrl: string, mimeType: string): Part => {
    return {
        inlineData: {
            data: dataUrl.split(',')[1],
            mimeType,
        },
    };
};


/**
 * Wandelt eine Bilddatei in ein für die Gemini-API geeignetes Format um.
 * @param file Die Bilddatei, die konvertiert werden soll.
 * @returns Ein Promise, das mit dem `Part`-Objekt für die API aufgelöst wird.
 */
export const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
};

/**
 * Erstellt eine neue Chat-Sitzung mit dem gegebenen Verlauf.
 * @param history Der bisherige Chat-Verlauf.
 * @param config Optionale Konfiguration für das Model.
 * @returns Eine `Chat`-Instanz.
 */
export const createChatSession = (history: ChatMessage[], config?: Partial<ModelConfig>): Chat => {
    const aiInstance = getAi();
    
    const historyForApi = history
        .filter(m => m.role === Role.USER || m.role === Role.MODEL)
        .map(m => {
            const parts: Part[] = [{ text: m.text }];
            if (m.files && m.role === Role.USER) {
                m.files.forEach(file => {
                    parts.push(dataUrlToGenerativePart(file.dataUrl, file.type));
                })
            }
            return {
                role: m.role,
                parts: parts,
            };
        });

    return aiInstance.chats.create({
        model: 'gemini-2.5-flash',
        history: historyForApi,
        config: config,
    });
};

/**
 * Extrahiert Schlüsselkonzepte aus einer Konversation.
 * @param currentMessages Der aktuelle Chat-Verlauf.
 * @returns Ein Promise, das mit einer Liste von Schlüsselwörtern aufgelöst wird.
 */
export const generateKeywords = async (currentMessages: ChatMessage[]): Promise<string[]> => {
    const aiInstance = getAi();
    
    const conversation = currentMessages
        .filter(m => m.role === Role.USER || m.role === Role.MODEL)
        .map(m => `${m.role}: ${m.text}`)
        .join('\n');
    
    // Analysiert nur, wenn die Konversation eine gewisse Länge hat.
    if (conversation.length < 50) return [];

    try {
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analysieren Sie die folgende Konversation und extrahieren Sie die 5-7 wichtigsten und wiederkehrenden Schlüsselwörter oder Konzepte. Konversation:\n\n${conversation}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: keywordExtractionSchema,
                temperature: 0.2
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        if (result.keywords && Array.isArray(result.keywords)) {
            return result.keywords;
        }
        return [];
    } catch (error) {
        console.error("Fehler bei der Extraktion von Schlüsselwörtern:", error);
        throw error; // Gibt den Fehler weiter, damit der Aufrufer ihn behandeln kann.
    }
};

/**
 * Generiert einen kurzen Titel für eine Konversation.
 * @param messages Die ersten paar Nachrichten des Chats.
 * @returns Ein Promise, das mit dem generierten Titel aufgelöst wird.
 */
export const generateTitle = async (messages: ChatMessage[]): Promise<string> => {
    const aiInstance = getAi();
     const conversation = messages
        .filter(m => m.role === Role.USER || m.role === Role.MODEL)
        .map(m => `${m.role}: ${m.text}`)
        .slice(0, 4) // Nimmt maximal die ersten 4 Nachrichten
        .join('\n');

    if (!conversation) return "Neuer Chat";
    
    try {
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Fassen Sie den folgenden Gesprächsanfang in einem sehr kurzen, prägnanten Titel zusammen (maximal 5 Wörter). Gespräch:\n\n${conversation}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: titleGenerationSchema,
                temperature: 0.3
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.title || "Neuer Chat";

    } catch (error) {
        console.error("Fehler bei der Titelgenerierung:", error);
        return "Neuer Chat";
    }
};

/**
 * Generiert Bilder basierend auf einem Prompt.
 * @param prompt Die textuelle Beschreibung für das zu generierende Bild.
 * @returns Ein Promise, das mit einer Liste von Base64-kodierten Bild-Strings aufgelöst wird.
 */
export const generateImages = async (prompt: string): Promise<string[]> => {
    const aiInstance = getAi();
    try {
        const response = await aiInstance.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            }
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages.map(img => img.image.imageBytes);
        }
        return [];

    } catch (error) {
         console.error("Fehler bei der Bildgenerierung:", error);
         if (error instanceof Error) {
            throw new Error(`Fehler bei der Bildgenerierung: ${error.message}`);
         }
         throw new Error("Ein unbekannter Fehler ist bei der Bildgenerierung aufgetreten.");
    }
};

export const geminiAiService: IAiService = {
    createChatSession,
    generateKeywords,
    generateTitle,
    fileToGenerativePart,
    dataUrlToGenerativePart,
    generateImages,
};
