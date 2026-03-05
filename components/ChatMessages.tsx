import React, { useEffect, useRef, useMemo } from 'react';
import type { ChatMessage, SearchResult } from '../types';
import MemoizedChatBubble from './ChatBubble';
import PromptSuggestions from './PromptSuggestions';
import { RobotIcon, ArrowPathIcon, PinIcon } from './Icons';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoading: boolean;
  onRegenerateResponse: () => void;
  speak: (text: string, id: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  currentlySpeakingId: string | null;
  searchQuery: string;
  currentSearchResult: SearchResult | null;
  onToggleMessagePin: (messageId: string) => void;
  onSuggestionClick: (text: string) => void;
  isKidsMode: boolean;
  isSearchVisible: boolean;
}

const PinnedMessage: React.FC<{ message: ChatMessage, onToggleMessagePin: (id: string) => void }> = ({ message, onToggleMessagePin }) => (
    <div className="flex items-center gap-2 p-2 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 cursor-pointer" onClick={() => {
        const element = document.getElementById(`message-${message.id}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element?.classList.add('animate-highlight-pin');
        setTimeout(() => element?.classList.remove('animate-highlight-pin'), 1200);
    }}>
        <PinIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
        <p className="text-xs text-slate-300 truncate flex-grow">
            <span className="font-semibold">{message.role === 'user' ? 'You' : 'AI'}:</span> {message.text}
        </p>
        <button onClick={(e) => { e.stopPropagation(); onToggleMessagePin(message.id);}} className="p-1 text-slate-400 hover:text-white rounded-full flex-shrink-0">
             <PinIcon className="w-4 h-4" />
        </button>
    </div>
);

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isStreaming,
  isLoading,
  onRegenerateResponse,
  speak,
  cancel,
  isSpeaking,
  currentlySpeakingId,
  searchQuery,
  currentSearchResult,
  onToggleMessagePin,
  onSuggestionClick,
  isKidsMode,
  isSearchVisible,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!isSearchVisible) {
      scrollToBottom('auto');
    }
  }, [messages.length, isStreaming, isSearchVisible]);

  const hasOnlyInitialMessage = useMemo(() => {
    return messages.length === 1 && messages[0].role === 'assistant';
  }, [messages]);

  const pinnedMessages = useMemo(() => messages.filter(m => m.isPinned), [messages]);
  const regularMessages = useMemo(() => messages, [messages]); // Keep all messages for main view

  const lastMessage = messages[messages.length - 1];
  const lastMessageIsError = lastMessage?.isError === true;
  const canRegenerate = !isLoading && !isStreaming && messages.some(m => m.role === 'model');

  return (
    <div className="flex-grow flex flex-col overflow-hidden">
        {pinnedMessages.length > 0 && !isKidsMode && (
            <div className="flex-shrink-0 p-2 border-b border-white/10 bg-black/20 backdrop-blur-sm z-10">
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {pinnedMessages.map(msg => (
                      <PinnedMessage key={`pin-${msg.id}`} message={msg} onToggleMessagePin={onToggleMessagePin} />
                  ))}
                </div>
            </div>
        )}
        <div ref={chatContainerRef} className="flex-grow p-4 sm:p-6 overflow-y-auto">
        {hasOnlyInitialMessage ? (
            <PromptSuggestions onSuggestionClick={onSuggestionClick} isKidsMode={isKidsMode} />
        ) : (
            <div className="space-y-8">
            {regularMessages.map((msg, index) => (
                <div id={`message-${msg.id}`} key={msg.id}>
                    <MemoizedChatBubble
                    message={msg}
                    isStreaming={isStreaming && index === messages.length - 1}
                    onRegenerateResponse={onRegenerateResponse}
                    speak={speak}
                    cancel={cancel}
                    isSpeaking={isSpeaking}
                    currentlySpeakingId={currentlySpeakingId}
                    searchQuery={searchQuery}
                    isCurrentSearchResult={currentSearchResult?.messageId === msg.id}
                    onToggleMessagePin={onToggleMessagePin}
                    />
                </div>
            ))}
            {isLoading && !isStreaming && (
                    <div className="flex items-start gap-3 md:gap-4 my-2 justify-start animate-pulse">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <RobotIcon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-lg">
                            <div className="typing-indicator-bar h-2 w-16 rounded-full"></div>
                        </div>
                    </div>
                )}
                {(lastMessageIsError || canRegenerate) && (
                    <div className="flex justify-center items-center py-4">
                        <button
                            onClick={onRegenerateResponse}
                            disabled={isLoading || isStreaming}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-full hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowPathIcon className="w-4 h-4"/>
                            <span>Antwort neu generieren</span>
                        </button>
                    </div>
                )}
            </div>
        )}
        <div ref={messagesEndRef} />
        </div>
    </div>
  );
};

export default ChatMessages;