
import React from 'react';
import { RobotIcon } from './Icons';

interface PromptSuggestionsProps {
    onSuggestionClick: (suggestion: string) => void;
    isKidsMode: boolean;
}

const suggestions = [
    "Erzähl mir einen Witz",
    "Erkläre Quantencomputing einfach",
    "Schreibe ein kurzes Gedicht über den Herbst",
    "Was ist die beste Reisezeit für Japan?",
];

const kidsSuggestions = [
    "Erzähl mir eine Tiergeschichte 🧸",
    "Was ist meine Lieblingsfarbe?",
    "Singe ein Lied über die Sonne ☀️",
    "Male mir einen lila Elefanten",
]

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSuggestionClick, isKidsMode }) => {
    
    const currentSuggestions = isKidsMode ? kidsSuggestions : suggestions;

    return (
        <div className="text-center py-10 animate-fade-in flex flex-col items-center justify-center h-full">
            <div className={`bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-4 mb-4 shadow-lg ${isKidsMode ? 'transform scale-125' : ''}`}>
               <RobotIcon className={`text-white ${isKidsMode ? 'w-20 h-20' : 'w-16 h-16'}`} />
            </div>
            {isKidsMode ? (
                <>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                       Hallo, ich bin Bubi!
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">Wollen wir zusammen spielen?</p>
                </>
            ) : (
                <>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Bubinger-AI
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Womit können wir heute beginnen?</p>
                </>
            )}
            <div className="flex flex-wrap justify-center items-center gap-3 max-w-lg">
                {currentSuggestions.map((text) => (
                    <button
                        key={text}
                        onClick={() => onSuggestionClick(text)}
                        className={`transition-all transform hover:scale-105 ${isKidsMode ? 'px-5 py-3 rounded-xl bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600/80 text-slate-700 dark:text-slate-200 text-base font-medium' : 'px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600/80 text-slate-700 dark:text-slate-200 text-sm'}`}
                    >
                        {text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PromptSuggestions;