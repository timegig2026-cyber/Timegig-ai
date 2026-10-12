/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GigsMap, GigsMapRef } from './components/GigsMap';
import { TopSearchBar } from './components/TopSearchBar';
import { ZoomControls } from './components/ZoomControls';
import { UserLocationButton } from './components/UserLocationButton';
import { MapTypeButton } from './components/MapTypeButton';
import { GigCardDrawer } from './components/GigCardDrawer';
import { PostView } from './components/PostView';
import { SeekersView } from './components/SeekersView';
import { ProfileView } from './components/ProfileView';
import { ActivationView } from './components/ActivationView';
import { TenantPortalView } from './components/TenantPortalView';
import { AdminPortalView } from './components/AdminPortalView';
import { calculateDistanceKm } from './data/mockGigs';
import { Gig, UserLocation, GigFilters, ActiveTab, SeekerProfile, NavigationRoute, RegisteredUser } from './types';
import { getCurrentUser, getRegisteredUsers, getLiveSeekers, saveRegisteredUser, updateUserLiveStatus, setCurrentUser as persistCurrentUser, addRealActivity, getCapturedReferralCode, saveTenantReferral, saveAdminReferral } from './utils/userStorage';
import { SeekerProfileModal } from './components/SeekerProfileModal';
import { HiringModal } from './components/HiringModal';
import { MapPin, CheckCircle2, AlertCircle, Plus, Menu, X, Users, Compass, CircleUserRound, Building2, ShieldCheck, UserPlus, HelpCircle, Info, Settings, LogOut, ArrowLeft, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('gigs');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  
  // Real registered users & active session state (NO MOCK USERS)
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(() => getCurrentUser());
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => getRegisteredUsers());
  const [isSeekerLive, setIsSeekerLive] = useState<boolean>(() => currentUser?.isLive || false);

  // Real live seeker constructed strictly from the real signed-up user
  const liveSeeker: SeekerProfile | null = useMemo(() => {
    if (!currentUser) return null;
    return {
      id: currentUser.id,
      name: currentUser.name,
      firstName: currentUser.firstName,
      middleName: currentUser.middleName,
      surname: currentUser.surname,
      role: currentUser.role,
      avatar: currentUser.avatar,
      rating: currentUser.rating,
      reviewsCount: currentUser.reviewsCount,
      hourlyRate: currentUser.hourlyRate,
      location: currentUser.location,
      phone: currentUser.phone,
      email: currentUser.email,
      bio: currentUser.bio,
      skills: currentUser.skills,
      isAvailable: currentUser.isAvailable,
      completedGigs: currentUser.completedGigs,
      latitude: currentUser.latitude,
      longitude: currentUser.longitude,
      socialLinks: currentUser.socialLinks,
      experiences: currentUser.experiences,
    };
  }, [currentUser]);

  // All live seekers who signed up and activated "Go Live"
  const liveSeekers: SeekerProfile[] = useMemo(() => {
    return getLiveSeekers();
  }, [registeredUsers, isSeekerLive]);

  // All registered seekers
  const allSeekers: SeekerProfile[] = useMemo(() => {
    return registeredUsers.map(u => ({
      id: u.id,
      name: u.name,
      firstName: u.firstName,
      middleName: u.middleName,
      surname: u.surname,
      role: u.role,
      avatar: u.avatar,
      rating: u.rating,
      reviewsCount: u.reviewsCount,
      hourlyRate: u.hourlyRate,
      location: u.location,
      phone: u.phone,
      email: u.email,
      bio: u.bio,
      skills: u.skills,
      isAvailable: u.isAvailable,
      completedGigs: u.completedGigs,
      latitude: u.latitude,
      longitude: u.longitude,
      socialLinks: u.socialLinks,
      experiences: u.experiences,
      isLive: u.isLive,
    }));
  }, [registeredUsers]);

  const [selectedSeekerProfile, setSelectedSeekerProfile] = useState<SeekerProfile | null>(null);
  const [isHiringModalOpen, setIsHiringModalOpen] = useState<boolean>(false);
  const [activeNavigation, setActiveNavigation] = useState<NavigationRoute | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(14);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [savedGigs, setSavedGigs] = useState<Gig[]>([]);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'warn' } | null>(null);

  const [filters, setFilters] = useState<GigFilters>({
    category: 'all',
    minPay: 0,
    maxPay: 1000,
    payType: 'all',
    maxDistanceKm: 30,
    onlyUrgent: false,
    searchQuery: '',
  });

  const mapRef = useRef<GigsMapRef>(null);

  // Capture referral code from URL query parameter (e.g. ?ref=admin)
  useEffect(() => {
    getCapturedReferralCode();
    locateUser();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle Geolocation to show user location on the map
  const locateUser = () => {
    if (!navigator.geolocation) {
      setToastMessage({
        text: 'Geolocation is not supported by your browser.',
        type: 'warn',
      });
      return;
    }

    setIsLocating(true);
    setToastMessage({ text: 'Locating your current GPS position...', type: 'info' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const newUserLoc: UserLocation = {
          latitude,
          longitude,
          accuracy,
          timestamp: pos.timestamp,
        };
        setUserLocation(newUserLoc);
        setMapCenter([latitude, longitude]);

        // Fly map smoothly to user location with zoom 15
        if (mapRef.current && Number.isFinite(latitude) && Number.isFinite(longitude)) {
          mapRef.current.flyTo(latitude, longitude, 15);
        }

        setToastMessage({
          text: 'Located! Showing your position on the map.',
          type: 'success',
        });
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        setToastMessage({
          text: 'Could not access GPS. Please allow location permissions.',
          type: 'warn',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Search location via geocoding
  const handleSearchLocation = (lat: number, lng: number, placeName: string) => {
    setMapCenter([lat, lng]);
    if (mapRef.current && Number.isFinite(lat) && Number.isFinite(lng)) {
      mapRef.current.flyTo(lat, lng, 14);
    }

    setToastMessage({ text: `Navigated to ${placeName}`, type: 'info' });
  };

  // Filtered Gigs based on query, category, pay rate, urgent status
  const filteredGigs = useMemo(() => {
    return gigs.filter((gig) => {
      // Category filter
      if (filters.category !== 'all' && gig.category !== filters.category) {
        return false;
      }
      // Urgent filter
      if (filters.onlyUrgent && !gig.isUrgent) {
        return false;
      }
      // Pay Type
      if (filters.payType !== 'all' && gig.payType !== filters.payType) {
        return false;
      }
      // Min Pay
      if (gig.pay < filters.minPay) {
        return false;
      }
      // Search text query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = gig.title.toLowerCase().includes(q);
        const matchOrg = gig.organizer.toLowerCase().includes(q);
        const matchAddr = gig.address.toLowerCase().includes(q);
        const matchTags = gig.tags.some((t) => t.toLowerCase().includes(q));
        const matchCat = gig.categoryLabel.toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchAddr && !matchTags && !matchCat) {
          return false;
        }
      }
      // Distance filter if user location is set
      if (userLocation) {
        const dist = calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          gig.latitude,
          gig.longitude
        );
        if (dist > filters.maxDistanceKm) {
          return false;
        }
      }

      return true;
    });
  }, [gigs, filters, userLocation]);

  // Bookmark / Save GiG
  const toggleSaveGig = (gig: Gig) => {
    setSavedGigs((prev) => {
      const exists = prev.some((g) => g.id === gig.id);
      if (exists) {
        return prev.filter((g) => g.id !== gig.id);
      } else {
        setToastMessage({ text: 'GiG saved to bookmarks', type: 'success' });
        return [...prev, gig];
      }
    });
  };

  // Create & Publish a new GiG
  const handlePostGig = (newGig: Gig) => {
    setGigs((prev) => [newGig, ...prev]);
    setSelectedGig(newGig);
    setActiveTab('gigs');
    if (mapRef.current && Number.isFinite(newGig.latitude) && Number.isFinite(newGig.longitude)) {
      mapRef.current.flyTo(newGig.latitude, newGig.longitude, 16);
    }
    setToastMessage({ text: 'GiG posted! Pinned on the map.', type: 'success' });
  };

  // Start Hiring Flow: opens circle loading modal
  const handleStartHiring = (seeker: SeekerProfile) => {
    setSelectedSeekerProfile(seeker);
    setIsHiringModalOpen(true);
  };

  // Seeker Accepts: directs immediately to map navigation starting from seeker exact location to user destination
  const handleSeekerAccepted = () => {
    setIsHiringModalOpen(false);
    setSelectedSeekerProfile(null); // Don't show seeker profile when seeker accepts user gig
    const seeker = selectedSeekerProfile || liveSeeker;
    if (!seeker) return;

    const seekerLat = seeker.latitude || 37.7749;
    const seekerLng = seeker.longitude || -122.4194;

    // Destination: Selected gig location or user location or default destination point
    const destLat = selectedGig?.latitude || userLocation?.latitude || 37.7885;
    const destLng = selectedGig?.longitude || userLocation?.longitude || -122.4072;
    const destName = selectedGig ? selectedGig.title : (userLocation?.city || 'User Destination');

    const dist = calculateDistanceKm(seekerLat, seekerLng, destLat, destLng);
    const estMinutes = Math.max(2, Math.round(dist * 3));

    const newRoute: NavigationRoute = {
      seekerLocation: [seekerLat, seekerLng],
      seekerName: seeker.name,
      seekerRole: seeker.role,
      seekerAvatar: seeker.avatar,
      userDestination: [destLat, destLng],
      destinationName: destName,
      distanceKm: parseFloat(dist.toFixed(1)),
      estimatedMinutes: estMinutes,
      currentStepIndex: 0,
      instructions: [
        `${seeker.name} has accepted your gig! Navigating from exact seeker location to your destination (${destName}).`,
        `Route distance: ${dist.toFixed(1)} km (~${estMinutes} mins). Follow map guidance.`
      ],
      isNavigating: true,
    };

    setActiveNavigation(newRoute);
    setActiveTab('gigs'); // Direct user immediately to the Map feature!
    setToastMessage({
      text: `🎉 ${seeker.name} accepted! Navigating from seeker exact location to destination.`,
      type: 'success',
    });

    // Record real activity & live platform booking profit (15% platform commission)
    const gigTotal = (seeker.hourlyRate || 220) * 2;
    const gigProfit = parseFloat((gigTotal * 0.15).toFixed(2));
    addRealActivity({
      userId: seeker.id,
      userName: seeker.name,
      userAvatar: seeker.avatar,
      userRole: seeker.role,
      activityType: 'gig_completed',
      description: `Dispatched to ${destName} for urgent callout`,
      location: destName,
      amount: gigTotal,
      profit: gigProfit,
      status: 'Completed',
    });
  };

  const handleLogin = (email: string) => {
    const users = getRegisteredUsers();
    const user = users.find(u => u.email === email.trim());
    if (user) {
      persistCurrentUser(user);
      setCurrentUser(user);
      setIsSeekerLive(user.isLive);
      setToastMessage({ text: `Welcome back, ${user.name}!`, type: 'success' });
    } else {
      setToastMessage({ text: 'User not found. Please check your email or sign up.', type: 'warn' });
    }
  };

  const handleSignUp = (user: RegisteredUser) => {
    // Check if user arrived via referral link (?ref=admin or ?ref=tenant)
    const activeRef = getCapturedReferralCode();
    const isAdminRef = activeRef === 'admin';
    const isTenantRef = activeRef === 'tenant' || (activeRef && activeRef.startsWith('tenant'));

    const userWithRef: RegisteredUser = {
      ...user,
      referredBy: isAdminRef ? 'Admin' : isTenantRef ? 'Tenant' : user.referredBy,
      referredByType: isAdminRef ? 'admin' : isTenantRef ? 'tenant' : user.referredByType,
      referredAt: (isAdminRef || isTenantRef) ? new Date().toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }) : user.referredAt,
    };

    saveRegisteredUser(userWithRef);
    setCurrentUser(userWithRef);
    setRegisteredUsers(getRegisteredUsers());
    setIsSeekerLive(userWithRef.isLive);

    if (isAdminRef) {
      saveAdminReferral({
        id: `a-ref-${user.id}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        userAvatar: user.avatar,
        userRole: user.role || 'Platform Member',
        userLocation: user.location || 'South Africa',
        joinedDate: new Date().toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Active',
        referralCode: 'admin',
        verificationStatus: user.verificationStatus || 'Verified',
        isSubscribed: user.isSubscribed ?? false,
      });
      setToastMessage({
        text: `Welcome ${user.name}! You've joined through the Admin referral link.`,
        type: 'success',
      });
    } else if (isTenantRef) {
      saveTenantReferral({
        id: `t-ref-${user.id}`,
        userId: user.id,
        name: user.name,
        role: user.role || 'Commercial Hub Member',
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        location: user.location || 'Cape Town Commercial Precinct',
        joinedDate: new Date().toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Active',
        completedGigs: 0,
        tenantAssigned: 'Commercial Tenant Hub',
        unitAssigned: 'Unit 1A',
        notes: 'Joined via Tenant referral link',
      });
      setToastMessage({
        text: `Welcome ${user.name}! You've joined through the Tenant referral link.`,
        type: 'success',
      });
    } else {
      setToastMessage({
        text: `Welcome ${user.name}! Your account is registered & live as a seeker.`,
        type: 'success',
      });
    }

    // Record real user registration activity (profile registration is free)
    addRealActivity({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userRole: user.role,
      activityType: 'registration',
      description: `Registered verified profile on TimeGig as ${user.role}`,
      location: user.location,
      amount: 0,
      profit: 0,
      status: 'Completed',
    });
  };

  const handleToggleSeekerLive = () => {
    if (!currentUser) {
      setActiveTab('profile');
      setToastMessage({
        text: 'Please sign up or register your profile to go live as a seeker.',
        type: 'warn',
      });
      return;
    }

    const nextState = !isSeekerLive;
    setIsSeekerLive(nextState);
    const updated = updateUserLiveStatus(currentUser.id, nextState);
    if (updated) {
      setCurrentUser(updated);
      setRegisteredUsers(getRegisteredUsers());
    }

    // Record real radar activity event
    addRealActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      activityType: 'go_live',
      description: nextState ? 'Activated LIVE Seeker Radar Beacon on GiGs Map' : 'Deactivated live radar beacon',
      location: currentUser.location,
      amount: 0,
      profit: 0,
      status: nextState ? 'Live' : 'Completed',
    });

    setToastMessage({
      text: nextState
        ? `${currentUser.name} is now LIVE on the map! Hirers can view your location.`
        : `${currentUser.name} is now OFFLINE. Live marker removed from the map.`,
      type: nextState ? 'success' : 'info',
    });
  };

  const handleSignOut = () => {
    persistCurrentUser(null);
    setCurrentUser(null);
    setIsSeekerLive(false);
    setToastMessage({
      text: 'Signed out successfully.',
      type: 'info',
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white text-slate-900 relative">
      {/* Floating 3-Bar Menu Button and Menu Popup */}
      {activeTab !== 'help' && activeTab !== 'about' && activeTab !== 'tenantportal' && activeTab !== 'admin' && activeTab !== 'post' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white/20 backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl p-5 w-[90vw] max-w-sm text-slate-900 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-end pb-2 mb-3 border-b border-slate-100">
                <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors border border-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {/* 1. Signup / Signin */}
                <button
                  onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 hover:bg-white/70 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-sm hover:shadow-xl hover:scale-105"
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">Sign Up</span>
                </button>

                {/* 2. GiGs */}
                <button
                  onClick={() => { setActiveTab('gigs'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 hover:bg-white/70 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-sm hover:shadow-xl hover:scale-105"
                >
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">GiGs</span>
                </button>

                {/* 3. Seekers */}
                <button
                  onClick={() => { setActiveTab('seekers'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 hover:bg-white/70 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-sm hover:shadow-xl hover:scale-105"
                >
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-800">Seekers</span>
                </button>

                {/* 4. Profile */}
                <button
                  onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 hover:bg-white/70 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-sm hover:shadow-xl hover:scale-105"
                >
                  <CircleUserRound className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-slate-800">Profile</span>
                </button>

                {/* 5. Tenant */}
                <button
                  onClick={() => { setActiveTab('tenantportal'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 hover:bg-white/70 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-sm hover:shadow-xl hover:scale-105"
                >
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800">Tenant</span>
                </button>

                {/* 6. Admin (Visible only to timegig2026@gmail.com) */}
                {currentUser?.email === 'timegig2026@gmail.com' && (
                  <button
                    onClick={() => { setActiveTab('admin'); setIsMenuOpen(false); }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 hover:bg-white/70 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-sm hover:shadow-xl hover:scale-105"
                  >
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-800">Admin</span>
                  </button>
                )}

                {/* 7. Help */}
                <button
                  onClick={() => { setActiveTab('help'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 hover:bg-white/70 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-sm hover:shadow-xl hover:scale-105"
                >
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">Help</span>
                </button>

                {/* 8. About */}
                <button
                  onClick={() => { setActiveTab('about'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 hover:bg-white/70 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-sm hover:shadow-xl hover:scale-105"
                >
                  <Info className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-800">About</span>
                </button>

                {/* 9. Logout */}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-100/40 hover:bg-red-200/50 transition-all duration-300 border border-red-200/30 hover:border-red-300/40 shadow-sm hover:shadow-xl hover:scale-105"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold text-slate-800">Logout</span>
                </button>
                {/* 10. Activation */}
                <button
                  onClick={() => { setActiveTab('activation'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 hover:bg-white/70 transition-all duration-300 border border-white/20 hover:border-white/40 shadow-sm hover:shadow-xl hover:scale-105"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800">Activation</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* 3-Bar Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-14 h-14 bg-slate-900/80 backdrop-blur-sm hover:bg-slate-900 text-white rounded-full shadow-2xl shadow-indigo-500/50 border-2 border-cyan-400/60 cursor-pointer transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
          title="Open Menu"
          aria-label="Open Menu"
        >
          <div className="flex flex-col justify-center items-center gap-1.5 w-6 h-6 group-hover:rotate-90 transition-transform duration-300">
            <span className={`h-0.5 w-5 rounded-full transition-all duration-200 ${isMenuOpen ? 'bg-cyan-400 rotate-45 translate-y-2' : 'bg-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]'}`} />
            <span className={`h-0.5 w-5 rounded-full transition-all duration-200 ${isMenuOpen ? 'opacity-0' : 'bg-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]'}`} />
            <span className={`h-0.5 w-5 rounded-full transition-all duration-200 ${isMenuOpen ? 'bg-cyan-400 -rotate-45 -translate-y-2' : 'bg-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]'}`} />
          </div>
        </button>
      </div>
      )}
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`px-4 py-2 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
                : toastMessage.type === 'warn'
                ? 'bg-amber-600 text-white border-amber-500 shadow-amber-600/20'
                : 'bg-slate-900 text-white border-slate-800 shadow-slate-900/20'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            {toastMessage.type === 'warn' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {toastMessage.type === 'info' && <MapPin className="w-4 h-4 flex-shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
        {/* 1. GiGs Feature View (Full-Screen Map with top search bar, zoom, and user location) */}
        {activeTab === 'gigs' ? (
          <div className="w-full h-full relative bg-white">
            {/* Top Search Bar */}
            <TopSearchBar
              filters={filters}
              onFiltersChange={setFilters}
              onSearchLocation={handleSearchLocation}
              gigsCount={filteredGigs.length}
              onCreateGig={() => setActiveTab('post')}
            />

            {/* The Full-Screen Map */}
            <GigsMap
              ref={mapRef}
              gigs={filteredGigs}
              selectedGig={selectedGig}
              userLocation={userLocation}
              onSelectGig={setSelectedGig}
              onZoomChange={setCurrentZoom}
              mapCenter={mapCenter}
              zoomLevel={currentZoom}
              mapType={mapType}
              isSeekerLive={isSeekerLive}
              activeNavigation={activeNavigation}
              currentUser={currentUser}
              onHireSeeker={handleStartHiring}
              onViewSeekerProfile={(seeker) => setSelectedSeekerProfile(seeker)}
            />

            {/* Floating Zoom & Controls Group (Right Edge) */}
            <div className="absolute bottom-24 right-3 sm:right-6 z-30 flex flex-col items-end gap-3 pointer-events-auto">
              {/* Satellite / Street Map Toggle Button */}
              <MapTypeButton
                isSatellite={mapType === 'satellite'}
                onToggle={() =>
                  setMapType((prev) => (prev === 'street' ? 'satellite' : 'street'))
                }
              />

              {/* User Location Button ("show user location on the map") */}
              <UserLocationButton
                userLocation={userLocation}
                isLocating={isLocating}
                onLocateUser={locateUser}
              />

              {/* Zoom Controls Feature */}
              <ZoomControls
                currentZoom={currentZoom}
                onZoomIn={() => mapRef.current?.zoomIn()}
                onZoomOut={() => mapRef.current?.zoomOut()}
              />
            </div>

            {/* Map Counter pill at bottom-left only if gigs exist */}
            {filteredGigs.length > 0 && (
              <div className="absolute bottom-24 left-3 sm:left-6 z-20 pointer-events-none hidden sm:block">
                <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/90 shadow-md text-[11px] font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{filteredGigs.length} GiGs on map</span>
                </div>
              </div>
            )}

            {/* Gig Details Drawer Card */}
            <GigCardDrawer
              gig={selectedGig}
              onClose={() => setSelectedGig(null)}
              onSaveGig={toggleSaveGig}
              isSaved={selectedGig ? savedGigs.some((g) => g.id === selectedGig.id) : false}
            />
          </div>
        ) : activeTab === 'seekers' ? (
          /* Seekers View with Real Signed-Up Live Seekers Only */
          <SeekersView
            filters={filters}
            onFiltersChange={setFilters}
            onSearchLocation={handleSearchLocation}
            isSeekerLive={isSeekerLive}
            onToggleSeekerLive={handleToggleSeekerLive}
            liveSeeker={liveSeeker}
            liveSeekers={liveSeekers}
            allSeekers={allSeekers}
            onViewSeekerProfile={(seeker) => {
              setSelectedSeekerProfile(seeker);
            }}
            onHireSeeker={(seeker) => {
              handleStartHiring(seeker);
            }}
            onGoToProfile={() => setActiveTab('profile')}
          />
        ) : activeTab === 'post' ? (
          /* Post a GiG View */
          <PostView
            onPostGig={handlePostGig}
            onGoToMap={() => setActiveTab('gigs')}
            currentCenter={mapCenter}
            userLocation={userLocation}
          />
        ) : activeTab === 'profile' ? (
          /* Real User Profile View (Register or Manage Real Account) */
          <ProfileView
            currentUser={currentUser}
            onSignUp={handleSignUp}
            onLogin={handleLogin}
            onProfileUpdate={(updated) => {
              if (currentUser) {
                const updatedUser: RegisteredUser = {
                  ...currentUser,
                  ...updated,
                  name: updated.name || currentUser.name,
                  role: updated.role || currentUser.role,
                  hourlyRate: updated.hourlyRate !== undefined ? updated.hourlyRate : currentUser.hourlyRate,
                };
                saveRegisteredUser(updatedUser);
                setCurrentUser(updatedUser);
                setRegisteredUsers(getRegisteredUsers());
              }
              setToastMessage({ text: 'Profile saved & updated in real seeker directory!', type: 'success' });
            }}
            onHireSeeker={() => {
              if (liveSeeker) handleStartHiring(liveSeeker);
            }}
            isSeekerLive={isSeekerLive}
            onToggleSeekerLive={handleToggleSeekerLive}
            onSignOut={handleSignOut}
            onGoToTenantPortal={() => setActiveTab('tenantportal')}
            onGoToAdmin={() => setActiveTab('admin')}
          />
        ) : activeTab === 'activation' ? (
          <ActivationView />
        ) : activeTab === 'admin' ? (
          /* Admin Portal */
          <AdminPortalView onBackToProfile={() => { setActiveTab('gigs'); setIsMenuOpen(true); }} />
        ) : activeTab === 'tenantportal' ? (
          /* TenantPortal */
          <TenantPortalView onBackToProfile={() => { setActiveTab('gigs'); setIsMenuOpen(true); }} />
        ) : activeTab === 'help' ? (
          /* Full Screen Help View */
          <div className="h-full w-full bg-white text-slate-900 flex flex-col relative z-30 overflow-y-auto p-6 sm:p-10">
            <div className="max-w-2xl mx-auto w-full">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
                <button
                  onClick={() => { setActiveTab('gigs'); setIsMenuOpen(true); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-2 border border-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Menu Bar</span>
                </button>
                <div className="flex items-center gap-2 text-indigo-600">
                  <HelpCircle className="w-6 h-6" />
                  <span className="text-sm font-black tracking-wider uppercase">Help & Support</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-xl font-black text-slate-900 mb-2">Welcome to TimeGig Help Center</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    TimeGig connects local communities with skilled service providers, handymen, tutors, delivery workers, and clients in real-time. Here is how to make the most of the app:
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-indigo-600 mb-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-bold">1</span>
                      <span>Sign Up & Registration</span>
                    </h3>
                    <p className="text-xs text-slate-600">
                      Users must register first in the profile / sign-up screen. Create your real account with your name, phone number, role, and hourly rate to start offering or requesting services.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-indigo-600 mb-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-bold">2</span>
                      <span>Exploring GiGs on the Map</span>
                    </h3>
                    <p className="text-xs text-slate-600">
                      All active gigs appear on the map in the GiGs feature. Tap any marker to view detailed requirements, organizer info, pay rates, and instantly apply or hire.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-indigo-600 mb-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-bold">3</span>
                      <span>Going Live as a Seeker</span>
                    </h3>
                    <p className="text-xs text-slate-600">
                      Toggle "Go Live" in your profile or Seekers feature to broadcast your live GPS location to nearby clients looking for immediate help.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-indigo-600 mb-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-bold">4</span>
                      <span>Contact Support</span>
                    </h3>
                    <p className="text-xs text-slate-600">
                      Need urgent assistance? Contact our 24/7 support desk at <strong className="text-slate-900">support@timegig.co.za</strong> or via WhatsApp support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Full Screen About View */
          <div className="h-full w-full bg-white text-slate-900 flex flex-col relative z-30 overflow-y-auto p-6 sm:p-10">
            <div className="max-w-2xl mx-auto w-full">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
                <button
                  onClick={() => { setActiveTab('gigs'); setIsMenuOpen(true); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-2 border border-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Menu Bar</span>
                </button>
                <div className="flex items-center gap-2 text-purple-600">
                  <Info className="w-6 h-6" />
                  <span className="text-sm font-black tracking-wider uppercase">About TimeGig</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-100 rounded-3xl p-6 shadow-sm text-center">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-600 mx-auto mb-4 flex items-center justify-center shadow-md text-white">
                    <Compass className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">TimeGig v2.4</h2>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
                    TimeGig is South Africa & global community's premier real-time local services and gig economy platform. Designed to instantly connect skilled independent workers, handymen, tutors, cleaners, professionals, and clients based on precise GPS location and real-time availability.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-purple-700 mb-2">⚡ Real-Time Geospatial</h3>
                    <p className="text-xs text-slate-600">
                      Powered by high-precision GPS radar, enabling seekers to go live and clients to discover instant help nearby.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-purple-700 mb-2">🛡️ Trusted & Verified</h3>
                    <p className="text-xs text-slate-600">
                      Every registered user and gig organizer is verified with rating reviews and secure profile management.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm text-center text-xs text-slate-500">
                  © 2026 TimeGig Technologies. All rights reserved. Built for seamless community empowerment.
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Seeker Profile Modal (Directed when user clicks seeker listing in Seekers feature) */}
      <SeekerProfileModal
        isOpen={!!selectedSeekerProfile && !isHiringModalOpen}
        seeker={selectedSeekerProfile}
        onClose={() => setSelectedSeekerProfile(null)}
        onHire={(seeker) => {
          setSelectedSeekerProfile(seeker);
          handleStartHiring(seeker);
        }}
      />

      {/* Circle Loading Hiring Modal (Waiting for seeker to accept) */}
      <HiringModal
        isOpen={isHiringModalOpen}
        seeker={selectedSeekerProfile || liveSeeker}
        onClose={() => setIsHiringModalOpen(false)}
        onAccepted={handleSeekerAccepted}
      />

    </div>
  );
}
