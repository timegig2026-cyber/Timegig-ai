import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Save, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  Camera, 
  Plus, 
  Trash2, 
  Globe, 
  ExternalLink, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  LocateFixed, 
  Loader2, 
  Edit3, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Image as ImageIcon, 
  Smile, 
  Video, 
  UserCheck, 
  Layers,
  Zap,
  UserPlus,
  LogOut,
  Power,
  Sparkles,
  Building2,
  MoreVertical,
  Shield
} from 'lucide-react';
import { RegisteredUser, SeekerProfile } from '../types';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface WorkExperience {
  id: string;
  role: string;
  organization: string;
  duration: string;
  description: string;
  referenceName: string;
  referenceContact: string;
}

const COMMON_TRADES = [
  'Dog Walker & Pet Sitter',
  'House Cleaner & Deep Cleaning',
  'Nanny & Childcare / Au Pair',
  'Construction Worker & Site Hand',
  'Security Guard & Bouncer',
  'General Laborer & Helper',
  'Furniture Mover & Relocation',
  'Painter & Finisher',
  'Gardener & Landscaper',
  'Handyman & Maintenance Tech',
  'Plumber & Drainage Specialist',
  'Electrician & Wireman',
  'Catering & Hospitality Staff',
  'Courier & Delivery Driver',
  'Carpenter & Joiner',
  'Live Audio & Sound Engineer',
  'Acoustic Musician & Vocalist',
  'DJ & Music Producer',
  'Event & Concert Photographer',
  'Videographer & Video Editor',
  'Mixologist & Craft Bartender',
  'Stage Tech & Lighting Specialist',
  'Event Host & Coordinator',
  'General Production Assistant',
];

const SOCIAL_PLATFORMS = [
  'Instagram',
  'LinkedIn',
  'YouTube',
  'SoundCloud',
  'Twitter / X',
  'TikTok',
  'Facebook',
  'Portfolio Website',
  'Spotify / Apple Music',
];

