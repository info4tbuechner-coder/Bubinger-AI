import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement<{ className?: string }>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-black/20 p-4 rounded-lg flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-black/30 cursor-pointer ring-1 ring-white/10 hover:ring-indigo-400/50">
      <div className="bg-indigo-900/70 p-3 rounded-full text-indigo-400">
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default React.memo(StatCard);