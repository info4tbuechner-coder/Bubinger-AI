
import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_STATE_KEY = 'gemini-sidebar-open';

export const useSidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        try {
            const storedState = window.localStorage.getItem(SIDEBAR_STATE_KEY);
            // Standardmäßig auf "offen" (true) setzen, wenn kein Wert gespeichert ist.
            setIsSidebarOpen(storedState ? JSON.parse(storedState) : true);
        } catch (error) {
            console.error("Fehler beim Lesen des Seitenleisten-Status aus dem localStorage", error);
            setIsSidebarOpen(true);
        }
    }, []);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prevState => {
            const newState = !prevState;
            try {
                window.localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(newState));
            } catch (error) {
                 console.error("Fehler beim Speichern des Seitenleisten-Status im localStorage", error);
            }
            return newState;
        });
    }, []);

    return { isSidebarOpen, toggleSidebar };
};
