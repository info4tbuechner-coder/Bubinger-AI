
import React from 'react';

interface SkeletonPanelProps {
    children: React.ReactNode;
    className?: string;
}

const SkeletonPanel: React.FC<SkeletonPanelProps> = ({ children, className = '' }) => {
    return (
        <div className={`glass-pane rounded-2xl shadow-2xl flex flex-col h-full max-h-[calc(100vh-8rem)] relative overflow-hidden animate-shimmer ${className}`}>
            {children}
        </div>
    );
};

export default SkeletonPanel;
