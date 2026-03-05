
import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../types';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XIcon } from './Icons';

interface ToastProps {
    toast: ToastMessage;
    onRemove: (id: string) => void;
}

const toastIcons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    error: <ExclamationCircleIcon className="w-6 h-6 text-red-500" />,
    info: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
};

const toastStyles = {
    success: 'bg-green-50 dark:bg-green-900/50 border-green-400 dark:border-green-600',
    error: 'bg-red-50 dark:bg-red-900/50 border-red-400 dark:border-red-600',
    info: 'bg-blue-50 dark:bg-blue-900/50 border-blue-400 dark:border-blue-600',
};

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleRemove = () => {
        setIsExiting(true);
    };

    useEffect(() => {
        if (isExiting) {
            const timer = setTimeout(() => {
                onRemove(toast.id);
            }, 300); // Entspricht der Dauer der Ausblende-Animation
            return () => clearTimeout(timer);
        }
    }, [isExiting, onRemove, toast.id]);

    return (
        <div 
            className={`
                w-full max-w-sm p-4 rounded-lg shadow-lg border-l-4 flex items-center space-x-4
                transition-all duration-300 ease-in-out
                ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
                ${toastStyles[toast.type]}
            `}
            role="alert"
        >
            <div className="flex-shrink-0">
                {toastIcons[toast.type]}
            </div>
            <div className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">
                {toast.message}
            </div>
            <button 
                onClick={handleRemove} 
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                aria-label="Benachrichtigung schließen"
            >
                <XIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Toast;
