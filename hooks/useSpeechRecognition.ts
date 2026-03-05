import { useState, useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';

// Type definitions for the Web Speech API which are not standard in all TypeScript environments.
interface SpeechRecognitionResult {
    isFinal: boolean;
    [key: number]: SpeechRecognitionAlternative;
    length: number;
}
  
interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}
  
interface SpeechRecognitionResultList {
    [key: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any;
    onend: (this: SpeechRecognition, ev: Event) => any;
    onerror: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any;
    start: () => void;
    stop: () => void;
}

declare global {
    interface Window {
      SpeechRecognition: new () => SpeechRecognition;
      webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

export const useSpeechRecognition = () => {
    const { addToast } = useToast();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [command, setCommand] = useState<{ text: string, id: number } | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isListeningRef = useRef(isListening);
    isListeningRef.current = isListening;

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Die Web Speech API wird von diesem Browser nicht unterstützt.");
            return;
        }
        
        const recognition: SpeechRecognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'de-DE';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setTranscript(prev => prev + finalTranscript); // Für Diktate
                setCommand({ text: finalTranscript.trim(), id: Date.now() }); // Für Befehle
            }
        };

        recognition.onend = () => {
            if (isListeningRef.current) {
              // Startet die Erkennung neu, falls sie unerwartet gestoppt wurde
              recognition.start();
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Fehler bei der Spracherkennung:', event.error);
            if (event.error === 'not-allowed') {
                addToast("Mikrofonzugriff verweigert. Bitte in den Browsereinstellungen erlauben.", "error");
            } else if (event.error === 'no-speech') {
                // Dies kann oft ausgelöst werden, wenn der Benutzer aufhört zu sprechen, also kein Toast anzeigen.
            } else {
                addToast(`Fehler bei der Spracherkennung: ${event.error}`, "error");
            }
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            isListeningRef.current = false;
            recognition.stop();
        };
    }, [addToast]);

    const startListening = () => {
        if (!recognitionRef.current) {
            addToast("Die Spracherkennung wird von Ihrem Browser nicht unterstützt.", "error");
            return;
        }
        if (!isListening) {
            setTranscript('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };
    
    return {
        isListening,
        transcript,
        command,
        startListening,
        stopListening,
    };
};