
import React, { useState, useMemo } from 'react';
import type { ChatMessageFile } from '../types';
import { DocumentTextIcon, ChevronDownIcon } from './Icons';
import { decodeDataUrlAsText, isCodeFileName } from '../utils/files';
import { CodeBlock } from './CodeBlock';

interface FileDisplayProps {
    file: ChatMessageFile;
    isUserMessage: boolean;
}

const FileDisplay: React.FC<FileDisplayProps> = ({ file, isUserMessage }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const isImage = file.type.startsWith('image/');
    const isCodeFile = useMemo(() => isCodeFileName(file.name), [file.name]);
    const isTextFile = file.type.startsWith('text/') || isCodeFile;
    
    const content = useMemo(() => {
        if (isExpanded && isTextFile) {
            return decodeDataUrlAsText(file.dataUrl);
        }
        return null;
    }, [file.dataUrl, isTextFile, isExpanded]);
    
    const bgColor = isUserMessage ? 'bg-indigo-500/20' : 'bg-slate-100 dark:bg-slate-700/50';

    if (isImage) {
        return (
            <div className={`${bgColor} rounded-lg overflow-hidden flex justify-center`}>
                <img src={file.dataUrl} alt={file.name} className="max-w-full h-auto max-h-80 object-contain" />
            </div>
        );
    }

    if (isTextFile) {
        return (
            <div className={`${bgColor} rounded-lg overflow-hidden`}>
                <button 
                    className="w-full flex items-center justify-between p-3 text-left"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-expanded={isExpanded}
                    aria-controls={`file-content-${file.name}`}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <DocumentTextIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                    </div>
                    <div className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </button>
                {isExpanded && (
                    <div id={`file-content-${file.name}`} className="px-3 pb-3 border-t border-black/10 dark:border-white/10">
                        {isCodeFile ? (
                           <CodeBlock>{content}</CodeBlock>
                        ) : (
                           <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words max-h-60 overflow-y-auto bg-slate-200/50 dark:bg-slate-800/50 p-2 rounded-md">
                               {content}
                           </pre>
                        )}
                    </div>
                )}
            </div>
        );
    }
    
    // Fallback for other file types
    return (
        <div className={`${bgColor} rounded-lg p-3 flex items-center gap-2`}>
            <DocumentTextIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
        </div>
    );
};

export default FileDisplay;
