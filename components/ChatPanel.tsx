import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChatSession, SearchResult } from '../types';
import ChatHeader from './ChatHeader';
// FIX: Correct import path for ChatMessages component
import ChatMessages from './ChatMessages';
// FIX: Correct import path for ChatInput component
import ChatInput from './ChatInput';
import { useDebounce } from '../hooks/useDebounce';

interface ChatPanelProps {
  session: ChatSession;
  isLoading: boolean;
  isStreaming: boolean;
  onSendMessage: (message: string, files: File[]) => Promise<boolean>;
  onStopGeneration: () => void;
  onRegenerateResponse: () => void;
  speak: (text: string, id: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  currentlySpeakingId: string | null;
  onToggleMessagePin: (messageId: string) => void;
  onClearChat: () => void;
  onExportChat: () => void;
  isKidsMode: boolean;
  onToggleWebSearch: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
    session,
    isLoading, 
    isStreaming, 
    onSendMessage, 
    onStopGeneration, 
    onRegenerateResponse,
    speak,
    cancel,
    isSpeaking,
    currentlySpeakingId,
    onToggleMessagePin,
    onClearChat,
    onExportChat,
    isKidsMode,
    onToggleWebSearch,
}) => {
  const [inputText, setInputText] = useState('');
  
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);

  // Reset input text when session changes
  useEffect(() => {
    setInputText('');
  }, [session.id]);
  
  // Search logic
  useEffect(() => {
    if (debouncedSearchQuery.length > 2) {
        const results: SearchResult[] = [];
        session.messages.forEach(message => {
            if(message.text){
                const regex = new RegExp(debouncedSearchQuery, 'gi');
                let match;
                let matchIndex = 0;
                while ((match = regex.exec(message.text)) !== null) {
                    results.push({ messageId: message.id, matchIndex: matchIndex++ });
                }
            }
        });
        setSearchResults(results);
        setCurrentResultIndex(results.length > 0 ? 0 : -1);
    } else {
        setSearchResults([]);
        setCurrentResultIndex(-1);
    }
  }, [debouncedSearchQuery, session.messages]);
  
  const currentSearchResult = useMemo(() => {
    if(currentResultIndex >= 0 && currentResultIndex < searchResults.length){
        return searchResults[currentResultIndex];
    }
    return null;
  }, [searchResults, currentResultIndex]);
  
  const handleNextResult = useCallback(() => {
      if (searchResults.length === 0) return;
      setCurrentResultIndex(prev => (prev + 1) % searchResults.length);
  }, [searchResults.length]);
  
  const handlePrevResult = useCallback(() => {
      if (searchResults.length === 0) return;
      setCurrentResultIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
  }, [searchResults.length]);
  
  const handleSendMessageWrapper = async (message: string, files: File[]) => {
      const success = await onSendMessage(message, files);
      if (success) {
        setInputText('');
      }
  };

  const handleSuggestionClick = (text: string) => {
    setInputText(text);
    const form = document.querySelector('form'); // A bit of a hack, but simple
    if(form) {
        // Use a timeout to ensure the state update has propagated before submitting
        setTimeout(() => form.requestSubmit(), 0);
    }
  };

  return (
    <div className={`glass-pane rounded-2xl shadow-2xl flex flex-col h-full max-h-[calc(100vh-8rem)] ${isKidsMode ? 'kids-mode rounded-3xl' : ''}`}>
      <ChatHeader
        chatTitle={session.title}
        isSearchVisible={isSearchVisible}
        setIsSearchVisible={setIsSearchVisible}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResultsCount={searchResults.length}
        currentResultIndex={currentResultIndex}
        onNextResult={handleNextResult}
        onPrevResult={handlePrevResult}
        onClearChat={onClearChat}
        onExportChat={onExportChat}
      />
      <ChatMessages
        messages={session.messages}
        isStreaming={isStreaming}
        isLoading={isLoading}
        onRegenerateResponse={onRegenerateResponse}
        speak={speak}
        cancel={cancel}
        isSpeaking={isSpeaking}
        currentlySpeakingId={currentlySpeakingId}
        searchQuery={debouncedSearchQuery}
        currentSearchResult={currentSearchResult}
        onToggleMessagePin={onToggleMessagePin}
        onSuggestionClick={handleSuggestionClick}
        isKidsMode={isKidsMode}
        isSearchVisible={isSearchVisible}
      />
      <ChatInput
        isLoading={isLoading}
        isStreaming={isStreaming}
        onSendMessage={handleSendMessageWrapper}
        onStopGeneration={onStopGeneration}
        inputText={inputText}
        onInputChange={setInputText}
        isKidsMode={isKidsMode}
        isWebSearchEnabled={session.isWebSearchEnabled || false}
        onToggleWebSearch={onToggleWebSearch}
        onRegenerateResponse={onRegenerateResponse}
        onClearChat={onClearChat}
        messages={session.messages}
      />
    </div>
  );
};

export default ChatPanel;