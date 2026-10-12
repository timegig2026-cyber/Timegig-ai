import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Tag, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  Navigation, 
  Loader2, 
  Search, 
  Crosshair 
} from 'lucide-react';
import { Gig, GigCategory, UserLocation } from '../types';
import { CATEGORIES } from '../data/mockGigs';

interface PostViewProps {
  onPostGig: (gig: Gig) => void;
  onGoToMap: () => void;
  currentCenter: [number, number];
  userLocation: UserLocation | null;
}

interface GeocodedResult {
  display_name: string;
  lat: string;
  lon: string;
}

export const PostView: React.FC<PostViewProps> = ({
  onPostGig,
  onGoToMap,
  currentCenter,
  userLocation,
}) => {
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('My Studio / Production Co');
  const [category, setCategory] = useState<GigCategory>('dogwalking');
  const [pay, setPay] = useState('350');
  const [payType, setPayType] = useState<'hourly' | 'fixed'>('fixed');
  const [date, setDate] = useState('Tonight, 7:00 PM');
  const [duration, setDuration] = useState('3 hrs');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('Reliable, punctual, bring own gear/equipment');
  const [isUrgent, setIsUrgent] = useState(false);
  const [tags, setTags] = useState('LiveEvent, Urgent, QuickPay');
  const [isSuccess, setIsSuccess] = useState(false);

  // Location choice states
  const [locationMode, setLocationMode] = useState<'current' | 'custom'>(userLocation ? 'current' : 'custom');
  const [address, setAddress] = useState(userLocation ? 'Current User Location' : 'Downtown District');
  const [latitude, setLatitude] = useState<number>(userLocation ? userLocation.latitude : currentCenter[0]);
  const [longitude, setLongitude] = useState<number>(userLocation ? userLocation.longitude : currentCenter[1]);
  const [isAcquiringGPS, setIsAcquiringGPS] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  // Address search suggestions
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodedResult[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch current GPS location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsAcquiringGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsAcquiringGPS(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setLocationMode('current');
        setLocationConfirmed(true);

        // Reverse geocode via OpenStreetMap Nominatim for a human readable name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            const friendly = data.display_name.split(',').slice(0, 3).join(',');
            setAddress(friendly || 'Current GPS Location');
          } else {
            setAddress('Current GPS Location');
          }
        } catch {
          setAddress('Current GPS Location');
        }
      },
      (err) => {
        setIsAcquiringGPS(false);
        console.warn('Geolocation error:', err.message);
        alert('Could not access GPS location. Please enter a custom address below.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Debounced address search
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const handleAddressInputChange = (val: string) => {
    setAddressQuery(val);
    setAddress(val);
    setLocationConfirmed(false);

    if (val.trim().length >= 3) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        setIsSearchingAddress(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              val.trim()
            )}&limit=4`
          );
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
          }
        } catch (err) {
          console.error('Geocoding error:', err);
        } finally {
          setIsSearchingAddress(false);
        }
      }, 400);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (item: GeocodedResult) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setLatitude(lat);
    setLongitude(lon);
    const shortName = item.display_name.split(',').slice(0, 3).join(',');
    setAddress(shortName);
    setAddressQuery(shortName);
    setShowSuggestions(false);
    setLocationMode('custom');
    setLocationConfirmed(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const catObj = CATEGORIES.find((c) => c.id === category);

    const newGig: Gig = {
      id: `posted-gig-${Date.now()}`,
      title: title.trim(),
      organizer: organizer.trim() || 'Verified Host',
      organizerRating: 5.0,
      organizerReviewCount: 1,
      category,
      categoryLabel: catObj?.label || 'General GiG',
      pay: parseFloat(pay) || 100,
      payType,
      latitude,
      longitude,
      address: address.trim() || 'Local Area',
      city: 'OpenStreetMap Pin',
      date,
      time: 'Scheduled',
      duration,
      description: description.trim() || 'Exciting gig opportunity! Looking for dependable talent.',
      requirements: requirements.split(',').map((r) => r.trim()).filter(Boolean),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      isUrgent,
      isVerified: true,
      applicantsCount: 0,
      distanceKm: 0.1,
    };

    setIsSuccess(true);
    setTimeout(() => {
      onPostGig(newGig);
      setIsSuccess(false);
    }, 700);
  };

  return (
    <div className="h-full w-full bg-white overflow-y-auto pb-28 pt-4 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToMap}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Back to GiGs Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Create a GiG Post</h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Drop your GiG pin onto the map for applicants to discover and apply to
              </p>
            </div>
          </div>

          <button
            onClick={onGoToMap}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {isSuccess ? (
          <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">GiG Pinned on Map!</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your GiG has been added to the OpenStreetMap. Navigating you directly to your pin now...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 bg-white">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                GiG Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Acoustic Musician for Rooftop Opening"
                className="w-full text-sm font-medium p-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            {/* Category & Organizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GigCategory)}
                  className="w-full text-sm p-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Organizer / Host Name
                </label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="e.g. Studio Lounge Co"
                  className="w-full text-sm p-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Compensation & Pay Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Compensation (Rands - R)
                </label>
                <div className="relative flex items-center">
                  <span className="text-base font-black text-emerald-600 absolute left-3.5">R</span>
                  <input
                    type="number"
                    min="1"
                    value={pay}
                    onChange={(e) => setPay(e.target.value)}
                    className="w-full text-sm font-bold pl-8 pr-3.5 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Pay Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setPayType('fixed')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      payType === 'fixed'
                        ? 'bg-white shadow-xs text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Flat Rate
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayType('hourly')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      payType === 'hourly'
                        ? 'bg-white shadow-xs text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hourly ($/hr)
                  </button>
                </div>
              </div>
            </div>

            {/* LOCATION SETTING SECTION - "let user set the gig location or use current location" */}
            <div className="p-5 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    GiG Location on Map *
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Set a custom address or drop the pin at your current GPS location
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Crosshair className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
                </div>
              </div>

              {/* Location Mode Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isAcquiringGPS}
                  className={`py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    locationMode === 'current'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isAcquiringGPS ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <Navigation className="w-4 h-4 text-blue-600" />
                  )}
                  <span>Use My Current Location</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLocationMode('custom')}
                  className={`py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    locationMode === 'custom'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>Set Custom Address / Place</span>
                </button>
              </div>

              {/* Address / Location Search Input with OpenStreetMap Geocoding */}
              <div ref={searchDropdownRef} className="relative">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => handleAddressInputChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Search address, neighborhood, venue, or city..."
                    className="w-full text-xs font-medium pl-10 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 outline-none"
                  />
                  {isSearchingAddress && (
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin absolute right-3.5" />
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-30">
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 bg-slate-50 border-b border-slate-100">
                      OpenStreetMap Matches (Select to set coordinates)
                    </div>
                    <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                      {suggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2.5 cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span className="truncate">{item.display_name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pin Confirmation Status */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Map pin coordinates set: <strong>{latitude.toFixed(5)}, {longitude.toFixed(5)}</strong>
                </span>
              </div>
            </div>

            {/* Date & Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Date &amp; Schedule
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-5 h-5 text-indigo-500 absolute left-3.5" />
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. Tonight, 7:00 PM"
                    className="w-full text-sm pl-10 pr-3.5 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 3 hrs"
                  className="w-full text-sm p-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                GiG Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what the job entails, what deliverables or songs are requested, and schedule..."
                className="w-full text-sm p-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Requirements & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Requirements (comma separated)
                </label>
                <input
                  type="text"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g. Own gear, Punctual, 21+"
                  className="w-full text-sm p-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Tags (comma separated)
                </label>
                <div className="relative flex items-center">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. LiveMusic, Urgent, Tips"
                    className="w-full text-sm pl-10 pr-3.5 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Urgent Switch */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white">
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🔥</span>
                  <span>Mark as Urgent Priority GiG</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Highlights with an orange/red flame badge on the map
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUrgent(!isUrgent)}
                className={`w-12 h-7 rounded-full transition-colors relative p-1 cursor-pointer ${
                  isUrgent ? 'bg-rose-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isUrgent ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onGoToMap}
                className="py-3.5 px-6 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 px-6 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publish GiG to Map</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