interface ProfileViewProps {
  currentUser?: RegisteredUser | null;
  onSignUp?: (user: RegisteredUser) => void;
  onLogin?: (email: string) => void;
  onProfileUpdate?: (seeker: Partial<SeekerProfile>) => void;
  onHireSeeker?: () => void;
  isSeekerLive?: boolean;
  onToggleSeekerLive?: () => void;
  onSignOut?: () => void;
  onGoToTenantPortal?: () => void;
  onGoToAdmin?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onSignUp,
  onLogin,
  onProfileUpdate,
  onHireSeeker,
  isSeekerLive,
  onToggleSeekerLive,
  onSignOut,
  onGoToTenantPortal,
  onGoToAdmin,
}) => {
  // Sign up form state (used when no real user is signed up yet)
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [loginEmail, setLoginEmail] = useState('');
  const [formFirstName, setFormFirstName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(loginEmail);
    }
  };
  const [formMiddleName, setFormMiddleName] = useState('');
  const [formSurname, setFormSurname] = useState('');
  const [formEmail, setFormEmail] = useState('timegig2026@gmail.com');
  const [formPhone, setFormPhone] = useState('+27 82 450 8921');
  const [formRole, setFormRole] = useState(COMMON_TRADES[0]);
  const [formHourlyRate, setFormHourlyRate] = useState('220');
  const [formAddress, setFormAddress] = useState('Cape Town, Western Cape, South Africa');
  const [formBio, setFormBio] = useState('Verified trade professional ready for immediate callouts and scheduled bookings.');
  const [formSkills, setFormSkills] = useState('Reliable, Punctual, Experienced, Certified');
  const [formAvatar, setFormAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');

  // Active user profile state
  const [isLocked, setIsLocked] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close 3-dot menu when clicking anywhere outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);
  const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'posts' | 'contact'>('about');
  const [avatar, setAvatar] = useState(currentUser?.avatar || formAvatar);
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [middleName, setMiddleName] = useState(currentUser?.middleName || '');
  const [surname, setSurname] = useState(currentUser?.surname || '');
  const [address, setAddress] = useState(currentUser?.location || '');
  const [isDetectingAddress, setIsDetectingAddress] = useState(false);
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [workingTrade, setWorkingTrade] = useState(currentUser?.role || '');
  const [hourlyRate, setHourlyRate] = useState(currentUser?.hourlyRate?.toString() || '220');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(currentUser?.socialLinks || []);
  const [experiences, setExperiences] = useState<WorkExperience[]>(currentUser?.experiences || []);
  const [newPostText, setNewPostText] = useState('');
  const [posts, setPosts] = useState<{ id: string; author: string; avatar: string; time: string; content: string; likes: number; comments: number; shares: number; isLiked: boolean }[]>([]);

  // Synchronize when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName);
      setMiddleName(currentUser.middleName || '');
      setSurname(currentUser.surname);
      setAvatar(currentUser.avatar);
      setAddress(currentUser.location);
      setPhone(currentUser.phone);
      setEmail(currentUser.email);
      setWorkingTrade(currentUser.role);
      setHourlyRate(currentUser.hourlyRate.toString());
      setBio(currentUser.bio);
      setSocialLinks(currentUser.socialLinks || []);
      setExperiences(currentUser.experiences || []);
    }
  }, [currentUser]);

  // Full displayed name helper
  const fullName = `${firstName}${middleName ? ` ${middleName}` : ''} ${surname}`.trim();

  // Auto-detect GPS Address
  const handleAutoDetectAddress = (target: 'form' | 'profile') => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingAddress(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          if (res.ok) {
            const data = await res.json();
            const friendly = data.display_name.split(',').slice(0, 4).join(',');
            const loc = friendly || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            if (target === 'form') setFormAddress(loc);
            else setAddress(loc);
          } else {
            const loc = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            if (target === 'form') setFormAddress(loc);
            else setAddress(loc);
          }
        } catch (err) {
          console.error('Error reverse geocoding:', err);
          alert('Could not fetch address details, please enter manually.');
        } finally {
          setIsDetectingAddress(false);
        }
      },
      (err) => {
        setIsDetectingAddress(false);
        console.warn('Geolocation error:', err.message);
        alert('Could not access current location. Please verify device permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Submit real sign up form
  const handleFormSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formSurname.trim() || !formEmail.trim()) {
      alert('Please fill in required fields (First Name, Surname, Email).');
      return;
    }

    const newUser: RegisteredUser = {
      id: `user-${Date.now()}`,
      firstName: formFirstName.trim(),
      middleName: formMiddleName.trim() || undefined,
      surname: formSurname.trim(),
      name: `${formFirstName.trim()}${formMiddleName.trim() ? ` ${formMiddleName.trim()}` : ''} ${formSurname.trim()}`,
      email: formEmail.trim(),
      phone: formPhone.trim(),
      role: formRole.trim(),
      hourlyRate: parseFloat(formHourlyRate) || 200,
      location: formAddress.trim() || 'South Africa',
      avatar: formAvatar,
      bio: formBio.trim(),
      skills: formSkills.split(',').map((s) => s.trim()).filter(Boolean),
      rating: 5.0,
      reviewsCount: 0,
      completedGigs: 0,
      isAvailable: true,
      isLive: true, // Go live immediately on signup!
      latitude: -33.9249,
      longitude: 18.4241,
      joinedDate: 'October 2026',
      socialLinks: [],
      experiences: [],
    };

    if (onSignUp) {
      onSignUp(newUser);
    }
  };

  // Save profile and lock
  const handleSaveProfile = () => {
    setIsLocked(true);
    if (onProfileUpdate) {
      onProfileUpdate({
        name: fullName,
        firstName,
        middleName,
        surname,
        role: workingTrade,
        hourlyRate: parseFloat(hourlyRate) || 220,
        avatar,
        location: address,
        phone,
        email,
        bio,
        socialLinks,
        experiences,
      });
    }
  };

  // Unlock profile to edit
  const handleUnlockProfile = () => {
    setIsLocked(false);
  };

  // Add a new Social Link
  const handleAddSocialLink = () => {
    const newLink: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: 'Instagram',
      url: 'https://',
    };
    setSocialLinks([...socialLinks, newLink]);
  };

  const handleUpdateSocialLink = (id: string, field: 'platform' | 'url', value: string) => {
    setSocialLinks(socialLinks.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const handleRemoveSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };

  // Add a new Experience & Reference
  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      role: workingTrade || 'Trade Specialist',
      organization: 'Verified Client / Company Name',
      duration: '2024 - Present',
      description: 'Detail key responsibilities, tools, and completed assignments.',
      referenceName: 'Supervisor / Client Reference',
      referenceContact: 'Email / Phone Number',
    };
    setExperiences([...experiences, newExp]);
  };

  const handleUpdateExperience = (id: string, field: keyof WorkExperience, value: string) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  // Handle Timeline Post
  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: `p-${Date.now()}`,
      author: fullName,
      avatar: avatar,
      time: 'Just now',
      content: newPostText.trim(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  const handleToggleLike = (postId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
        };
      }
      return p;
    }));
  };

  // =========================================================================
  // CASE 1: NO USER SIGNED UP YET -> SHOW REAL USER SIGN UP SCREEN
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="h-full w-full bg-white overflow-y-auto pb-28 pt-4 select-text">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">

          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${authMode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Login
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full text-xs font-semibold pl-9 pr-3 py-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Login to Account</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleFormSignUp} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sipho"
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Middle Name
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={formMiddleName}
                  onChange={(e) => setFormMiddleName(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Surname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dlamini"
                  value={formSurname}
                  onChange={(e) => setFormSurname(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full text-xs font-semibold pl-9 pr-3 py-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Phone Number *
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+27 82 123 4567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-xs font-semibold pl-9 pr-3 py-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Working Trade / Skill *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 outline-none bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  {COMMON_TRADES.map((trade) => (
                    <option key={trade} value={trade}>{trade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Hourly Rate (Rands - ZAR) *
                </label>
                <div className="relative flex items-center">
                  <span className="text-xs font-bold text-slate-500 absolute left-3">R</span>
                  <input
                    type="number"
                    required
                    min="50"
                    placeholder="250"
                    value={formHourlyRate}
                    onChange={(e) => setFormHourlyRate(e.target.value)}
                    className="w-full text-xs font-bold pl-7 pr-3 py-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Location / Physical Address *
                </label>
                <button
                  type="button"
                  onClick={() => handleAutoDetectAddress('form')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  {isDetectingAddress ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />}
                  <span>Auto-detect GPS</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. 120 Main Road, Green Point, Cape Town"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Professional Bio &amp; Summary
              </label>
              <textarea
                rows={3}
                placeholder="Tell hirers about your work experience, capabilities, and availability..."
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                className="w-full text-xs font-medium p-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Skills (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Reliable, Certified, First Aid, Equipment Owner"
                value={formSkills}
                onChange={(e) => setFormSkills(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Complete Sign Up &amp; Go Live</span>
            </button>
          </form>
            )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 2: REAL SIGNED-UP USER PROFILE VIEW
  // =========================================================================
  return (
    <div className="h-full w-full bg-white overflow-y-auto pb-28 select-text">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-3">

        {/* Sticky Header Container (Fixed / Non-Moving at top) */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md pt-3 pb-3 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200 shadow-xs">
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>User Profile</span>
              <span className="text-[10px] text-slate-400 font-normal">Credentials &amp; Skills</span>
            </h1>
          </div>
        </div>



        {/* Facebook-Style Profile Header (WITHOUT BACKCOVER) */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-3">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              
              {/* BIG USER PROFILE PICTURE LOGO */}
              <div className="relative group flex-shrink-0">
                <img
                  src={avatar}
                  alt={fullName}
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-slate-100"
                />
                
                {/* Online indicator */}
                <div
                  className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-5 h-5 rounded-full border-3 border-white shadow-xs ${isSeekerLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
                  title={isSeekerLive ? 'Live Seeker' : 'Offline'}
                />

                {/* Floating Edit Profile Icon next to Profile Picture Logo */}
                <button
                  type="button"
                  onClick={isLocked ? handleUnlockProfile : handleSaveProfile}
                  className="absolute -top-1 -right-1 sm:top-1 sm:right-1 p-2.5 rounded-full bg-slate-900 hover:bg-black text-white shadow-xl border-2 border-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer z-20 flex items-center justify-center group"
                  title={isLocked ? "Edit Profile" : "Save Profile"}
                  aria-label={isLocked ? "Edit Profile" : "Save Profile"}
                >
                  {isLocked ? (
                    <Edit3 className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
                  ) : (
                    <Save className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                  )}
                </button>

                {!isLocked && (
                  <button
                    onClick={() => {
                      const newUrl = prompt('Enter image URL for profile picture:', avatar);
                      if (newUrl && newUrl.trim()) setAvatar(newUrl.trim());
                    }}
                    className="absolute inset-0 m-auto w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer backdrop-blur-xs"
                    title="Change Profile Picture Logo"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Names, Working Trade & Hourly Rate Header */}
              <div className="space-y-1.5 flex-1 min-w-0">
                {isLocked ? (
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {fullName}
                      </h1>
                      <span title="Verified Real Account">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                      </span>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-700 font-bold text-sm sm:text-base mt-0.5">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <span>{workingTrade}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-700 font-black">R{hourlyRate}/hr</span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{address}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name *"
                        className="text-xs font-bold p-2.5 rounded-xl border border-slate-300"
                      />
                      <input
                        type="text"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="Middle Name"
                        className="text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                      />
                      <input
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        placeholder="Surname *"
                        className="text-xs font-bold p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={workingTrade}
                        onChange={(e) => setWorkingTrade(e.target.value)}
                        className="text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
                      >
                        {COMMON_TRADES.map((trade) => (
                          <option key={trade} value={trade}>{trade}</option>
                        ))}
                      </select>

                      <div className="relative flex items-center">
                        <span className="text-xs font-bold text-slate-400 absolute left-3">R</span>
                        <input
                          type="number"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          placeholder="Hourly Rate"
                          className="w-full text-xs font-bold pl-7 pr-3 py-2.5 rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Location / Address"
                        className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoDetectAddress('profile')}
                        className="p-2.5 rounded-xl border border-slate-300 text-indigo-600 hover:bg-slate-50 cursor-pointer"
                        title="Auto-detect address"
                      >
                        <LocateFixed className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (About, Experience, Posts, Contact) */}
        <div className="flex items-center border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            About &amp; Overview
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'experience'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Work Experience &amp; References ({experiences.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'posts'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Contact Details
          </button>
        </div>

        {/* TAB 1: ABOUT */}
        {activeTab === 'about' && (
          <div className="space-y-4 pt-2">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">About {firstName}</h3>
              {isLocked ? (
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {bio || 'No bio provided yet.'}
                </p>
              ) : (
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs font-medium p-3 rounded-xl border border-slate-300"
                  placeholder="Tell hirers about your background..."
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 2: WORK EXPERIENCES & REFERENCES */}
        {activeTab === 'experience' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                Verified Work Experience &amp; Professional References
              </h3>
              {!isLocked && (
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              )}
            </div>

            {experiences.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                No work experiences added yet. Click &quot;Edit Profile&quot; to add your references.
              </div>
            ) : (
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">{exp.role}</span>
                      <span className="text-[10px] text-slate-400">{exp.duration}</span>
                    </div>
                    <div className="text-xs text-indigo-600 font-bold">{exp.organization}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">Reference:</span> {exp.referenceName} • {exp.referenceContact}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: POSTS */}
        {activeTab === 'posts' && (
          <div className="space-y-4 pt-2">
            <form onSubmit={handleAddPost} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <textarea
                rows={2}
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder={`Share an update or availability, ${firstName}...`}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newPostText.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
                >
                  Post Update
                </button>
              </div>
            </form>

            {posts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                No posts shared yet. Create your first timeline update above!
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center gap-2">
                      <img src={post.avatar} alt={post.author} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">{post.author}</div>
                        <div className="text-[10px] text-slate-400">{post.time}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CONTACT */}
        {activeTab === 'contact' && (
          <div className="space-y-4 pt-2">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900">{phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-900">{email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-700">{address}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
