import React, { useState, useEffect } from 'react';
import type { ModelConfig, Persona, AiModelId } from '../types';
import { XIcon, QuestionMarkCircleIcon, BookmarkIcon, TrashIcon, PencilIcon, CheckIcon, CogIcon } from './Icons';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from './ConfirmModal';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    modelConfig: ModelConfig;
    setModelConfig: (config: Partial<ModelConfig>) => void;
    personas: Persona[];
    addPersona: (name: string, instruction: string) => void;
    deletePersona: (id: string) => void;
    updatePersona: (id: string, updates: { name: string; instruction: string }) => void;
}

type Tab = 'general' | 'personas';


const ModelSettingSlider: React.FC<{
    label: string;
    tooltip: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}> = ({ label, tooltip, value, min, max, step, onChange }) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                    {label}
                    <span className="group relative ml-2">
                        <QuestionMarkCircleIcon className="w-5 h-5 text-slate-500" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 z-20 mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {tooltip}
                        </span>
                    </span>
                </label>
                <span className="text-sm font-mono text-slate-400">{value.toFixed(step < 1 ? 2 : 0)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
        </div>
    );
};

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, modelConfig, setModelConfig, personas, addPersona, deletePersona, updatePersona
}) => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [localConfig, setLocalConfig] = useState<ModelConfig>(modelConfig);
    
    const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
    const [editName, setEditName] = useState('');
    const [editInstruction, setEditInstruction] = useState('');
    const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);
    

    const availableModels: { id: AiModelId, name: string }[] = [
        { id: 'gemini-2.5-flash', name: 'Gemini Flash' }
    ];

    useEffect(() => {
        if (isOpen) {
            setLocalConfig(modelConfig);
            setActiveTab('general');
            setEditingPersona(null);
        }
    }, [isOpen, modelConfig]);

    if (!isOpen) return null;
    
    const handleSaveNewPersona = () => {
        if (!localConfig.systemInstruction.trim()) {
            addToast("Die System-Anweisung darf nicht leer sein, um sie zu speichern.", "error");
            return;
        }
        const name = window.prompt("Geben Sie einen Namen für die neue Persona ein:");
        if (name) {
            addPersona(name, localConfig.systemInstruction);
            addToast(`Persona "${name}" gespeichert!`, 'success');
        }
    }
    
    const selectedPersona = personas.find(p => p.instruction === localConfig.systemInstruction);

    const handleConfirmDeletePersona = () => {
        if (personaToDelete) {
            deletePersona(personaToDelete.id);
            addToast("Persona gelöscht.", "info");
            if (selectedPersona?.id === personaToDelete.id) {
                 setLocalConfig(prev => ({...prev, systemInstruction: personas.find(p => p.isDefault)?.instruction || ''}))
            }
        }
    };
    
    const handleStartEdit = (persona: Persona) => {
        setEditingPersona(persona);
        setEditName(persona.name);
        setEditInstruction(persona.instruction);
    };

    const handleCancelEdit = () => {
        setEditingPersona(null);
    };

    const handleSaveEdit = () => {
        if (editingPersona) {
            updatePersona(editingPersona.id, { name: editName, instruction: editInstruction });
            addToast(`Persona "${editName}" aktualisiert.`, 'success');
            setEditingPersona(null);
        }
    };

    const handleSaveAndClose = () => {
        setModelConfig(localConfig);
        addToast("Einstellungen gespeichert.", "success");
        onClose();
    };

    return (
        <>
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in-fast"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="glass-pane rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] m-4 transform transition-all flex flex-col animate-fade-in-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
               {/* Header */}
               <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-white">Einstellungen</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10 transition-colors" aria-label="Einstellungen schließen">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

               {/* Tabs */}
                <div className="flex-shrink-0 border-b border-white/10 px-4">
                    <nav className="flex space-x-4">
                       <button onClick={() => setActiveTab('general')} className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'general' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
                           <CogIcon className="w-5 h-5"/> Allgemein
                       </button>
                       <button onClick={() => setActiveTab('personas')} className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'personas' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
                           <BookmarkIcon className="w-5 h-5"/> Personas
                       </button>
                    </nav>
               </div>
               
               {/* Main Content */}
               <div className="p-6 space-y-6 flex-grow overflow-y-auto">
                 {activeTab === 'general' && (
                     <div className="space-y-6 animate-fade-in-fast">
                        <h3 className="text-md font-medium text-slate-200">Model-Einstellungen (für diesen Chat)</h3>
                        <div>
                            <label htmlFor="model-select" className="block text-sm font-medium text-slate-300 mb-1">KI-Modell</label>
                            <select id="model-select" className="w-full bg-slate-800/50 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" value={localConfig.model} onChange={(e) => setLocalConfig(prev => ({...prev, model: e.target.value as AiModelId }))}>
                                {availableModels.map(model => (<option key={model.id} value={model.id}>{model.name}</option>))}
                            </select>
                        </div>
                        <ModelSettingSlider label="Temperatur" tooltip="Steuert die Zufälligkeit. Niedrigere Werte machen die Antworten deterministischer, höhere Werte kreativer." value={localConfig.temperature} min={0} max={1} step={0.01} onChange={(val) => setLocalConfig(prev => ({...prev, temperature: val}))} />
                        <ModelSettingSlider label="Top-P" tooltip="Wählt aus den wahrscheinlichsten Wörtern, bis eine bestimmte Wahrscheinlichkeitsschwelle erreicht ist. Beeinflusst die Kreativität." value={localConfig.topP} min={0} max={1} step={0.01} onChange={(val) => setLocalConfig(prev => ({...prev, topP: val}))} />
                        <ModelSettingSlider label="Top-K" tooltip="Beschränkt die Auswahl der Wörter auf die K wahrscheinlichsten. Reduziert das Risiko von seltsamen Wörtern." value={localConfig.topK} min={1} max={100} step={1} onChange={(val) => setLocalConfig(prev => ({...prev, topK: val}))} />
                    </div>
                )}
                {activeTab === 'personas' && (
                    <div className="space-y-6 animate-fade-in-fast">
                         <h3 className="text-md font-medium text-slate-200">System-Anweisung / Personas</h3>
                         <div>
                            <label htmlFor="system-instruction" className="text-sm font-medium text-slate-300 flex items-center mb-1">
                                Aktuelle Anweisung für diesen Chat
                                <span className="group relative ml-2">
                                    <QuestionMarkCircleIcon className="w-5 h-5 text-slate-500" />
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 z-20 mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        Geben Sie der KI eine Persona oder spezifische Anweisungen, die sie während des gesamten Gesprächs befolgen soll.
                                    </span>
                                </span>
                            </label>
                            <textarea id="system-instruction" rows={3} value={localConfig.systemInstruction} onChange={(e) => setLocalConfig(prev => ({...prev, systemInstruction: e.target.value}))} className="w-full bg-slate-800/50 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" placeholder="z.B. Du bist ein Pirat und sprichst wie einer." />
                             <div className="flex items-center gap-2 mt-2">
                                <select id="persona-select" className="flex-grow bg-slate-800/50 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" value={selectedPersona?.id || ''} onChange={(e) => { const newSelectedPersona = personas.find(p => p.id === e.target.value); if (newSelectedPersona) { setLocalConfig(prev => ({...prev, systemInstruction: newSelectedPersona.instruction})); }}}>
                                    <option value="" disabled>Gespeicherte Persona auswählen...</option>
                                    {personas.map(p => (<option key={p.id} value={p.id}>{p.isDefault ? '🤖' : '👤'} {p.name}</option>))}
                                </select>
                                <button onClick={handleSaveNewPersona} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium" title="Aktuelle Anweisung als neue Persona speichern">
                                    <BookmarkIcon className="w-4 h-4" /> <span>Speichern</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Gespeicherte Personas verwalten</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto bg-slate-800/50 p-2 rounded-lg">
                                {personas.map(p => (
                                    editingPersona?.id === p.id ? (
                                        <div key={p.id} className="bg-slate-700 p-3 rounded-lg shadow-md border border-indigo-500/50 space-y-2">
                                            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full text-sm font-semibold p-2 rounded bg-slate-800/70 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Name der Persona"/>
                                            <textarea rows={3} value={editInstruction} onChange={e => setEditInstruction(e.target.value)} className="w-full text-xs p-2 rounded bg-slate-800/70 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Anweisung..."/>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={handleCancelEdit} className="px-3 py-1.5 text-xs rounded-md bg-slate-600 hover:bg-slate-500 transition-colors text-white">Abbrechen</button>
                                                <button onClick={handleSaveEdit} className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Speichern</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={p.id} className="group flex items-center justify-between p-2 rounded-md hover:bg-slate-700">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-200">{p.isDefault ? '🤖' : '👤'} {p.name}</p>
                                                <p className="text-xs text-slate-400 truncate max-w-sm">{p.instruction}</p>
                                            </div>
                                            {!p.isDefault && (
                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleStartEdit(p)} className="p-1.5 text-slate-400 hover:text-indigo-400"><PencilIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => setPersonaToDelete(p)} className="p-1.5 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                )}
               </div>

               <div className="flex items-center justify-end p-4 border-t border-white/10 bg-black/20 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-indigo-500">
                            Abbrechen
                        </button>
                        <button onClick={handleSaveAndClose} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-indigo-500">
                            Änderungen speichern
                        </button>
                    </div>
               </div>
            </div>
        </div>
        <ConfirmModal
            isOpen={!!personaToDelete}
            onClose={() => setPersonaToDelete(null)}
            onConfirm={handleConfirmDeletePersona}
            title="Persona löschen"
            message={<>Möchten Sie die Persona "<strong>{personaToDelete?.name}</strong>" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</>}
        />
        </>
    );
};

export default SettingsModal;
