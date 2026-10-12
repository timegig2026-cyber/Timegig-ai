import React from 'react';
import { Navigation, Loader2 } from 'lucide-react';
import { UserLocation } from '../types';

interface UserLocationButtonProps {
  userLocation: UserLocation | null;
  isLocating: boolean;
  onLocateUser: () => void;
}

export const UserLocationButton: React.FC<UserLocationButtonProps> = ({
  userLocation,
  isLocating,
  onLocateUser,
}) => {
  return (
    <div className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 p-1.5 select-none">
      <button
        onClick={onLocateUser}
        title={userLocation ? 'Fly to your location' : 'Find my current location'}
        aria-label="Find my location"
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
          userLocation
            ? 'text-blue-600 bg-blue-50/80 hover:bg-blue-100'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        {isLocating ? (
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        ) : (
          <>
            <Navigation
              className={`w-5 h-5 stroke-[3.2] transition-transform ${
                userLocation ? 'text-blue-600 fill-blue-600' : 'text-slate-700'
              }`}
            />
            {userLocation && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-75" />
            )}
          </>
        )}
      </button>
    </div>
  );
};
