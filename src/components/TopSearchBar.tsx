import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Plus } from 'lucide-react';
import { GigFilters } from '../types';

interface TopSearchBarProps {
  filters: GigFilters;
  onFiltersChange: (newFilters: GigFilters) => void;
  onSearchLocation: (lat: number, lng: number, placeName: string) => void;
  gigsCount?: number;
  onCreateGig?: () => void;
}

interface GeocodedResult {
  display_name: string;
  lat: string;
  lon: string;
}

export const TopSearchBar: React.FC<TopSearchBarProps> = ({
  filters,
  onFiltersChange,
  onSearchLocation,
  onCreateGig,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.searchQuery);
  const [suggestions, setSuggestions] = useState<GeocodedResult[]>([]);
  const [, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update query in parent filter
  const handleInputChange = (val: string) => {
    setSearchTerm(val);
    onFiltersChange({ ...filters, searchQuery: val });

    // Fetch place suggestions if input looks like a place query
    if (val.trim().length >= 3) {
      debounceGeocode(val.trim());
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const debounceGeocode = (query: string) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      try {
        setIsSearchingLocation(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=4&addressdetails=1`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 450);
  };

  const handleSelectSuggestion = (item: GeocodedResult) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    if (isNaN(lat) || isNaN(lon)) return;
    const shortName = item.display_name.split(',').slice(0, 2).join(',');
    setSearchTerm(shortName);
    setShowSuggestions(false);
    onSearchLocation(lat, lon, shortName);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else {
        // Quick fallback search
        try {
          setIsSearchingLocation(true);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              searchTerm.trim()
            )}&limit=1`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
              handleSelectSuggestion(data[0]);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearchingLocation(false);
        }
      }
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    onFiltersChange({ ...filters, searchQuery: '' });
  };

  return (
    <div className="absolute top-3 left-3 right-3 sm:left-6 sm:right-6 max-w-2xl sm:mx-auto z-30 pointer-events-auto flex items-center gap-2">
      {/* Search Input Box (Clean, no filter button) */}
      <div
        ref={searchContainerRef}
        className="flex-1 relative bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400"
      >
        <div className="flex items-center px-4 py-3 gap-3">
          <Search className="w-5 h-5 stroke-[2] text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search location, address, or city..."
            className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none"
          />

          {searchTerm && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          )}
        </div>

        {/* Live location autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3.5 py-2 text-[11px] font-semibold text-slate-400 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span>Locations Matching</span>
              <span>Select to navigate map</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 stroke-[2] text-indigo-500 flex-shrink-0" />
                  <span className="truncate">{item.display_name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {onCreateGig && (
        <button
          onClick={onCreateGig}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-lg text-xs font-bold transition-all active:scale-95 cursor-pointer border border-slate-800"
          title="Create a new GiG"
          aria-label="Create GiG"
        >
          <Plus className="w-4 h-4 text-emerald-400 stroke-[2.2]" />
          <span className="hidden sm:inline">Post GiG</span>
        </button>
      )}
    </div>
  );
};
