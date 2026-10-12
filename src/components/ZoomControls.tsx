import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface ZoomControlsProps {
  currentZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  currentZoom,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="flex flex-col items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 p-1.5 gap-1 select-none">
      <button
        onClick={onZoomIn}
        title="Zoom In"
        aria-label="Zoom In"
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all focus:outline-none"
      >
        <Plus className="w-5 h-5 stroke-[3.2]" />
      </button>

      <div className="w-8 py-0.5 text-center text-[11px] font-semibold tracking-wider text-slate-400 border-y border-slate-100">
        {Math.round(currentZoom)}x
      </div>

      <button
        onClick={onZoomOut}
        title="Zoom Out"
        aria-label="Zoom Out"
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all focus:outline-none"
      >
        <Minus className="w-5 h-5 stroke-[3.2]" />
      </button>
    </div>
  );
};
