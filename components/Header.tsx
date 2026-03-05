import React, { useState, useEffect, useRef } from 'react';
import type { AppMode } from '../types';
import { RobotIcon, CogIcon, PlusIcon, SparklesIcon, SpeakerWaveIcon, SpeakerXMarkIcon, PhotoIcon, ChatBubbleLeftRightIcon, ChevronRightIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from './Icons';

interface HeaderProps {
    onNewChat: () => void;
    onOpenSettings: () => void;
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
    isAutoPlaybackEnabled: boolean;
    onToggleAutoPlayback: () => void;
    isKidsMode: boolean;
    onToggleKidsMode: () => void;
    appMode: AppMode;
    setAppMode: (mode: AppMode) => void;
    onLogout: () => void;
}

const UserMenu: React.FC<Pick<HeaderProps, 'onOpenSettings' | 'isAutoPlaybackEnabled' | 'onToggleAutoPlayback' | 'isKidsMode' | 'onToggleKidsMode' | 'onLogout'>> = ({
    onOpenSettings,
    isAutoPlaybackEnabled,
    onToggleAutoPlayback,
    isKidsMode,
    onToggleKidsMode,
    onLogout
}) => {
    const [isOpen, setIsOpen] = useState(false);
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

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-full header-button-glow"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <UserCircleIcon className="w-6 h-6" />
            </button>
            {isOpen && (
                 <div 
                  className="absolute top-full right-0 mt-2 w-64 glass-pane rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 animate-fade-in-slide-up origin-top-right"
                  role="menu"
                >
                    <div className="py-1" role="none">
                        <button
                            onClick={() => { onOpenSettings(); setIsOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                        >
                            <CogIcon className="w-5 h-5 text-slate-400" />
                            <span>Einstellungen</span>
                        </button>
                        <button
                            onClick={() => { onToggleAutoPlayback(); setIsOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                        >
                            {isAutoPlaybackEnabled ? <SpeakerWaveIcon className="w-5 h-5 text-indigo-400" /> : <SpeakerXMarkIcon className="w-5 h-5 text-slate-400" />}
                            <span>Automatische Wiedergabe</span>
                        </button>
                         <button
                            onClick={() => { onToggleKidsMode(); setIsOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                        >
                            <SparklesIcon className={`w-5 h-5 ${isKidsMode ? 'text-yellow-400' : 'text-slate-400'}`} />
                            <span>Kindermodus</span>
                        </button>
                        <div className="border-t border-white/10 my-1"></div>
                        <button
                            onClick={() => { onLogout(); setIsOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 text-slate-400" />
                            <span>Abmelden</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export const Header: React.FC<HeaderProps> = ({
    onNewChat,
    onOpenSettings,
    isSidebarOpen,
    onToggleSidebar,
    isAutoPlaybackEnabled,
    onToggleAutoPlayback,
    isKidsMode,
    onToggleKidsMode,
    appMode,
    setAppMode,
    onLogout
}) => {
    return (
        <header className="p-4 flex-shrink-0">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-2 shadow-lg">
                        <RobotIcon className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 hidden sm:block">
                        Bubinger-AI
                    </h1>
                </div>

                {!isKidsMode && (
                    <div className="absolute left-1/2 -translate-x-1/2 p-1 glass-pane rounded-full flex items-center gap-1 border border-white/10">
                       <button onClick={() => setAppMode('chat')} className={`px-4 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-all ${appMode === 'chat' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-white/10'}`}>
                           <ChatBubbleLeftRightIcon className="w-5 h-5" />
                           <span className="hidden md:inline">Chat</span>
                       </button>
                        <button onClick={() => setAppMode('image')} className={`px-4 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-all ${appMode === 'image' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-white/10'}`}>
                            <PhotoIcon className="w-5 h-5" />
                           <span className="hidden md:inline">Bilder</span>
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-1">
                    <button
                        onClick={onNewChat}
                        className="p-2 text-slate-400 hover:text-white transition-colors rounded-full header-button-glow"
                        aria-label="Neuer Chat"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                    
                    {!isKidsMode && (
                         <>
                            <UserMenu 
                                onOpenSettings={onOpenSettings}
                                isAutoPlaybackEnabled={isAutoPlaybackEnabled}
                                onToggleAutoPlayback={onToggleAutoPlayback}
                                isKidsMode={isKidsMode}
                                onToggleKidsMode={onToggleKidsMode}
                                onLogout={onLogout}
                            />
                            <button
                                onClick={onToggleSidebar}
                                className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hidden lg:inline-flex header-button-glow"
                                aria-label={isSidebarOpen ? "Seitenleiste schließen" : "Seitenleiste öffnen"}
                            >
                                <ChevronRightIcon className={`w-6 h-6 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
                            </button>
                        </>
                    )}
                     {isKidsMode && (
                        <button
                            onClick={onToggleKidsMode}
                            className={`p-2 transition-colors rounded-full header-button-glow ${isKidsMode ? 'text-yellow-400' : 'text-slate-400 hover:text-white'}`}
                            aria-label="Kindermodus verlassen"
                        >
                            <SparklesIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};