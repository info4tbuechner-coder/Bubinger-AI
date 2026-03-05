import React, { useState, useCallback } from 'react';
import { getAiService } from '../services/aiService';
import { useToast } from '../contexts/ToastContext';
import { PhotoIcon, SparklesIcon, XCircleIcon, ArrowDownTrayIcon } from './Icons';

const ImageGenerationPanel: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();
    const aiService = getAiService('gemini-2.5-flash');

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            addToast("Bitte geben Sie einen Prompt ein.", "info");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            const images = await aiService.generateImages(prompt);
            if (images && images.length > 0) {
                setGeneratedImages(images);
                addToast("Bilder erfolgreich generiert!", "success");
            } else {
                setError("Die KI konnte für diesen Prompt keine Bilder generieren. Versuchen Sie es anders.");
                 addToast("Keine Bilder generiert.", "info");
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Ein unbekannter Fehler ist aufgetreten.";
            setError(errorMessage);
            addToast(`Fehler bei der Bildgenerierung: ${errorMessage}`, "error");
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aiService, addToast]);

    const handleDownload = (base64Image: string, index: number) => {
        const link = document.createElement('a');
        link.href = `data:image/jpeg;base64,${base64Image}`;
        const sanitizedPrompt = prompt.slice(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `bubinger-ai-${sanitizedPrompt}-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="glass-pane rounded-2xl shadow-2xl flex flex-col h-full max-h-[calc(100vh-8rem)]">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <PhotoIcon className="w-6 h-6 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">Bildgenerierung</h2>
            </div>
            
            <div className="flex-grow p-4 md:p-6 overflow-y-auto flex flex-col gap-6">
                {/* Input Section */}
                <div className="flex-shrink-0">
                    <div className="bg-slate-800/50 rounded-xl transition-all border border-transparent focus-within:focus-glow p-2">
                         <textarea
                            rows={3}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Beschreiben Sie das Bild, das Sie erstellen möchten... z.B. 'Ein Astronaut, der auf einem Oktopus im Weltraum reitet, im Stil von Van Gogh'"
                            className="w-full bg-transparent text-slate-200 rounded-lg p-2 focus:outline-none text-sm resize-none"
                            disabled={isLoading}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !prompt.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                <span>{isLoading ? 'Generiere...' : 'Generieren'}</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Display Section */}
                <div className="flex-grow flex items-center justify-center rounded-lg bg-black/20 min-h-[300px]">
                    {isLoading ? (
                        <div className="text-center text-slate-400 flex flex-col items-center gap-4 animate-fade-in">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse opacity-20"></div>
                                <PhotoIcon className="w-16 h-16 text-slate-500" />
                            </div>
                            <p className="font-medium text-white">Ihre Vision wird Realität...</p>
                            <p className="text-sm max-w-sm">Dies kann einen Moment dauern. Die KI verwandelt Ihre Ideen gerade in Pixel.</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 flex flex-col items-center gap-2 animate-fade-in p-4">
                            <XCircleIcon className="w-12 h-12" />
                            <p className="font-semibold text-white">Fehler bei der Generierung</p>
                            <p className="text-sm max-w-md">{error}</p>
                        </div>
                    ) : generatedImages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 animate-fade-in w-full h-full">
                            {generatedImages.map((img, index) => (
                                <div key={index} className="group relative rounded-lg overflow-hidden shadow-lg aspect-square">
                                    <img src={`data:image/jpeg;base64,${img}`} alt={`Generiertes Bild ${index + 1}`} className="w-full h-full object-cover" />
                                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => handleDownload(img, index)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-colors"
                                        >
                                            <ArrowDownTrayIcon className="w-5 h-5"/>
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-slate-400 flex flex-col items-center gap-4 p-4">
                            <div className="relative">
                                <PhotoIcon className="w-20 h-20 text-slate-600" />
                                <div 
                                    className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"
                                    style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                                >
                                    <SparklesIcon className="w-full h-full p-1.5 text-white"/>
                                </div>
                            </div>
                            <p className="font-medium text-white text-lg">Starten Sie Ihre kreative Reise</p>
                            <p className="text-sm max-w-sm">Beschreiben Sie eine Szene, eine Idee oder einen Traum im Textfeld oben, und die KI wird sie zum Leben erwecken.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageGenerationPanel;