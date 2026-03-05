import { useState, useEffect, useCallback } from 'react';

const AUTO_PLAYBACK_KEY = 'bubinger-ai-auto-playback';

export const useAutoPlayback = () => {
    const [isAutoPlaybackEnabled, setIsAutoPlaybackEnabled] = useState(false);

    useEffect(() => {
        try {
            const storedState = window.localStorage.getItem(AUTO_PLAYBACK_KEY);
            // Standardmäßig deaktiviert, wenn kein Wert gespeichert ist.
            setIsAutoPlaybackEnabled(storedState ? JSON.parse(storedState) : false);
        } catch (error) {
            console.error("Fehler beim Lesen des Auto-Playback-Status aus dem localStorage", error);
            setIsAutoPlaybackEnabled(false);
        }
    }, []);

    const toggleAutoPlayback = useCallback(() => {
        setIsAutoPlaybackEnabled(prevState => {
            const newState = !prevState;
            try {
                window.localStorage.setItem(AUTO_PLAYBACK_KEY, JSON.stringify(newState));
            } catch (error) {
                 console.error("Fehler beim Speichern des Auto-Playback-Status im localStorage", error);
            }
            return newState;
        });
    }, []);

    return { isAutoPlaybackEnabled, toggleAutoPlayback };
};
