
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ToastMessage, ToastType } from '../types';

interface ToastContextType {
    toasts: ToastMessage[];
    addToast: (message: string, type: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = crypto.randomUUID();
        const newToast: ToastMessage = { id, message, type };
        
        setToasts(currentToasts => [newToast, ...currentToasts]);

        setTimeout(() => {
            removeToast(id);
        }, 5000); // Toast wird nach 5 Sekunden automatisch entfernt
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast muss innerhalb eines ToastProviders verwendet werden');
    }
    return context;
};
