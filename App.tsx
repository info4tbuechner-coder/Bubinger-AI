import React, { useState, useEffect, useMemo } from 'react';
import ChatPanel from './components/ChatPanel';
import DashboardPanel from './components/DashboardPanel';
import { Header } from './components/Header';
import ChatPanelSkeleton from './components/skeletons/ChatPanelSkeleton';
import DashboardSkeleton from './components/skeletons/DashboardSkeleton';
import SettingsModal from './components/SettingsModal';
import ToastContainer from './components/ToastContainer';
import { useSidebar } from './hooks/useSidebar';
import { useChatManager } from './hooks/useChatManager';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import { RobotIcon } from './components/Icons';
import { usePersonas } from './hooks/usePersonas';
import { useKidsMode } from './hooks/useKidsMode';
import type { AppMode } from './types';
import ImageGenerationPanel from './components/ImageGenerationPanel';

const App: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RobotIcon className="w-16 h-16 text-indigo-500 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <ChatApplication />;
};

const ChatApplication: React.FC = () => {
  const { logout } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isKidsMode, toggleKidsMode } = useKidsMode();
  const { personas, addPersona, deletePersona, updatePersona } = usePersonas();
  const [appMode, setAppMode] = useState<AppMode>('chat');

  const kidsPersona = useMemo(() => personas.find(p => p.isKids), [personas]);
  const defaultPersona = useMemo(() => personas.find(p => p.id === 'default-1'), [personas]);
  
  const {
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
  } = useChatManager(personas);

  
  // Switch persona when kids mode changes
  useEffect(() => {
    if (activeSession) {
        const targetInstruction = isKidsMode ? kidsPersona?.instruction : defaultPersona?.instruction;
        if (targetInstruction && activeSession.config.systemInstruction !== targetInstruction) {
            updateActiveSessionConfig({ systemInstruction: targetInstruction });
        }
    }
  }, [isKidsMode, activeSession, kidsPersona, defaultPersona, updateActiveSessionConfig]);

  const handleOpenSettings = () => setIsSettingsOpen(true);
  const handleCloseSettings = () => setIsSettingsOpen(false);
  
  const handleCreateSession = () => {
      const personaToUse = isKidsMode ? kidsPersona : defaultPersona;
      if (personaToUse) {
          createSession(personaToUse);
      }
  }

  if (isLoading || !activeSession) {
    return (
      <div className="h-screen flex flex-col animate-fade-in-slide-up">
        <Header 
          onNewChat={() => {}}
          onOpenSettings={handleOpenSettings} 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          isAutoPlaybackEnabled={false}
          onToggleAutoPlayback={() => {}}
          isKidsMode={isKidsMode}
          onToggleKidsMode={toggleKidsMode}
          appMode={appMode}
          setAppMode={setAppMode}
          onLogout={logout}
        />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
          <div className="flex-grow flex flex-col min-w-0 h-full">
            <ChatPanelSkeleton />
          </div>
          <aside className="hidden lg:block lg:w-2/5 xl:w-1/3 h-full flex-shrink-0">
            <DashboardSkeleton />
          </aside>
        </main>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="h-screen flex flex-col animate-fade-in-slide-up">
        <Header 
          onNewChat={handleCreateSession}
          onOpenSettings={handleOpenSettings} 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          isAutoPlaybackEnabled={isAutoPlaybackEnabled}
          onToggleAutoPlayback={toggleAutoPlayback}
          isKidsMode={isKidsMode}
          onToggleKidsMode={toggleKidsMode}
          appMode={appMode}
          setAppMode={setAppMode}
          onLogout={logout}
        />
        <main className={`flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex overflow-hidden gap-6`}>
          {/* Main Panel */}
          <div className="flex-grow flex flex-col min-w-0 h-full">
            {appMode === 'chat' ? (
                <ChatPanel
                  key={activeSession.id}
                  session={activeSession}
                  isLoading={isLoading || isStreaming}
                  isStreaming={isStreaming}
                  onSendMessage={handleSendMessage}
                  onStopGeneration={handleStopGeneration}
                  onRegenerateResponse={handleRegenerateResponse}
                  speak={speak}
                  cancel={cancel}
                  isSpeaking={isSpeaking}
                  currentlySpeakingId={currentlySpeakingId}
                  onToggleMessagePin={toggleMessagePin}
                  onClearChat={clearChatMessages}
                  onExportChat={() => handleExportChat(activeSession.id)}
                  isKidsMode={isKidsMode}
                  onToggleWebSearch={toggleWebSearch}
                />
            ) : (
                <ImageGenerationPanel />
            )}
          </div>

          {/* Backdrop for mobile */}
          {isSidebarOpen && !isKidsMode && appMode === 'chat' && (
            <div 
              onClick={toggleSidebar} 
              className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fade-in-fast"
            ></div>
          )}

          {/* Sidebar */}
          {!isKidsMode && appMode === 'chat' && (
            <aside className={`
                flex-shrink-0 transition-all duration-300 ease-in-out
                fixed inset-y-0 right-0 z-40 w-full max-w-md lg:static lg:max-w-none lg:z-auto
                ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                lg:w-2/5 xl:w-1/3 lg:translate-x-0 
            `}>
                <div className={`h-full overflow-hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                    <DashboardPanel 
                    stats={stats} 
                    sessions={sessions}
                    activeSessionId={activeSession.id}
                    onSwitchSession={switchSession}
                    onDeleteSession={deleteSession}
                    onRenameSession={updateSessionTitle}
                    onToggleSidebar={toggleSidebar}
                    onTogglePinSession={togglePinSession}
                    />
                </div>
            </aside>
          )}
        </main>
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={handleCloseSettings} 
        modelConfig={activeSession.config}
        setModelConfig={updateActiveSessionConfig}
        personas={personas}
        addPersona={addPersona}
        deletePersona={deletePersona}
        updatePersona={updatePersona}
      />
    </>
  );
};

export default App;