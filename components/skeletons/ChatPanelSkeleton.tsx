
import React from 'react';
import SkeletonPanel from './SkeletonPanel';

const ChatPanelSkeleton: React.FC = () => {
  return (
    <SkeletonPanel>
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-start gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0"></div>
            <div className="w-3/4 px-5 py-3 rounded-2xl bg-slate-800">
              <div className="h-4 bg-slate-700 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex items-start gap-4 justify-end">
            <div className="w-1/2 px-5 py-3 rounded-2xl bg-indigo-500/20">
              <div className="h-4 bg-indigo-500/30 rounded w-full"></div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0"></div>
          </div>
          <div className="flex items-start gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0"></div>
            <div className="w-1/2 px-5 py-3 rounded-2xl bg-slate-800">
              <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-slate-800/80 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex-grow h-12 bg-slate-800 rounded-lg"></div>
          <div className="w-12 h-12 bg-indigo-500/20 rounded-full"></div>
        </div>
      </div>
    </SkeletonPanel>
  );
};

export default ChatPanelSkeleton;
