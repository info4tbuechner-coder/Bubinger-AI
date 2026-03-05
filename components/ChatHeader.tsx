import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, ChevronUpIcon, ChevronDownIcon, XIcon, EllipsisVerticalIcon, BackspaceIcon, ExportIcon } from './Icons';
import ConfirmModal from './ConfirmModal';

interface ChatHeaderProps {
    chatTitle: string;
    isSearchVisible: boolean;
    setIsSearchVisible: (visible: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchResultsCount: number;
    currentResultIndex: number;
    onPrevResult: () => void;
    onNextResult: () => void;
    onClearChat: () => void;
    onExportChat: () => void;
}

const ChatPanelMenu: React.FC<{ onClearChat: () => void; onExportChat: () => void; }> = React.memo(({ onClearChat, onExportChat }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClearChatClick = () => {
        setIsConfirmOpen(true);
        setIsOpen(false);
    };
    
    const handleExport = () => {
        onExportChat();
        setIsOpen(false);
    }

    return (
        <>
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-full transform hover:scale-110"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Chat-Optionen"
            >
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div 
                  className="absolute top-full right-0 mt-2 w-48 glass-pane rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-fade-in-slide-up origin-top-right"
                  role="menu"
                >
                    <div className="py-1" role="none">
                        <button
                            onClick={handleExport}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                            role="menuitem"
                        >
                            <ExportIcon className="w-4 h-4 text-slate-400" />
                            <span>Chat exportieren</span>
                        </button>
                        <button
                            onClick={handleClearChatClick}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                            role="menuitem"
                        >
                            <BackspaceIcon className="w-4 h-4 text-slate-400" />
                            <span>Chat leeren</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
        <ConfirmModal
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={onClearChat}
            title="Chat leeren"
            message="Möchten Sie wirklich alle Nachrichten in diesem Chat löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        />
        </>
    );
});


const ChatHeader: React.FC<ChatHeaderProps> = ({
    chatTitle, isSearchVisible, setIsSearchVisible, searchQuery, setSearchQuery, 
    searchResultsCount, currentResultIndex, onPrevResult, onNextResult, onClearChat, onExportChat
}) => {
    const searchButtonRef = useRef<HTMLButtonElement>(null);
    
    const closeSearch = () => {
      setIsSearchVisible(false);
      setSearchQuery('');
      searchButtonRef.current?.focus();
    }

    return (
        <>
            <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-semibold text-white truncate pr-4">{chatTitle}</h2>
                <div className="flex items-center gap-1">
                    <button 
                        ref={searchButtonRef}
                        onClick={() => setIsSearchVisible(prev => !prev)}
                        className="p-2 text-slate-400 hover:text-white transition-colors rounded-full transform hover:scale-110"
                        aria-label="Im Chat suchen"
                    >
                        <SearchIcon className="w-5 h-5" />
                    </button>
                    <ChatPanelMenu onClearChat={onClearChat} onExportChat={onExportChat} />
                </div>
            </div>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSearchVisible ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-2 border-b border-white/10 bg-black/20 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-grow bg-white/5 dark:bg-black/20 text-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            autoFocus={isSearchVisible}
                        />
                        <span className="text-sm font-mono text-slate-400 flex-shrink-0">
                          {searchQuery.length > 2 ? `${searchResultsCount > 0 ? currentResultIndex + 1 : 0} / ${searchResultsCount}` : '0 / 0'}
                        </span>
                        <button onClick={onPrevResult} disabled={searchResultsCount === 0} className="p-1.5 text-slate-400 disabled:opacity-50 hover:bg-white/10 rounded-full">
                            <ChevronUpIcon className="w-5 h-5" />
                        </button>
                        <button onClick={onNextResult} disabled={searchResultsCount === 0} className="p-1.5 text-slate-400 disabled:opacity-50 hover:bg-white/10 rounded-full">
                            <ChevronDownIcon className="w-5 h-5" />
                        </button>
                        <button onClick={closeSearch} className="p-1.5 text-slate-400 hover:bg-white/10 rounded-full">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatHeader;
