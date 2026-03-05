

import React, { useState, useMemo } from 'react';
import type { ChatSession, DashboardStats } from '../types';
import StatCard from './StatCard';
import { MessageIcon, UserIcon, RobotIcon, SearchIcon, XIcon, ArchiveBoxXMarkIcon } from './Icons';
import { groupSessionsByDate } from '../utils/time';
import SessionGroup from './SessionGroup';

interface DashboardPanelProps {
  stats: DashboardStats;
  sessions: ChatSession[];
  activeSessionId: string;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onToggleSidebar: () => void;
  onTogglePinSession: (sessionId: string) => void;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ 
  stats, sessions, activeSessionId, onSwitchSession, onDeleteSession, onRenameSession, onToggleSidebar, onTogglePinSession
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = useMemo(() => {
    return sessions.filter(session =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sessions, searchTerm]);
  
  const pinnedSessions = useMemo(() => {
    return filteredSessions.filter(s => s.isPinned).sort((a, b) => b.createdAt - a.createdAt);
  }, [filteredSessions]);

  const unpinnedSessions = useMemo(() => {
    return filteredSessions.filter(s => !s.isPinned).sort((a, b) => b.createdAt - a.createdAt);
  }, [filteredSessions]);

  const groupedSessions = useMemo(() => groupSessionsByDate(unpinnedSessions), [unpinnedSessions]);
  const groupOrder = ['Heute', 'Gestern', 'Letzte 7 Tage', 'Älter'];

  return (
    <div className="glass-pane lg:rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl font-bold text-white">Dashboard</h2>
        <button onClick={onToggleSidebar} className="lg:hidden p-2 text-slate-400">
           <XIcon className="w-6 h-6" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-shrink-0">
        <StatCard title="Nachrichten" value={stats.messageCount} icon={<MessageIcon />} />
        <StatCard title="Von Ihnen" value={stats.userMessages} icon={<UserIcon />} />
        <StatCard title="Von KI" value={stats.modelMessages} icon={<RobotIcon />} />
      </div>

      <div className="flex flex-col min-h-0 space-y-4 flex-grow">
          <div className="flex-grow flex flex-col min-h-0">
            <h3 className="text-lg font-semibold text-white mb-2">Verlauf</h3>
            <div className="relative mb-2 flex-shrink-0">
              <input
                type="text"
                placeholder="Chats durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/20 text-slate-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-sm"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-2 flex-grow overflow-y-auto">
              {filteredSessions.length > 0 ? (
                  <>
                    <SessionGroup
                        title="Gepinnt"
                        sessions={pinnedSessions}
                        isPinnedGroup
                        activeSessionId={activeSessionId}
                        onSwitchSession={onSwitchSession}
                        onDeleteSession={onDeleteSession}
                        onRenameSession={onRenameSession}
                        onTogglePinSession={onTogglePinSession}
                    />
                    {groupOrder.map(groupName => (
                        <SessionGroup
                            key={groupName}
                            title={groupName}
                            sessions={groupedSessions[groupName]}
                            activeSessionId={activeSessionId}
                            onSwitchSession={onSwitchSession}
                            onDeleteSession={onDeleteSession}
                            onRenameSession={onRenameSession}
                            onTogglePinSession={onTogglePinSession}
                        />
                    ))}
                  </>
              ) : (
                <div className="text-center text-sm text-slate-400 p-4 flex flex-col items-center justify-center h-full gap-2">
                  <ArchiveBoxXMarkIcon className="w-10 h-10 text-slate-400" />
                  <span>Keine Chats gefunden.</span>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardPanel;