import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PaperAirplaneIcon, StopIcon, PaperClipIcon, XCircleIcon, MicrophoneIcon, MagnifyingGlassIcon, DocumentTextIcon } from './Icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useToast } from '../contexts/ToastContext';
import type { ChatMessage } from '../types';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 25;

interface FilePreviewProps {
    file: File;
    onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
    return (
        <div className="relative group/file bg-slate-800/80 rounded-full p-1.5 pr-8 flex items-center gap-2 border border-slate-600 animate-fade-in-fast">
            <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <DocumentTextIcon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xs text-slate-300 truncate min-w-0">
                <p className="font-medium truncate">{file.name}</p>
            </div>
            <button 
                onClick={onRemove} 
                className="absolute top-1/2 right-1 -translate-y-1/2 p-0.5 bg-slate-600/50 hover:bg-slate-500/50 rounded-full text-white"
            >
                <XCircleIcon className="w-5 h-5"/>
            </button>
        </div>
    );
};


interface ChatInputProps {
    isLoading: boolean;
    isStreaming: boolean;
    onSendMessage: (message: string, files: File[]) => void;
    onStopGeneration: () => void;
    inputText: string;
    onInputChange: (value: string) => void;
    isKidsMode: boolean;
    isWebSearchEnabled: boolean;
    onToggleWebSearch: () => void;
    onRegenerateResponse: () => void;
    onClearChat: () => void;
    messages: ChatMessage[];
}

const ChatInput: React.FC<ChatInputProps> = ({
    isLoading,
    isStreaming,
    onSendMessage,
    onStopGeneration,
    inputText,
    onInputChange,
    isKidsMode,
    isWebSearchEnabled,
    onToggleWebSearch,
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();
    const { isListening, command, startListening, stopListening } = useSpeechRecognition();
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        if (command) {
            onInputChange(prev => (prev ? prev + ' ' : '') + command.text);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [command]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
        }
    }, [inputText]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!inputText.trim() && files.length === 0) || isLoading || isStreaming) return;
        onSendMessage(inputText, files);
        setFiles([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            let validFiles = [...files];
            let errorShown = false;

            for (const file of newFiles) {
                if (validFiles.length >= MAX_FILES) {
                    if (!errorShown) addToast(`Sie können maximal ${MAX_FILES} Dateien hochladen.`, "error");
                    errorShown = true;
                    break;
                }
                const typedFile = file as File;
                if (typedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                     if (!errorShown) addToast(`Datei "${typedFile.name}" ist größer als ${MAX_FILE_SIZE_MB}MB.`, "error");
                     errorShown = true;
                    continue;
                }
                validFiles.push(typedFile);
            }
            setFiles(validFiles.slice(0, MAX_FILES));
        }
         // Reset file input to allow selecting the same file again
        if(fileInputRef.current) fileInputRef.current.value = '';
    };
    
    const removeFile = (indexToRemove: number) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="p-4 border-t border-white/10 flex-shrink-0 bg-black/20 rounded-b-2xl">
            {files.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {files.map((file, i) => (
                        <FilePreview key={i} file={file} onRemove={() => removeFile(i)} />
                    ))}
                </div>
            )}
            <div className="bg-slate-800/50 rounded-xl transition-all border border-transparent focus-within:focus-glow">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2 p-2">
                    <div className="flex-shrink-0 flex items-center self-end pb-1.5">
                        {!isKidsMode && (
                            <>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" accept="image/*,text/*,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.go,.php,.rb,.rs,.swift,.kt,.kts,.html,.css,.scss,.less,.json,.xml,.yaml,.yml,.md,.sh,.bash,.sql"/>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-indigo-400 rounded-full transition-colors" aria-label="Datei anhängen">
                                    <PaperClipIcon className="w-6 h-6" />
                                </button>
                                <button type="button" onClick={isListening ? stopListening : startListening} className={`p-2 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-indigo-400'}`} aria-label="Spracheingabe">
                                    <MicrophoneIcon className="w-6 h-6" />
                                </button>
                                <button type="button" onClick={onToggleWebSearch} className={`p-2 rounded-full transition-colors ${isWebSearchEnabled ? 'text-indigo-400' : 'text-slate-400 hover:text-indigo-400'}`} aria-label="Web-Suche umschalten">
                                    <MagnifyingGlassIcon className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex-grow relative">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            placeholder={isKidsMode ? "Frag Bubi etwas..." : "Nachricht an Bubinger-AI..."}
                            className="w-full bg-transparent text-slate-200 rounded-lg pl-2 pr-12 py-2.5 focus:outline-none text-base resize-none max-h-48"
                            value={inputText}
                            onChange={(e) => onInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading || isStreaming}
                        />
                    </div>
                     <div className="flex-shrink-0 self-end pb-1.5">
                            {isStreaming ? (
                                <button type="button" onClick={onStopGeneration} className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 transition-all transform hover:scale-110">
                                    <StopIcon className="w-5 h-5" />
                                </button>
                            ) : (
                                <button type="submit" disabled={(!inputText.trim() && files.length === 0) || isLoading} className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-110">
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                </form>
            </div>
        </div>
    );
};

export default ChatInput;