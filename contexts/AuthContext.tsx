import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedAuth = window.sessionStorage.getItem('isAuthenticated');
            if (storedAuth === 'true') {
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error("Fehler beim Zugriff auf sessionStorage:", e);
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (password: string) => {
        setIsLoading(true);
        setError(null);
        
        await new Promise(resolve => setTimeout(resolve, 500));

        // In einer Produktionsumgebung sollte dies immer über Umgebungsvariablen konfiguriert werden.
        // Für diese Entwicklungsumgebung wird ein Fallback-Passwort verwendet.
        const appPassword = process.env.APP_PASSWORD || '22102024';
        
        if (password === appPassword) {
            setIsAuthenticated(true);
            try {
                window.sessionStorage.setItem('isAuthenticated', 'true');
            } catch (e) {
                 console.error("Fehler beim Schreiben in sessionStorage:", e);
            }
        } else {
            setError('Ungültiges Passwort. Bitte versuchen Sie es erneut.');
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        try {
            window.sessionStorage.removeItem('isAuthenticated');
        } catch (e) {
             console.error("Fehler beim Entfernen aus sessionStorage:", e);
        }
    }, []);

    const value = { isAuthenticated, isLoading, error, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth muss innerhalb eines AuthProviders verwendet werden');
    }
    return context;
};