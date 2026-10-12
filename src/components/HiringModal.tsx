import React, { useState, useEffect } from 'react';
import { SeekerProfile } from '../types';
import { CheckCircle2, X, MapPin, DollarSign, Sparkles, RefreshCw } from 'lucide-react';

interface HiringModalProps {
  isOpen: boolean;
  seeker: SeekerProfile | null;
  onClose: () => void;
  onAccepted: () => void;
}

export const HiringModal: React.FC<HiringModalProps> = ({
  isOpen,
  seeker,
  onClose,
  onAccepted,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Connecting with seeker...');
  const [isAccepted, setIsAccepted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setStatusText('Connecting with seeker...');
      setIsAccepted(false);
      setTimedOut(false);
      return;
    }

    setProgress(0);
    setIsAccepted(false);
    setTimedOut(false);
    setStatusText('Connecting with seeker...');

    // 60 seconds duration
    const totalDurationMs = 60000;
    const intervalTimeMs = 200;
    const increment = (intervalTimeMs / totalDurationMs) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);
          setTimedOut(true);
          setStatusText('Seeker did not respond within 60 seconds.');
          return 100;
        }
        if (next > 75) {
          setStatusText('Waiting for seeker response...');
        } else if (next > 40) {
          setStatusText('Seeker reviewing gig request...');
        } else if (next > 15) {
          setStatusText('Request transmitted to seeker device...');
        }
        return next;
      });
    }, intervalTimeMs);

    return () => {
      clearInterval(interval);
    };
  }, [isOpen, retryKey]);

  const handleAccept = () => {
    setIsAccepted(true);
    setTimedOut(false);
    setStatusText('Seeker Accepted! Directing to map navigation...');
    setTimeout(() => {
      onAccepted();
    }, 1200);
  };

  const handleRetry = () => {
    setProgress(0);
    setTimedOut(false);
    setIsAccepted(false);
    setStatusText('Retrying connection with seeker...');
    setRetryKey(k => k + 1);
  };

  if (!isOpen || !seeker) return null;

  // Circle dimensions
  const size = 180;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Cancel Hire Request"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hiring Seeker</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {isAccepted ? 'Seeker Accepted!' : timedOut ? 'No Response from Seeker' : 'Waiting for Seeker to Accept'}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {isAccepted
              ? 'Routing seeker from live location to user destination.'
              : timedOut
              ? 'The seeker did not respond within 60 seconds. Please try again or cancel.'
              : `Request sent to ${seeker.name}. Awaiting acceptance (60s max).`}
          </p>
        </div>

        {/* Animated Circle Loading Indicator with Seeker Avatar */}
        <div className="relative mx-auto my-4 flex items-center justify-center" style={{ width: size, height: size }}>
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isAccepted ? '#10b981' : timedOut ? '#ef4444' : '#6366f1'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-150 ease-out"
            />
          </svg>

          {/* Center Seeker Avatar & Pulse Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="relative">
              <img
                src={seeker.avatar}
                alt={seeker.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl"
              />
              {isAccepted ? (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-md animate-bounce">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : timedOut ? (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-md">
                  <X className="w-4 h-4" />
                </div>
              ) : (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                </div>
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-800 mt-2 truncate max-w-[120px]">
              {seeker.name}
            </span>
          </div>
        </div>

        {/* Status Pill & Progress Text */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 my-4 space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-800">
            {!isAccepted && !timedOut && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />}
            {timedOut && <span className="w-2 h-2 rounded-full bg-rose-600" />}
            <span>{statusText}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 pt-1 border-t border-slate-200/60">
            <span>Rate: R{seeker.hourlyRate}/hr</span>
            <span>Trade: {seeker.role}</span>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="space-y-2 pt-1">
          {!isAccepted && !timedOut && (
            <button
              onClick={handleAccept}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Accept Request Now (Simulate Seeker)</span>
            </button>
          )}

          {timedOut && (
            <button
              onClick={handleRetry}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-indigo-200" />
              <span>Try Again</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel Request
          </button>
        </div>
      </div>
    </div>
  );
};
