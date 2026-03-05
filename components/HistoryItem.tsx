import React, { useState, useRef, useEffect } from 'react';
import type { ChatSession } from '../types';
import { formatRelativeTime } from '../utils/time';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, PinIcon, PinSlashIcon } from './Icons';

interface HistoryItemProps {
    session: ChatSession;
    isActive: boolean;
    onSelect: (sessionId: string) => void;
    onDelete: (sessionId: string) => void;
    onRename: (sessionId: string, newTitle: string) => void;
    onTogglePin: (sessionId: string) => void;
    style?: React.CSSProperties;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
    session,
    isActive,
    onSelect,
    onDelete,
    onRename,
    onTogglePin,
    style
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(session.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleRename = () => {
        if (title.trim() && title.trim() !== session.title) {
            onRename(session.id, title.trim());
        } else {
            setTitle(session.title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRename();
        } else if (e.key === 'Escape') {
            setTitle(session.title);
            setIsEditing(false);
        }
    };

    const handleSelect = () => {
        if (!isEditing) {
            onSelect(session.id);
        }
    };

    return (
        <div
            style={style}
            onClick={handleSelect}
            className={`
                group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200
                ${isActive ? 'bg-gradient-to-r from-indigo-500/30 via-slate-800/20 to-transparent' : 'hover:bg-white/10'}
                animate-fade-in-slide-up
            `}
        >
            <div className="flex-grow min-w-0">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent text-sm font-medium text-white p-0 m-0 border-0 focus:ring-0"
                    />
                ) : (
                    <>
                        <p className="text-sm font-medium text-slate-200 truncate">{session.title}</p>
                        <p className="text-xs text-slate-400">{formatRelativeTime(session.createdAt)}</p>
                    </>
                )}
            </div>

            <div className="flex-shrink-0 flex items-center gap-1 pl-2">
                {isEditing ? (
                    <>
                        <button onClick={handleRename} className="p-1.5 text-slate-400 hover:text-green-400 rounded-full"><CheckIcon className="w-4 h-4" /></button>
                        <button onClick={() => setIsEditing(false)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-full"><XIcon className="w-4 h-4" /></button>
                    </>
                ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); onTogglePin(session.id); }} className={`p-1.5 rounded-full ${session.isPinned ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-400 hover:text-white'}`} title={session.isPinned ? 'Pin entfernen' : 'Anpinnen'}>
                            {session.isPinned ? <PinSlashIcon className="w-4 h-4" /> : <PinIcon className="w-4 h-4" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1.5 text-slate-400 hover:text-white rounded-full" title="Umbenennen"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(session.id); }} className="p-1.5 text-slate-400 hover:text-red-400 rounded-full" title="Löschen"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

const MemoizedHistoryItem = React.memo(HistoryItem);
export default MemoizedHistoryItem;