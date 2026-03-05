import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Part, Type } from '@google/genai';
import type { ChatMessage, DashboardStats, ModelConfig, ChatSession, ChatMessageFile, Persona, AiModelId } from '../types';
import { Role } from '../types';
import { getAiService, IAiChatSession } from '../services/aiService';
import { useToast } from '../contexts/ToastContext';
import { useTextToSpeech } from './useTextToSpeech';
import { useAutoPlayback } from './useAutoPlayback';

const SESSIONS_KEY = 'gemini-chat-sessions';

const defaultConfig: ModelConfig = {
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    systemInstruction: 'Sie sind ein hilfreicher und freundlicher deutscher KI-Assistent. Antworten Sie immer auf Deutsch.',
};

const createNewSession = (persona: Persona): ChatSession => {
  const id = crypto.randomUUID();
  return {
    id,
    title: 'Neuer Chat',
    messages: [{
      id: crypto.randomUUID(),
      role: Role.ASSISTANT,
      text: 'Hallo! Wie kann ich Ihnen heute helfen? Stellen Sie mir eine Frage, um zu beginnen.',
    }],
    createdAt: Date.now(),
    config: { ...defaultConfig, systemInstruction: persona.instruction },
    isWebSearchEnabled: false,
  };
};

export const useChatManager = (personas: Persona[]) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  
  const chatRef = useRef<IAiChatSession | null>(null);
  const stopStreamingRef = useRef<boolean>(false);
  const { addToast } = useToast();
  
  const { speak, cancel, isSpeaking, currentlySpeakingId } = useTextToSpeech();
  const { isAutoPlaybackEnabled, toggleAutoPlayback } = useAutoPlayback();

  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId) || null, [sessions, activeSessionId]);
  
  const activeSessionRef = useRef(activeSession);
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  const isStreamingRef = useRef(isStreaming);
  useEffect(() => { isStreamingRef.current = isStreaming; }, [isStreaming]);

  const isAutoPlaybackEnabledRef = useRef(isAutoPlaybackEnabled);
  useEffect(() => { isAutoPlaybackEnabledRef.current = isAutoPlaybackEnabled; }, [isAutoPlaybackEnabled]);


  useEffect(() => {
    try {
      const savedSessions = window.localStorage.getItem(SESSIONS_KEY);
      if (savedSessions) {
        const parsedSessions: ChatSession[] = JSON.parse(savedSessions);
        if(parsedSessions.length > 0) {
            parsedSessions.sort((a, b) => b.createdAt - a.createdAt);
            setSessions(parsedSessions);
            setActiveSessionId(parsedSessions[0].id);
        } else {
             const newSession = createNewSession({id: 'default-1', name: 'default', instruction: defaultConfig.systemInstruction, isDefault: true});
             setSessions([newSession]);
             setActiveSessionId(newSession.id);
        }
      } else {
        const newSession = createNewSession({id: 'default-1', name: 'default', instruction: defaultConfig.systemInstruction, isDefault: true});
        setSessions([newSession]);
        setActiveSessionId(newSession.id);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Chat-Sitzungen:", error);
      addToast("Chat-Sitzungen konnten nicht geladen werden.", "error");
      const newSession = createNewSession({id: 'default-1', name: 'default', instruction: defaultConfig.systemInstruction, isDefault: true});
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);
  
  useEffect(() => {
    if (!isLoading) {
      window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  }, [sessions, isLoading]);
  
  useEffect(() => {
    if (activeSession) {
      const aiService = getAiService(activeSession.config.model);
      chatRef.current = aiService.createChatSession(activeSession.messages, activeSession.config);
    }
  }, [activeSession]);

  const updateSession = useCallback((sessionId: string, updates: Partial<ChatSession>) => {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates } : s));
  }, []);

  const stats = useMemo<DashboardStats>(() => {
    const messages = activeSession?.messages || [];
    const userMessages = messages.filter(m => m.role === Role.USER).length;
    const modelMessages = messages.filter(m => m.role === Role.MODEL).length;
    return {
        messageCount: userMessages + modelMessages,
        userMessages,
        modelMessages,
    };
  }, [activeSession]);


  const streamResponse = useCallback(async (promptParts: Part[]): Promise<string> => {
    const currentSession = activeSessionRef.current;
    if (!chatRef.current || !currentSession) throw new Error("Chat ist nicht initialisiert.");
    if (isStreamingRef.current) throw new Error("Streaming ist bereits im Gange.");

    setIsStreaming(true);
    stopStreamingRef.current = false;
    
    const modelMessageId = crypto.randomUUID();
    const modelPlaceholder: ChatMessage = { id: modelMessageId, role: Role.MODEL, text: '' };
    
    setSessions(prev => prev.map(s => s.id === currentSession.id ? { ...s, messages: [...s.messages, modelPlaceholder] } : s));

    let fullResponse = "";
    try {
      const stream = await chatRef.current.sendMessageStream({
        message: promptParts,
      });
      
      for await (const chunk of stream) {
        if (stopStreamingRef.current) break;
        fullResponse += chunk.text;
        
        setSessions(prev => prev.map(s => {
            if (s.id !== currentSession.id) return s;
            const newMessages = [...s.messages];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.id === modelMessageId) {
                newMessages[newMessages.length - 1] = { ...lastMessage, text: fullResponse };
            }
            return { ...s, messages: newMessages };
        }));
      }
      
      if (isAutoPlaybackEnabledRef.current && !stopStreamingRef.current) {
          speak(fullResponse, modelMessageId);
      }

      return fullResponse;
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler beim Streamen.";
       setSessions(prev => prev.map(s => {
          if (s.id !== currentSession.id) return s;
          const newMessages = [...s.messages];
          if (newMessages[newMessages.length - 1]?.id === modelMessageId) {
            newMessages[newMessages.length - 1] = { id: modelMessageId, role: Role.MODEL, text: errorMessage, isError: true };
          }
          return { ...s, messages: newMessages };
        }));
      throw error;
    } finally {
      setIsStreaming(false);
      stopStreamingRef.current = false;
    }
  }, [speak, setSessions]);

  const handleSendMessage = useCallback(async (inputText: string, files: File[]): Promise<boolean> => {
    const currentSession = activeSessionRef.current;
    if ((!inputText.trim() && files.length === 0) || !currentSession) return false;
    
    cancel(); // Stoppt laufende Sprachausgabe
    const { config, id: sessionId } = currentSession;
    const aiService = getAiService(config.model);

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: Role.USER, text: inputText, files: [] };
    const promptParts: Part[] = [];

    if (inputText.trim()) {
        promptParts.push({ text: inputText });
    }
    
    if (files.length > 0) {
        try {
            const fileProcessingPromises = files.map(async file => {
                 const part = await aiService.fileToGenerativePart(file);
                 promptParts.push(part);
                 return new Promise<ChatMessageFile>((resolve, reject) => {
                     const reader = new FileReader();
                     reader.onloadend = () => resolve({ name: file.name, type: file.type, dataUrl: reader.result as string });
                     reader.onerror = reject;
                     reader.readAsDataURL(file);
                 });
            });
            userMessage.files = await Promise.all(fileProcessingPromises);
        } catch (error) {
            console.error("Fehler bei der Dateiverarbeitung:", error);
            addToast("Eine oder mehrere Dateien konnten nicht verarbeitet werden.", "error");
            return false;
        }
    }
    
    const isInitialMessage = currentSession.messages.length === 1 && currentSession.messages[0].role === Role.ASSISTANT;
    const newMessages = isInitialMessage ? [userMessage] : [...currentSession.messages, userMessage];
    updateSession(sessionId, { messages: newMessages });
    
    try {
        const fullApiResponse = await streamResponse(promptParts);
        
        if (isInitialMessage && currentSession.title === 'Neuer Chat') {
            const messagesForTitle: ChatMessage[] = [
                userMessage,
                { id: crypto.randomUUID(), role: Role.MODEL, text: fullApiResponse }
            ];
            const newTitle = await aiService.generateTitle(messagesForTitle);
            updateSession(sessionId, { title: newTitle });
        }
        return true;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler beim Senden.";
        addToast(`Fehler: ${errorMessage}`, "error");
        return false;
    }
  }, [streamResponse, addToast, updateSession, cancel]);

  const handleRegenerateResponse = useCallback(async () => {
    if (isStreamingRef.current || !activeSessionRef.current) return;
    
    const currentSession = activeSessionRef.current;
    cancel(); // Stoppt laufende Sprachausgabe
    const aiService = getAiService(currentSession.config.model);

    const { messages } = currentSession;
    const lastModelIndex = messages.map(m => m.role).lastIndexOf(Role.MODEL);
    if (lastModelIndex === -1) return;

    let lastUserMessage: ChatMessage | null = null;
    for (let i = lastModelIndex - 1; i >= 0; i--) {
        if (messages[i].role === Role.USER) {
            lastUserMessage = messages[i];
            break;
        }
    }

    if (lastUserMessage) {
        const historyForRegen = messages.slice(0, lastModelIndex);
        chatRef.current = aiService.createChatSession(historyForRegen, currentSession.config);
        updateSession(currentSession.id, { messages: historyForRegen });
        
        const promptParts: Part[] = [{ text: lastUserMessage.text }];
        if (lastUserMessage.files) {
            lastUserMessage.files.forEach(file => {
                promptParts.push(aiService.dataUrlToGenerativePart(file.dataUrl, file.type));
            });
        }
        
        try {
            await streamResponse(promptParts);
        } catch(error) {
            const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler beim Neu-Generieren.";
            addToast(`Fehler: ${errorMessage}`, "error");
        }
    }
  }, [streamResponse, addToast, updateSession, cancel]);

  const createSession = useCallback((initialPersona: Persona) => {
    const newSession = createNewSession(initialPersona);
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    addToast("Neuer Chat wurde erstellt.", "success");
  }, [addToast]);

  const switchSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    cancel(); // Stoppt Sprachausgabe beim Wechsel des Chats
  }, [cancel]);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
        const remaining = prev.filter(s => s.id !== sessionId);
        if (remaining.length === 0) {
            const newSession = createNewSession({id: 'default-1', name: 'default', instruction: defaultConfig.systemInstruction, isDefault: true});
            setActiveSessionId(newSession.id);
            return [newSession];
        }
        if (activeSessionId === sessionId) {
            setActiveSessionId(remaining[0].id);
        }
        return remaining;
    });
    addToast("Chat gelöscht.", "info");
  }, [activeSessionId, addToast]);
  
  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    updateSession(sessionId, { title });
    addToast("Chat umbenannt.", "success");
  }, [updateSession, addToast]);

  const updateActiveSessionConfig = useCallback((config: Partial<ModelConfig>) => {
      if (activeSessionId && activeSession) {
          const newConfig = { ...activeSession.config, ...config };
          updateSession(activeSessionId, { config: newConfig });
          const aiService = getAiService(newConfig.model);
          chatRef.current = aiService.createChatSession(activeSession.messages, newConfig);
      }
  }, [activeSessionId, activeSession, updateSession]);
  
  const togglePinSession = useCallback((sessionId: string) => {
    setSessions(prev => {
        const session = prev.find(s => s.id === sessionId);
        if (session) {
            const isNowPinned = !session.isPinned;
            addToast(isNowPinned ? "Chat angepinnt" : "Pin vom Chat entfernt", "info");
            return prev.map(s => s.id === sessionId ? { ...s, isPinned: isNowPinned } : s);
        }
        return prev;
    });
  }, [addToast]);
  
  const toggleMessagePin = useCallback((messageId: string) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s => {
        if (s.id !== activeSessionId) return s;
        let isNowPinned: boolean | undefined;
        const newMessages = s.messages.map(m => {
            if (m.id === messageId) {
                isNowPinned = !m.isPinned;
                return { ...m, isPinned: isNowPinned };
            }
            return m;
        });
        if (isNowPinned !== undefined) {
             addToast(isNowPinned ? "Nachricht angepinnt" : "Pin von Nachricht entfernt", "info");
        }
        return { ...s, messages: newMessages };
    }));
  }, [activeSessionId, addToast]);

  const clearChatMessages = useCallback(() => {
    const currentSession = activeSessionRef.current;
    if (currentSession) {
        const initialMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: Role.ASSISTANT,
            text: 'Hallo! Wie kann ich Ihnen heute helfen? Stellen Sie mir eine Frage, um zu beginnen.',
        };
        updateSession(currentSession.id, { messages: [initialMessage] });
        addToast("Chat geleert.", "info");
    }
  }, [updateSession, addToast]);

  const toggleWebSearch = useCallback(() => {
    const currentSession = activeSessionRef.current;
    if(currentSession) {
        const isEnabled = !currentSession.isWebSearchEnabled;
        updateSession(currentSession.id, { isWebSearchEnabled: isEnabled });
        addToast(`Web-Suche ${isEnabled ? 'aktiviert' : 'deaktiviert'}.`, 'info');
    }
  }, [updateSession, addToast]);

  const handleStopGeneration = useCallback(() => {
    stopStreamingRef.current = true;
  }, []);

  const handleExportChat = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || session.messages.length === 0) {
        addToast("Es gibt nichts zu exportieren.", "info");
        return;
    }

    const markdownContent = session.messages
        .filter(msg => msg.role === Role.USER || msg.role === Role.MODEL)
        .map(msg => {
            let content = `**${msg.role === Role.USER ? 'Benutzer' : 'KI'}:**\n\n`;
            if (msg.files && msg.files.length > 0) {
                content += `[${msg.files.length} Datei(en) angehängt: ${msg.files.map(f => f.name).join(', ')}]\n\n`;
            }
            content += `${msg.text || ''}\n\n`;
            return content;
        })
        .join('---\n\n');
    
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `chat-${sanitizedTitle}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast("Chat wurde als Markdown exportiert.", "success");
  }, [sessions, addToast]);

  return { 
      sessions, 
      activeSession, 
      isLoading, 
      isStreaming, 
      stats, 
      createSession,
      switchSession,
      deleteSession,
      updateSessionTitle,
      handleSendMessage, 
      handleStopGeneration, 
      handleRegenerateResponse, 
      handleExportChat,
      updateActiveSessionConfig,
      togglePinSession,
      toggleMessagePin,
      clearChatMessages,
      isAutoPlaybackEnabled,
      toggleAutoPlayback,
      speak,
      cancel,
      isSpeaking,
      currentlySpeakingId,
      toggleWebSearch,
    };
};