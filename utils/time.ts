import type { ChatSession } from '../types';

/**
 * Formatiert einen Unix-Zeitstempel in eine benutzerfreundliche, relative Zeitangabe.
 * @param timestamp Der Zeitstempel in Millisekunden.
 * @returns Ein String wie "vor 5 Minuten", "gestern" oder ein vollständiges Datum.
 */
export const formatRelativeTime = (timestamp: number): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat('de', { numeric: 'auto' });

    if (diffSeconds < 60) {
        return "gerade eben";
    }
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) {
        return rtf.format(-diffMinutes, 'minute');
    }
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
        return rtf.format(-diffHours, 'hour');
    }
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) {
        return rtf.format(-diffDays, 'day');
    }
    
    // Wenn es länger als eine Woche her ist, zeige das Datum an
    return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Gruppiert Chat-Sitzungen nach Datumskategorien.
 * @param sessions Eine Liste von Chat-Sitzungen.
 * @returns Ein Objekt mit Sitzungen, gruppiert nach 'Heute', 'Gestern', etc.
 */
export const groupSessionsByDate = (sessions: ChatSession[]): Record<string, ChatSession[]> => {
    const groups: Record<string, ChatSession[]> = {
        'Heute': [],
        'Gestern': [],
        'Letzte 7 Tage': [],
        'Älter': [],
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    sessions.forEach(session => {
        const sessionDate = new Date(session.createdAt);
        if (sessionDate >= today) {
            groups['Heute'].push(session);
        } else if (sessionDate >= yesterday) {
            groups['Gestern'].push(session);
        } else if (sessionDate >= sevenDaysAgo) {
            groups['Letzte 7 Tage'].push(session);
        } else {
            groups['Älter'].push(session);
        }
    });

    return groups;
};