
import { useState, useEffect } from 'react';

/**
 * Ein benutzerdefinierter Hook, der einen Wert verzögert.
 * Nützlich, um die Anzahl der Ausführungen einer teuren Operation (z.B. API-Aufrufe, Suchen) zu reduzieren.
 * @param value Der Wert, der verzögert werden soll.
 * @param delay Die Verzögerungszeit in Millisekunden.
 * @returns Der verzögerte Wert.
 */
export const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Richte einen Timer ein, um den verzögerten Wert nach der angegebenen Verzögerung zu aktualisieren
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Bereinige den Timer, wenn der Wert sich ändert oder die Komponente unmontiert wird
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};
