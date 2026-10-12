import React, { useState } from 'react';
import { GigFilters, SeekerProfile } from '../types';
import { Power, Star, Wrench, ShieldCheck, Users } from 'lucide-react';

interface SeekersViewProps {
  filters: GigFilters;
  onFiltersChange: (newFilters: GigFilters) => void;
  onSearchLocation: (lat: number, lng: number, placeName: string) => void;
  isSeekerLive?: boolean;
  onToggleSeekerLive?: () => void;
  liveSeeker?: SeekerProfile | null;
  liveSeekers?: SeekerProfile[];
  allSeekers?: SeekerProfile[];
  onViewSeekerProfile?: (seeker: SeekerProfile) => void;
  onHireSeeker?: (seeker: SeekerProfile) => void;
  onGoToProfile?: () => void;
}

export const SeekersView: React.FC<SeekersViewProps> = ({
  isSeekerLive,
  onToggleSeekerLive,
  liveSeekers = [],
  onViewSeekerProfile,
  onHireSeeker,
}) => {
  const [internalLive, setInternalLive] = useState(false);
  const [liveToast, setLiveToast] = useState<string | null>(null);

  const isLive = isSeekerLive !== undefined ? isSeekerLive : internalLive;

  const handleToggleLive = () => {
    if (onToggleSeekerLive) {
      onToggleSeekerLive();
    } else {
      setInternalLive(!internalLive);
    }
    const nextState = !isLive;
    setLiveToast(
      nextState
        ? 'You are now LIVE! Your profile is visible to hirers on the map.'
        : 'You are now OFFLINE.'
    );
    setTimeout(() => setLiveToast(null), 3000);
  };

  return (
    <div className="h-full w-full bg-slate-50 overflow-y-auto pb-32 pt-4 relative flex flex-col items-center select-text">

      {/* Online Seekers Ready Section */}
      <div className="w-full max-w-3xl px-3 sm:px-6 py-5 flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold text-slate-800 tracking-tight uppercase">
                Online Live Seekers ({liveSeekers.length})
              </h2>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Ready for Hire
            </span>
          </div>

          {liveSeekers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs border border-emerald-200">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-slate-800">No Seekers Currently Live</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                No seekers are currently online on the map. Click "Go Live" below to turn on your status and appear here!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {liveSeekers.map((seeker) => (
                <div
                  key={seeker.id}
                  onClick={() => onViewSeekerProfile && onViewSeekerProfile(seeker)}
                  className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex items-center justify-between gap-4 group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Circular Avatar Bubble just like GiGs and profile */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20 bg-slate-100 flex items-center justify-center">
                        <img
                          src={seeker.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={seeker.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-xs">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                          {seeker.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" /> Live
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-indigo-700 truncate">
                        {seeker.role || 'Professional Trade'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                        <div className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{seeker.rating || 5.0}</span>
                          <span className="text-slate-400 font-normal">({seeker.reviewsCount || 12})</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                          R{seeker.hourlyRate || 150}/hr
                        </span>
                      </div>
                      {seeker.skills && seeker.skills.length > 0 && (
                        <div className="flex items-center gap-1 pt-1 flex-wrap">
                          {seeker.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-100"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onHireSeeker) onHireSeeker(seeker);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Hire Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Status Toast Banner */}
      {liveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2.5 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 bg-slate-900 text-white border-slate-800 shadow-slate-900/30">
            {isLive ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            ) : (
              <Power className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{liveToast}</span>
          </div>
        </div>
      )}

      {/* Floating ON/OFF icon button in bottom corner for seeker to go live on the map */}
      <div className="fixed bottom-20 right-3 sm:right-6 z-40 flex items-center">
        <button
          onClick={handleToggleLive}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl border transition-all cursor-pointer select-none active:scale-95 ${
            isLive
              ? 'bg-slate-950 text-white border-emerald-500 ring-4 ring-emerald-500/25 shadow-emerald-500/20'
              : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 shadow-lg'
          }`}
          title={isLive ? 'You are LIVE on map ready to be hired (Click to go offline)' : 'Click to go LIVE on map ready to be hired'}
          aria-label="Toggle Live on Map"
        >
          <div className="relative flex items-center justify-center">
            <Power
              className={`w-5 h-5 stroke-[3.2] ${
                isLive ? 'text-emerald-400' : 'text-slate-500'
              }`}
            />
            {isLive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <div className="text-left flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[11px] font-black uppercase tracking-wider">
                {isLive ? 'LIVE ON MAP' : 'GO LIVE'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'
                }`}
              />
            </div>
            <span
              className={`text-[9px] font-bold leading-none mt-0.5 ${
                isLive ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {isLive ? 'Ready to be hired' : 'Ready to be hired'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
