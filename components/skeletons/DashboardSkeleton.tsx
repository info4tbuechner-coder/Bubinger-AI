
import React from 'react';
import SkeletonPanel from './SkeletonPanel';

const DashboardSkeleton: React.FC = () => {
  return (
    <SkeletonPanel className="p-4 sm:p-6 space-y-6">
      <div className="h-7 bg-slate-700 rounded w-1/3"></div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-lg h-20"></div>
        <div className="bg-slate-800/50 p-4 rounded-lg h-20"></div>
        <div className="bg-slate-800/50 p-4 rounded-lg h-20"></div>
      </div>

      <div className="flex-grow flex flex-col">
        <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="bg-slate-800/50 rounded-lg p-4 flex-grow">
           <div className="space-y-2">
                <div className="h-7 w-full bg-slate-700 rounded-lg"></div>
                <div className="h-7 w-5/6 bg-slate-700 rounded-lg"></div>
                <div className="h-7 w-2/3 bg-slate-700 rounded-lg"></div>
           </div>
        </div>
      </div>

      <div>
        <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="h-48 bg-slate-800/50 rounded-lg"></div>
      </div>
    </SkeletonPanel>
  );
};

export default DashboardSkeleton;
