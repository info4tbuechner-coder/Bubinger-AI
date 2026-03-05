
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

export const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
    const { addToast } = useToast();

    const speak = useCallback((text: string, id: string) => {
        if (!window.speechSynthesis) {
            console.error("Text-to-Speech wird von diesem Browser nicht unterstützt.");
            addToast("Ihr Browser unterstützt leider keine Sprachausgabe.", "error");
            return;
        }
        // Bricht laufende Sprachausgabe ab
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        utterance.onstart = () => {
            setIsSpeaking(true);
            setCurrentlySpeakingId(id);
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentlySpeakingId(null);
        };
        utterance.onerror = (event) => {
            setIsSpeaking(false);
            setCurrentlySpeakingId(null);
            console.error("Ein Fehler ist bei der Sprachsynthese aufgetreten:", event.error);
            addToast("Fehler bei der Sprachausgabe.", "error");
        };
        window.speechSynthesis.speak(utterance);
    }, [addToast]);

    const cancel = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentlySpeakingId(null);
        }
    }, []);

    // Bereinigt bei unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return { speak, cancel, isSpeaking, currentlySpeakingId };
};
