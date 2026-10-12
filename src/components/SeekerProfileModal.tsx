import React from 'react';
import { SeekerProfile } from '../types';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  ShieldCheck, 
  Briefcase, 
  ExternalLink, 
  Sparkles
} from 'lucide-react';

interface SeekerProfileModalProps {
  isOpen: boolean;
  seeker: SeekerProfile | null;
  onClose: () => void;
  onHire: (seeker: SeekerProfile) => void;
}

export const SeekerProfileModal: React.FC<SeekerProfileModalProps> = ({
  isOpen,
  seeker,
  onClose,
  onHire,
}) => {
  if (!isOpen || !seeker) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Sticky Header with Title and Close button (only 1, removed top hire button) */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Live Seeker Profile
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Seeker Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Top Banner: Big Profile Picture Logo, Name, Role, Rate */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 bg-gradient-to-br from-slate-50 to-indigo-50/40 p-6 rounded-3xl border border-slate-200/80">
            {/* Big Profile Picture Logo */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl ring-2 ring-indigo-500/20 bg-slate-100">
                <img
                  src={seeker.avatar}
                  alt={seeker.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black border-2 border-white shadow-md flex items-center gap-1"
                title="Online & Ready to be Hired"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>LIVE</span>
              </div>
            </div>

            {/* Name, Middle Name, Surname & Badges */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {seeker.name}
                </h1>
                <span title="Identity & Tenant Verified">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                  Ready to be hired
                </span>
              </div>

              {/* Trade & Hourly Rate in Rands */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
                <span className="font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                  {seeker.role}
                </span>
                <span className="font-black text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                  R{seeker.hourlyRate} / hour (ZAR)
                </span>
              </div>

              {/* Location & Reviews */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{seeker.location}</span>
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{seeker.rating} ({seeker.completedGigs} completed gigs)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bio / Professional Statement */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Professional Bio &amp; Overview
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {seeker.bio}
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Direct Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${seeker.phone}`}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-xs font-bold text-slate-800"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">Phone / Mobile</span>
                  <span>{seeker.phone}</span>
                </div>
              </a>

              <a
                href={`mailto:${seeker.email}`}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-xs font-bold text-slate-800"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block font-normal">Email Address</span>
                  <span className="truncate">{seeker.email}</span>
                </div>
              </a>
            </div>
          </div>

          {/* Working Trade Experiences & References */}
          {seeker.experiences && seeker.experiences.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Working Trade Experience &amp; References
              </h3>
              <div className="space-y-3">
                {seeker.experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        <span>{exp.role}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {exp.duration}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-indigo-700">{exp.organization}</div>

                    <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>

                    {/* Reference Contact Card */}
                    <div className="pt-2 border-t border-slate-100 bg-slate-50/80 -mx-4 -mb-4 p-3 rounded-b-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Verified Reference:
                        </span>
                        <span className="font-bold text-slate-800">{exp.referenceName}</span>
                      </div>
                      <span className="text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                        {exp.referenceContact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Links */}
          {seeker.socialLinks && seeker.socialLinks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Social Media Links &amp; Portfolios
              </h3>
              <div className="flex flex-wrap gap-2">
                {seeker.socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <span>{link.platform}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Skills Tags */}
          {seeker.skills && seeker.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Core Trade Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {seeker.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Primary Hire CTA (The 1 and only hire box) */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3 shadow-lg">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Back to Seekers
          </button>

          <button
            onClick={() => onHire(seeker)}
            className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-black shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Hire Seeker (R{seeker.hourlyRate}/hr)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
