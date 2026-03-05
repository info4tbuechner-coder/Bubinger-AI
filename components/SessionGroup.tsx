import React, { useState } from 'react';
import type { ChatSession } from '../types';
import MemoizedHistoryItem from './HistoryItem';
import ConfirmModal from './ConfirmModal';

interface SessionGroupProps {
    title: string;
    sessions: ChatSession[];
    activeSessionId: string;
    isPinnedGroup?: boolean;
    onSwitchSession: (sessionId: string) => void;
    onDeleteSession: (sessionId: string) => void;
    onRenameSession: (sessionId: string, newTitle: string) => void;
    onTogglePinSession: (sessionId: string) => void;
}

const SessionGroup: React.FC<SessionGroupProps> = ({
    title,
    sessions,
    activeSessionId,
    isPinnedGroup = false,
    onSwitchSession,
    onDeleteSession,
    onRenameSession,
    onTogglePinSession,
}) => {
    const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);

    if (sessions.length === 0) return null;
    
    const handleConfirmDelete = () => {
        if (sessionToDelete) {
            onDeleteSession(sessionToDelete.id);
        }
    };

    return (
        <div>
            <h4 className={`sticky top-0 bg-slate-800/80 backdrop-blur-sm px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider ${isPinnedGroup ? 'text-indigo-400' : 'text-slate-400'} z-10 border-b-2 border-white/10`}>
                {title}
            </h4>
            <div className="space-y-1 mt-1">
                {sessions.map((session, index) => (
                    <MemoizedHistoryItem
                        key={session.id}
                        session={session}
                        isActive={session.id === activeSessionId}
                        onSelect={onSwitchSession}
                        onDelete={() => setSessionToDelete(session)}
                        onRename={onRenameSession}
                        onTogglePin={onTogglePinSession}
                        style={{ animationDelay: `${index * 30}ms` }}
                    />
                ))}
            </div>
            <ConfirmModal
                isOpen={!!sessionToDelete}
                onClose={() => setSessionToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Chat löschen"
                message={<>Möchten Sie den Chat "<strong>{sessionToDelete?.title}</strong>" wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.</>}
            />
        </div>
    );
};

export default React.memo(SessionGroup);
