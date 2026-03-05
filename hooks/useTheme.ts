
import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';
const THEME_KEY = 'app-theme';

export const useTheme = () => {
    const [theme, setThemeState] = useState<Theme>('system');

    const applyTheme = useCallback((selectedTheme: Theme) => {
        const root = window.document.documentElement;
        
        const isDark = 
            selectedTheme === 'dark' || 
            (selectedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.toggle('dark', isDark);
    }, []);

    useEffect(() => {
        const storedTheme = window.localStorage.getItem(THEME_KEY) as Theme | null;
        const initialTheme = storedTheme || 'system';
        setThemeState(initialTheme);
        applyTheme(initialTheme);
    }, [applyTheme]);
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = () => {
            // Re-apply theme only if the user has 'system' selected
            if (window.localStorage.getItem(THEME_KEY) === 'system' || !window.localStorage.getItem(THEME_KEY)) {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [applyTheme]);

    const setTheme = (newTheme: Theme) => {
        window.localStorage.setItem(THEME_KEY, newTheme);
        setThemeState(newTheme);
        applyTheme(newTheme);
    };

    return { theme, setTheme };
};
