import React from 'react';
import { Bookmark, MapPin, DollarSign, ArrowRight, Trash2, ArrowLeft } from 'lucide-react';
import { Gig } from '../types';

interface SavedViewProps {
  savedGigs: Gig[];
  onSelectGig: (gig: Gig) => void;
  onRemoveSaved: (gigId: string) => void;
  onGoToMap: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  savedGigs,
  onSelectGig,
  onRemoveSaved,
  onGoToMap,
}) => {
  return (
    <div className="h-full w-full bg-white overflow-y-auto pb-28 pt-4 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* White Screen Top Header */}
        <div className="border-b border-slate-200/80 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToMap}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Back to GiGs Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Saved GiGs</h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {savedGigs.length} bookmarked opportunities
              </p>
            </div>
          </div>

          <button
            onClick={onGoToMap}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span>GiGs Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {savedGigs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Saved GiGs Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tap the bookmark button on any GiG card on the interactive map to save it here.
            </p>
            <button
              onClick={onGoToMap}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all cursor-pointer"
            >
              Explore GiGs on Map
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedGigs.map((gig) => (
              <div
                key={gig.id}
                className="bg-white rounded-2xl p-4.5 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between gap-4"
              >
                <div
                  onClick={() => onSelectGig(gig)}
                  className="flex-1 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {gig.categoryLabel}
                    </span>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {gig.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="text-emerald-600 font-bold flex items-center">
                      R{gig.pay} {gig.payType === 'hourly' ? '/ hr' : 'flat'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {gig.address}
                    </span>
                    <span>•</span>
                    <span>{gig.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onSelectGig(gig)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    View on Map
                  </button>
                  <button
                    onClick={() => onRemoveSaved(gig.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
