import { useState, useEffect, useCallback } from 'react';
import type { Persona } from '../types';

const PERSONAS_KEY = 'gemini-chat-personas';

const defaultPersonas: Persona[] = [
    { id: 'default-1', name: 'Hilfreicher Assistent', instruction: 'Sie sind ein hilfreicher und freundlicher deutscher KI-Assistent. Antworten Sie immer auf Deutsch.', isDefault: true },
    { id: 'bubi-kids-mode', name: 'Bubi der KI-Freund', instruction: 'Du bist Bubi, ein freundlicher, geduldiger und fröhlicher KI-freund für ein Kleinkind. Verwende eine sehr einfache Sprache, kurze Sätze und einen positiven, ermutigenden Ton. Antworte immer auf Deutsch. Erzähle Geschichten, singe einfache Lieder und beantworte Fragen so, wie es ein 3-5-jähriges Kind verstehen kann. Benutze oft Emojis, um deine Antworten lustiger und ansprechender zu gestalten. 🧸🎈⭐️', isDefault: true, isKids: true },
    { id: 'default-2', name: 'Kreativer Schreiber', instruction: 'Du bist ein kreativer Autor. Deine Aufgabe ist es, fesselnde und fantasievolle Geschichten, Gedichte oder Texte zu schreiben.', isDefault: true },
    { id: 'default-3', name: 'Technischer Experte', instruction: 'Sie sind ein technischer Experte. Erklären Sie komplexe technische Konzepte klar, präzise und strukturiert.', isDefault: true },
    { id: 'default-4', name: 'Skeptischer Kritiker', instruction: 'Du bist ein skeptischer Kritiker. Deine Aufgabe ist es, potenzielle Schwächen, Risiken und alternative Standpunkte in einer Idee oder einem Vorschlag zu identifizieren. Sei konstruktiv, aber unnachgiebig in deiner Analyse.', isDefault: true },
];

export const usePersonas = () => {
    const [personas, setPersonas] = useState<Persona[]>(defaultPersonas);

    useEffect(() => {
        try {
            const savedPersonas = window.localStorage.getItem(PERSONAS_KEY);
            
            if (savedPersonas) {
                const customPersonas: Persona[] = JSON.parse(savedPersonas);
                setPersonas([...defaultPersonas, ...customPersonas]);
            }
        } catch (error) {
            console.error("Fehler beim Laden von Personas:", error);
            setPersonas(defaultPersonas);
        }
    }, []);

    const saveCustomPersonas = (customPersonas: Persona[]) => {
        try {
            window.localStorage.setItem(PERSONAS_KEY, JSON.stringify(customPersonas));
        } catch (error) {
            console.error("Fehler beim Speichern der Personas:", error);
        }
    };

    const addPersona = useCallback((name: string, instruction: string) => {
        setPersonas(prev => {
            const newPersona: Persona = {
                id: crypto.randomUUID(),
                name,
                instruction,
            };
            const newPersonas = [...prev, newPersona];
            saveCustomPersonas(newPersonas.filter(p => !p.isDefault));
            return newPersonas;
        });
    }, []);

    const deletePersona = useCallback((personaId: string) => {
        setPersonas(prev => {
            const personaToDelete = prev.find(p => p.id === personaId);
            if (!personaToDelete || personaToDelete.isDefault) {
                return prev; // Default-Personas können nicht gelöscht werden
            }
            const newPersonas = prev.filter(p => p.id !== personaId);
            saveCustomPersonas(newPersonas.filter(p => !p.isDefault));
            
            return newPersonas;
        });
    }, []);

    const updatePersona = useCallback((id: string, updates: { name: string, instruction: string }) => {
        setPersonas(prev => {
            const newPersonas = prev.map(p => {
                if (p.id === id && !p.isDefault) {
                    return { ...p, ...updates };
                }
                return p;
            });
            saveCustomPersonas(newPersonas.filter(p => !p.isDefault));
            return newPersonas;
        });
    }, []);
    
    return { personas, addPersona, deletePersona, updatePersona };
};
