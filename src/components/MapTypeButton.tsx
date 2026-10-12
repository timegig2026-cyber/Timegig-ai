import React from 'react';
import { Layers, Globe } from 'lucide-react';

interface MapTypeButtonProps {
  isSatellite: boolean;
  onToggle: () => void;
}

export const MapTypeButton: React.FC<MapTypeButtonProps> = ({
  isSatellite,
  onToggle,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 p-1.5 select-none">
      <button
        onClick={onToggle}
        title={isSatellite ? 'Switch to Street Map view' : 'Switch to Satellite view'}
        aria-label="Toggle map view"
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
          isSatellite
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        {isSatellite ? (
          <Globe className="w-5 h-5 stroke-[3.2]" />
        ) : (
          <Layers className="w-5 h-5 stroke-[3.2]" />
        )}
      </button>
    </div>
  );
};
