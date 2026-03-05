
import React from 'react';
import { useToast } from '../contexts/ToastContext';
import { CopyIcon } from './Icons';

// FIX: Make children optional and handle null/undefined cases.

// FIX: Change component definition to use React.FC to allow the special 'key' prop.
interface CodeBlockProps {
    className?: string;
    children?: React.ReactNode;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ className, children }) => {
    const { addToast } = useToast();

    if (children === null || children === undefined) {
        return null;
    }

    const textToCopy = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            addToast("Code-Block kopiert!", "success");
        }).catch(() => {
            addToast("Kopieren fehlgeschlagen.", "error");
        });
    };

    return (
        <div className="relative group/code my-2 text-left">
            <div className="absolute top-1 right-1 flex items-center p-1 opacity-0 group-hover/code:opacity-100 transition-opacity duration-200 z-10">
                <button
                    onClick={handleCopy}
                    className="p-1.5 bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300"
                    aria-label="Code kopieren"
                >
                    <CopyIcon className="w-5 h-5" />
                </button>
            </div>
            <pre className="bg-slate-100 dark:bg-black/50 rounded-md p-4 pt-5 overflow-x-auto text-sm">
                <code className={`text-slate-800 dark:text-white ${className || ''}`}>
                    {children}
                </code>
            </pre>
        </div>
    );
};
