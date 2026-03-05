import { useState, useEffect, useCallback } from 'react';

const KIDS_MODE_KEY = 'bubinger-ai-kids-mode';

export const useKidsMode = () => {
    const [isKidsMode, setIsKidsMode] = useState(false);

    useEffect(() => {
        try {
            const storedState = window.localStorage.getItem(KIDS_MODE_KEY);
            setIsKidsMode(storedState ? JSON.parse(storedState) : false);
        } catch (error) {
            console.error("Fehler beim Lesen des Kids-Mode-Status aus dem localStorage", error);
            setIsKidsMode(false);
        }
    }, []);

    const toggleKidsMode = useCallback(() => {
        setIsKidsMode(prevState => {
            const newState = !prevState;
            try {
                window.localStorage.setItem(KIDS_MODE_KEY, JSON.stringify(newState));
                // Add/remove class from root for global styling
                document.documentElement.classList.toggle('kids-mode', newState);
            } catch (error) {
                 console.error("Fehler beim Speichern des Kids-Mode-Status im localStorage", error);
            }
            return newState;
        });
    }, []);

    return { isKidsMode, toggleKidsMode };
};
