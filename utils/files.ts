
const CODE_EXTENSIONS = [
    'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go',
    'php', 'rb', 'rs', 'swift', 'kt', 'kts', 'html', 'css', 'scss',
    'less', 'json', 'xml', 'yaml', 'yml', 'md', 'sh', 'bash', 'sql'
];

/**
 * Checks if a filename corresponds to a common code file extension.
 * @param fileName The name of the file.
 * @returns True if it's likely a code file, false otherwise.
 */
export const isCodeFileName = (fileName: string): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? CODE_EXTENSIONS.includes(extension) : false;
};

/**
 * Safely decodes a base64 data URL into a UTF-8 string.
 * @param dataUrl The data URL string.
 * @returns The decoded text content or an error message if decoding fails.
 */
export const decodeDataUrlAsText = (dataUrl: string): string => {
    try {
        const base64 = dataUrl.split(',')[1];
        if (!base64) return '';
        
        // Use a robust method to decode base64 that handles UTF-8 characters correctly.
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);

    } catch (error) {
        console.error("Fehler beim Dekodieren der Data URL:", error);
        return "Fehler: Dateiinhalt konnte nicht dekodiert werden.";
    }
};
