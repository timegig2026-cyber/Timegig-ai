import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, DollarSign, Star, ShieldCheck, Share2, Bookmark, CheckCircle2, Navigation, Send } from 'lucide-react';
import { Gig } from '../types';

interface GigCardDrawerProps {
  gig: Gig | null;
  onClose: () => void;
  onSaveGig: (gig: Gig) => void;
  isSaved: boolean;
}

export const GigCardDrawer: React.FC<GigCardDrawerProps> = ({
  gig,
  onClose,
  onSaveGig,
  isSaved,
}) => {
  const [applied, setApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [proposalMsg, setProposalMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setApplied(false);
    setShowApplyModal(false);
    setProposalMsg('');
  }, [gig?.id]);

  if (!gig) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setApplied(true);
      setShowApplyModal(false);
    }, 600);
  };

  const handleDirections = () => {
    const url = `https://www.openstreetmap.org/?mlat=${gig.latitude}&mlon=${gig.longitude}#map=17/${gig.latitude}/${gig.longitude}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: gig.title,
        text: `Check out this GiG: ${gig.title} paying R${gig.pay}/${gig.payType === 'hourly' ? 'hr' : 'flat'}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${gig.title} - R${gig.pay} at ${gig.address}`);
      alert('GiG link copied to clipboard!');
    }
  };

  return (
    <>
      <div className="absolute bottom-20 left-3 right-3 sm:left-6 sm:right-6 max-w-xl sm:mx-auto z-40 animate-in slide-in-from-bottom-6 duration-200 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/90 p-5 overflow-hidden">
          {/* Top Bar with Category, Pay and Close */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {gig.categoryLabel}
              </span>

              {gig.isUrgent && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                  <span>🔥</span> Urgent
                </span>
              )}

              {gig.distanceKm !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-500 bg-slate-100 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-slate-400" />
                  {gig.distanceKm} km away
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onSaveGig(gig)}
                className={`p-2 rounded-full transition-colors ${
                  isSaved ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title={isSaved ? 'Saved to bookmarks' : 'Save GiG'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Share GiG"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Title and Pay */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                {gig.title}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{gig.organizer}</span>
                {gig.isVerified && (
                  <span className="inline-flex items-center text-blue-600" title="Verified Organizer">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                )}
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {gig.organizerRating}
                </span>
                <span className="text-slate-400">({gig.organizerReviewCount})</span>
              </div>
            </div>

            <div className="text-right flex-shrink-0 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-100">
              <div className="text-lg sm:text-xl font-extrabold text-emerald-700 flex items-baseline justify-end gap-0.5">
                <span>R{gig.pay}</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                {gig.payType === 'hourly' ? '/ hour' : 'Flat rate'}
              </div>
            </div>
          </div>

          {/* Details Row: Address & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 mb-3.5">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span className="truncate">{gig.address}, {gig.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>{gig.date} • {gig.time} ({gig.duration})</span>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3.5">
            {gig.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {gig.tags.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDirections}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-slate-500" />
              <span>Directions</span>
            </button>

            {applied ? (
              <div className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Application Submitted!</span>
              </div>
            ) : (
              <button
                onClick={() => setShowApplyModal(true)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-98 transition-all"
              >
                <span>Apply for GiG</span>
                <span className="text-[11px] font-normal opacity-80">({gig.applicantsCount} applicants)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Apply for this GiG</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApply} className="py-4 space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">GiG Selected</div>
                <div className="text-sm font-bold text-slate-800">{gig.title}</div>
                <div className="text-xs text-emerald-600 font-bold mt-0.5">
                  ${gig.pay} {gig.payType === 'hourly' ? '/ hr' : 'Flat rate'} • {gig.date}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Quick note / pitch to {gig.organizer}
                </label>
                <textarea
                  rows={3}
                  value={proposalMsg}
                  onChange={(e) => setProposalMsg(e.target.value)}
                  placeholder="Hey! I have the required gear and 4+ years of experience with this type of gig. Would love to help out!"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Your verified profile & rating will be attached automatically.</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
