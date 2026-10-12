import React from 'react';
import { Sparkles, MapPin, DollarSign, Clock, Star, Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import { Gig } from '../types';
import { CATEGORIES } from '../data/mockGigs';

interface ExploreViewProps {
  gigs: Gig[];
  onSelectGig: (gig: Gig) => void;
  onGoToMap: () => void;
  onFilterByCategory: (category: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  gigs,
  onSelectGig,
  onGoToMap,
  onFilterByCategory,
}) => {
  return (
    <div className="h-full w-full bg-white overflow-y-auto pb-28 pt-4 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* White Screen Top Header */}
        <div className="border-b border-slate-200/80 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Feature</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Discover All GiGs
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Browse all available gigs or select any category to filter and navigate on the live map.
              </p>
            </div>

            <button
              onClick={onGoToMap}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 flex-shrink-0 transition-all active:scale-95"
            >
              <span>View on GiGs Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Browse Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onFilterByCategory(cat.id);
                  onGoToMap();
                }}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center text-slate-700 font-bold mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Trending GiGs List on White Screen */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Available GiGs ({gigs.length})
            </h2>
            <span className="text-xs text-slate-400 font-medium">Live Feed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gigs.map((gig) => (
              <div
                key={gig.id}
                onClick={() => onSelectGig(gig)}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700">
                        {gig.categoryLabel}
                      </span>
                      {gig.isUrgent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-rose-500" />
                          <span>Urgent</span>
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-600 flex items-center justify-end">
                        R{gig.pay}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block -mt-0.5 uppercase">
                        {gig.payType === 'hourly' ? '/ hr' : 'flat'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                    {gig.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="font-semibold text-slate-800">{gig.organizer}</span>
                    {gig.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                    <span>•</span>
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                      {gig.organizerRating}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {gig.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span className="truncate">{gig.address}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{gig.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
