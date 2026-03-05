import React, { useMemo } from 'react';
import type { ChatMessage } from '../types';
import { Role } from '../types';
import { RobotIcon, UserIcon, CopyIcon, PinIcon, SpeakerWaveIcon, StopCircleIcon, ExclamationTriangleIcon, PinSlashIcon } from './Icons';
import { useToast } from '../contexts/ToastContext';
import { CodeBlock } from './CodeBlock';
import FileDisplay from './FileDisplay';

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming: boolean;
  searchQuery: string;
  isCurrentSearchResult: boolean;
  onRegenerateResponse: () => void;
  speak: (text: string, id: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  currentlySpeakingId: string | null;
  onToggleMessagePin: (messageId: string) => void;
}

const HighlightedText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-400 dark:bg-yellow-600 text-black rounded px-1">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
};


const SimpleMarkdownRenderer = ({ content, searchQuery }: { content: string, searchQuery: string }) => {
    const parts = useMemo(() => {
        // Split by code blocks
        return content.split(/(```[\s\S]*?```)/g);
    }, [content]);

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2">
            {parts.map((part, index) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const code = part.slice(3, -3);
                    return <CodeBlock key={index}>{code}</CodeBlock>;
                }
                // Naive bold/italic/strikethrough - can be expanded
                // FIX: Add explicit return type to map callback to aid TypeScript's type inference.
                const lines = part.split('\n').map((line, lineIndex): React.ReactNode => (
                    <React.Fragment key={lineIndex}>
                        <HighlightedText text={line} highlight={searchQuery} />
                        {lineIndex < part.split('\n').length -1 && <br />}
                    </React.Fragment>
                ));
                return <p key={index}>{lines}</p>;
            })}
        </div>
    );
};


const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isStreaming,
  searchQuery,
  isCurrentSearchResult,
  onRegenerateResponse,
  speak,
  cancel,
  isSpeaking,
  currentlySpeakingId,
  onToggleMessagePin,
}) => {
  const { addToast } = useToast();
  const isUser = message.role === Role.USER;
  const isModel = message.role === Role.MODEL;
  const isSpeakingThis = currentlySpeakingId === message.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text).then(() => {
      addToast("Nachricht kopiert!", "success");
    }).catch(err => {
      addToast("Kopieren fehlgeschlagen.", "error");
      console.error(err);
    });
  };

  const bubbleRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isCurrentSearchResult) {
      bubbleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isCurrentSearchResult]);

  return (
    <div
      ref={bubbleRef}
      className={`flex items-start gap-3 md:gap-4 my-2 animate-fade-in-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-slate-700' : 'bg-transparent'}`}>
          {isModel && <RobotIcon className="w-5 h-5 text-indigo-400" />}
        </div>
      )}

      <div className={`group relative w-full max-w-xl lg:max-w-2xl xl:max-w-3xl ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`
            px-4 py-3 rounded-2xl transition-all duration-300 shadow-md
            ${isUser ? 'bg-indigo-600 text-white rounded-br-lg' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg'}
            ${message.isError ? 'bg-red-500/20 border border-red-500' : ''}
            ${isCurrentSearchResult ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}
          `}
        >
          {message.files && message.files.length > 0 && (
             <div className="mb-2 space-y-2">
                {message.files.map((file, index) => (
                    <FileDisplay key={index} file={file} isUserMessage={isUser} />
                ))}
             </div>
          )}
          {message.isError ? (
            <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                <span className="text-sm">{message.text}</span>
            </div>
          ) : (
             <div className="whitespace-pre-wrap break-words text-base">
                 {message.text ? (
                     <SimpleMarkdownRenderer content={message.text} searchQuery={searchQuery} />
                 ) : (
                    isStreaming && <div className="dot-flashing"></div>
                 )}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className={`
            absolute bottom-0 flex items-center gap-1 transition-opacity duration-200
            ${isUser ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'}
            opacity-0 group-hover:opacity-100 focus-within:opacity-100
        `}>
          {isModel && !message.isError && message.text && (
            isSpeakingThis ? (
              <button onClick={cancel} className="p-1.5 text-slate-400 bg-white dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600/80 shadow-md">
                <StopCircleIcon className="w-5 h-5 text-red-500" />
              </button>
            ) : (
              <button onClick={() => speak(message.text, message.id)} className="p-1.5 text-slate-400 bg-white dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600/80 shadow-md">
                <SpeakerWaveIcon className="w-5 h-5" />
              </button>
            )
          )}
          {!message.isError && message.text && (
            <button onClick={handleCopy} className="p-1.5 text-slate-400 bg-white dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600/80 shadow-md">
              <CopyIcon className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => onToggleMessagePin(message.id)} className={`p-1.5 bg-white dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600/80 shadow-md ${message.isPinned ? 'text-indigo-500' : 'text-slate-400'}`}>
            {message.isPinned ? <PinSlashIcon className="w-5 h-5" /> : <PinIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center order-2">
          <UserIcon className="w-5 h-5 text-indigo-400" />
        </div>
      )}
    </div>
  );
};
const MemoizedChatBubble = React.memo(ChatBubble);
export default MemoizedChatBubble;