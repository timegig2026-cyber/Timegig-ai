import React, { useState } from 'react';
import { X, DollarSign, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { Gig, GigCategory } from '../types';
import { CATEGORIES } from '../data/mockGigs';

interface PostGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostGig: (gig: Gig) => void;
  currentCenter: [number, number];
}

export const PostGigModal: React.FC<PostGigModalProps> = ({
  isOpen,
  onClose,
  onPostGig,
  currentCenter,
}) => {
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('My Studio / Events');
  const [category, setCategory] = useState<GigCategory>('music');
  const [pay, setPay] = useState('150');
  const [payType, setPayType] = useState<'hourly' | 'fixed'>('fixed');
  const [address, setAddress] = useState('Current Map Location');
  const [date, setDate] = useState('Tomorrow');
  const [time, setTime] = useState('6:00 PM - 9:00 PM');
  const [duration, setDuration] = useState('3 hrs');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [tags, setTags] = useState('QuickPay, Live, Music');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const catObj = CATEGORIES.find((c) => c.id === category);

    // Add random slight jitter to latitude/longitude around map center
    const lat = currentCenter[0] + (Math.random() - 0.5) * 0.005;
    const lng = currentCenter[1] + (Math.random() - 0.5) * 0.005;

    const newGig: Gig = {
      id: `posted-gig-${Date.now()}`,
      title: title.trim(),
      organizer: organizer.trim() || 'Community Host',
      organizerRating: 5.0,
      organizerReviewCount: 1,
      category,
      categoryLabel: catObj?.label || 'General GiG',
      pay: parseFloat(pay) || 100,
      payType,
      latitude: lat,
      longitude: lng,
      address: address.trim() || 'Central District',
      city: 'Local Area',
      date,
      time,
      duration,
      description: description.trim() || 'Looking for talented assistance for this upcoming gig!',
      requirements: ['Punctual', 'Experienced', 'Friendly demeanor'],
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      isUrgent,
      isVerified: true,
      applicantsCount: 0,
      distanceKm: 0.2,
    };

    setSuccess(true);
    setTimeout(() => {
      onPostGig(newGig);
      setSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Post a New GiG on Map</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">GiG Published Successfully!</h4>
            <p className="text-xs text-slate-500">Your GiG marker has been pinned to the map.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">GiG Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead DJ for Art Gallery Mixer"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GigCategory)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Pay Rate ($)</label>
                <div className="relative flex items-center">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="number"
                    value={pay}
                    onChange={(e) => setPay(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Pay Type</label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPayType('fixed')}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      payType === 'fixed' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500'
                    }`}
                  >
                    Flat Rate
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayType('hourly')}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      payType === 'hourly' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500'
                    }`}
                  >
                    Hourly
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Date & Time</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Tonight, 7 PM"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Location / Street</label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-rose-500 absolute left-3" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street or neighborhood"
                  className="w-full text-xs pl-8 pr-3 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">GiG Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What gear is needed? What are the deliverables?"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-800">Mark as Urgent (🔥)</div>
                <div className="text-[11px] text-slate-500">GiG begins in next 24 hours</div>
              </div>
              <button
                type="button"
                onClick={() => setIsUrgent(!isUrgent)}
                className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                  isUrgent ? 'bg-rose-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isUrgent ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-98 transition-all"
              >
                Post GiG Now
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
