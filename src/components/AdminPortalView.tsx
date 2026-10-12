import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  ShieldCheck, 
  FileText, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  ExternalLink,
  Users,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  AlertCircle,
  Building2,
  Crown,
  Share2,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Link2,
  UserPlus,
  UserCheck2,
  X
} from 'lucide-react';
import { RegisteredUser, TenantPoPRecord, TenantLeaseRecord } from '../types';
import { 
  getRegisteredUsers, 
  updateUserVerificationStatus, 
  getTenantPoPs, 
  updateTenantPoPStatus, 
  getUserPoPs, 
  updateUserPoPStatus,
  UserPoPRecord,
  getRealTenants,
  getTenantLeases,
  RealTenantRecord,
  getAdminReferrals,
  saveAdminReferral,
  updateAdminReferral,
  removeAdminReferral,
  AdminReferralRecord,
  registerUserViaReferral
} from '../utils/userStorage';

interface AdminPortalViewProps {
  onBackToProfile?: () => void;
}

type AdminSubTab = 'overview' | 'verification' | 'tenantpop' | 'userpop' | 'active-tenants' | 'active-subscriptions' | 'referrals';

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ onBackToProfile }) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Real data state
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [tenantPops, setTenantPops] = useState<TenantPoPRecord[]>([]);
  const [userPops, setUserPops] = useState<UserPoPRecord[]>([]);
  const [realTenants, setRealTenants] = useState<RealTenantRecord[]>([]);
  const [tenantLeases, setTenantLeases] = useState<TenantLeaseRecord[]>([]);
  const [adminReferrals, setAdminReferrals] = useState<AdminReferralRecord[]>([]);

  // Referral UI state
  const [referralSearch, setReferralSearch] = useState('');
  const [referralFilter, setReferralFilter] = useState<'all' | 'Active' | 'Pending Review' | 'Suspended'>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  // Add Referral Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('Service Specialist');
  const [formLocation, setFormLocation] = useState('Cape Town, Western Cape');
  const [formNotes, setFormNotes] = useState('Direct onboarding via Admin Referral');

  // Load real records
  const refreshData = () => {
    setRegisteredUsers(getRegisteredUsers());
    setTenantPops(getTenantPoPs());
    setUserPops(getUserPoPs());
    setRealTenants(getRealTenants());
    setTenantLeases(getTenantLeases());
    setAdminReferrals(getAdminReferrals());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Verification handling on real users
  const handleVerifyUser = (userId: string, status: 'Verified' | 'Rejected') => {
    updateUserVerificationStatus(userId, status);
    refreshData();
  };

  // Tenant PoP handling on real records
  const handleTenantPoP = (id: string, status: 'Approved' | 'Review') => {
    updateTenantPoPStatus(id, status);
    refreshData();
  };

  // User PoP handling on real records
  const handleUserPoP = (id: string, status: 'Approved' | 'Disputed') => {
    updateUserPoPStatus(id, status);
    refreshData();
  };

  // Filtered lists
  const filteredUsers = registeredUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.location.toLowerCase().includes(q)
    );
  });

  const pendingUsersCount = registeredUsers.filter(
    (u) => (u.verificationStatus || 'Pending') === 'Pending'
  ).length;

  const verifiedUsersCount = registeredUsers.filter(
    (u) => u.verificationStatus === 'Verified'
  ).length;

  const totalTenantPoPVolume = tenantPops
    .filter((p) => p.status === 'Approved')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Active tenants calculation (real tenants with status Active + active leases)
  const activeTenantsList = realTenants.filter((t) => t.status === 'Active');
  const activeLeasesList = tenantLeases.filter((l) => l.status === 'Active');
  const totalActiveTenantsCount = activeTenantsList.length + activeLeasesList.length;
  const totalTenantMonthlyRevenue = 
    activeTenantsList.reduce((sum, t) => sum + (t.monthlySubscription || 0), 0) +
    activeLeasesList.reduce((sum, l) => sum + (l.rent || 0), 0);

  // Active subscriptions calculation
  const activeSubscribersList = registeredUsers.filter((u) => u.isSubscribed);
  const totalSubscriberMonthlyRevenue = activeSubscribersList.reduce(
    (sum, u) => sum + (u.subscriptionAmount || 29.99),
    0
  );

  // Referral links & management handlers
  const adminReferralLink = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?ref=admin`
    : 'https://timegig.app/?ref=admin';

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(adminReferralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join TimeGiG - Admin Referral Link',
          text: 'Join TimeGiG through my official Admin Referral link to be directly verified and managed.',
          url: adminReferralLink,
        });
        return;
      } catch {
        // user aborted share
      }
    }
    handleCopyLink();
  };

  const handleCreateReferralUser = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;
    registerUserViaReferral('admin', {
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      location: formLocation,
      notes: formNotes,
      initialStatus: 'Active',
      verificationStatus: 'Verified',
      isSubscribed: false,
    });
    setIsAddModalOpen(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    refreshData();
  };

  const handleQuickSimulate = () => {
    const sampleNames = ['Kagiso Moeti', 'Bongani Sithole', 'Lerato Moloi', 'Thabo Khumalo', 'Zanele Dube'];
    const sampleRoles = ['Certified Electrician', 'Professional Mover', 'HVAC Technician', 'Fleet Driver', 'Event Security'];
    const randIdx = Math.floor(Math.random() * sampleNames.length);
    const name = sampleNames[randIdx];
    const email = `${name.toLowerCase().replace(' ', '.')}@example.co.za`;
    registerUserViaReferral('admin', {
      name,
      email,
      phone: '+27 83 ' + Math.floor(1000000 + Math.random() * 9000000),
      role: sampleRoles[randIdx],
      location: 'Johannesburg, Gauteng',
      notes: 'Simulated user joined through Admin referral link',
      initialStatus: 'Active',
      verificationStatus: 'Verified',
      isSubscribed: true,
    });
    refreshData();
  };

  const handleStatusChange = (id: string, status: 'Active' | 'Pending Review' | 'Suspended') => {
    updateAdminReferral(id, { status });
    refreshData();
  };

  const handleToggleVerification = (id: string, current?: 'Pending' | 'Verified' | 'Rejected') => {
    const next = current === 'Verified' ? 'Pending' : 'Verified';
    updateAdminReferral(id, { verificationStatus: next });
    refreshData();
  };

  const handleToggleSubscription = (id: string, current?: boolean) => {
    updateAdminReferral(id, { isSubscribed: !current });
    refreshData();
  };

  const handleSaveNotes = (id: string) => {
    updateAdminReferral(id, { notes: notesDraft });
    setEditingNotesId(null);
    refreshData();
  };

  const handleDeleteReferral = (id: string) => {
    removeAdminReferral(id);
    refreshData();
  };

  const filteredReferrals = adminReferrals.filter((r) => {
    const matchesFilter = referralFilter === 'all' || r.status === referralFilter;
    if (!matchesFilter) return false;
    if (!referralSearch.trim()) return true;
    const q = referralSearch.toLowerCase();
    return (
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      (r.userRole && r.userRole.toLowerCase().includes(q)) ||
      (r.userLocation && r.userLocation.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col relative select-text text-slate-900 pb-28 overflow-y-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {onBackToProfile && (
            <button
              onClick={onBackToProfile}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight">Admin Portal</h1>
              <p className="text-[10px] text-slate-500 font-medium">Real-Time Verification &amp; Control Hub</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live System Active
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6 space-y-6">
        {/* 1. OVERVIEW TAB */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Real Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Registered Users
                </div>
                <div className="text-xl font-black text-slate-900">{registeredUsers.length}</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                  {verifiedUsersCount} Verified
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Pending Review
                </div>
                <div className="text-xl font-black text-amber-600">{pendingUsersCount}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  {pendingUsersCount > 0 ? 'Review queue' : 'Clean queue'}
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tenant PoP Vol
                </div>
                <div className="text-xl font-black text-indigo-600">
                  R{totalTenantPoPVolume.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  {tenantPops.length} proofs
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  User PoP Pings
                </div>
                <div className="text-xl font-black text-purple-600">{userPops.length}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  Presence logs
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Active Tenants
                </div>
                <div className="text-xl font-black text-emerald-600">{totalActiveTenantsCount}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  R{totalTenantMonthlyRevenue.toLocaleString()}/mo
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Active Subs
                </div>
                <div className="text-xl font-black text-rose-600">{activeSubscribersList.length}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  R{totalSubscriberMonthlyRevenue.toLocaleString()}/mo
                </div>
              </div>

              <div 
                onClick={() => setActiveSubTab('referrals')}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs cursor-pointer hover:border-blue-300 transition-colors"
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Referred Users
                </div>
                <div className="text-xl font-black text-blue-600">{adminReferrals.length}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  {adminReferrals.filter(r => r.status === 'Active').length} Active
                </div>
              </div>
            </div>

            {/* Quick Referral Share Banner inside Overview */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/20">
                    Admin Referral Link
                  </span>
                  <span className="text-[11px] text-blue-200 font-mono">Code: admin</span>
                </div>
                <h3 className="text-sm font-bold text-white">Share Your Direct Referral Link</h3>
                <p className="text-xs text-blue-200/90 max-w-xl">
                  Anyone who joins through your link is registered under your Admin supervision and managed by you.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-white text-blue-950 hover:bg-blue-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={() => setActiveSubTab('referrals')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Manage Referrals ({adminReferrals.length})</span>
                </button>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  onClick={() => setActiveSubTab('active-tenants')}
                  className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-emerald-900">Active Tenants ({totalActiveTenantsCount})</div>
                    <div className="text-[11px] text-slate-500">Commercial hub tenants &amp; leases</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div 
                  onClick={() => setActiveSubTab('active-subscriptions')}
                  className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 hover:bg-amber-50 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-900">Active Subs ({activeSubscribersList.length})</div>
                    <div className="text-[11px] text-slate-500">Manage user subscription plans</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div 
                  onClick={() => setActiveSubTab('referrals')}
                  className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-blue-900">Referral Link Hub ({adminReferrals.length})</div>
                    <div className="text-[11px] text-slate-500">Share link &amp; manage joins</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              </div>
        )}

        {/* 2. VERIFICATION TAB */}
        {activeSubTab === 'verification' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-sm font-black text-slate-900">Registered Users Verification Queue</h2>
                <p className="text-xs text-slate-500">Manage KYC and verified badges for live seekers and providers</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search registered users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-rose-500"
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto mb-3 flex items-center justify-center text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No Registered Users Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Users who sign up or create a profile on TimeGig will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredUsers.map((user) => {
                  const status = user.verificationStatus || 'Pending';
                  return (
                    <div
                      key={user.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={user.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{user.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                status === 'Verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {status}
                            </span>
                            {user.isSubscribed && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center gap-0.5">
                                <Crown className="w-3 h-3" /> Subscribed
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>{user.role}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {user.location || 'South Africa'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">{user.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleVerifyUser(user.id, 'Verified')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleVerifyUser(user.id, 'Rejected')}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 border border-slate-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. TENANT POP TAB */}
        {activeSubTab === 'tenantpop' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Tenant Proof of Payment (PoP) Registry</h2>
                <p className="text-xs text-slate-500">Live bank receipts submitted by commercial and lease tenants</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                {tenantPops.length} Total Submissions
              </span>
            </div>

            {tenantPops.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-indigo-50 mx-auto mb-3 flex items-center justify-center text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No Tenant PoP Receipts Recorded</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Tenant proofs of payment uploaded in the Tenant Portal will appear here automatically for administrative verification.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {tenantPops.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.description}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Review'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span className="font-semibold text-slate-900">R{item.amount.toLocaleString()}</span>
                        <span>•</span>
                        <span>Ref: {item.reference}</span>
                        <span>•</span>
                        <span>{item.bank}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                      <div className="text-[10px] text-indigo-600 font-mono flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>Attachment: {item.fileName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTenantPoP(item.id, 'Approved')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Approve PoP
                      </button>
                      <button
                        onClick={() => handleTenantPoP(item.id, 'Review')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold cursor-pointer transition-colors border border-slate-200"
                      >
                        Flag Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. USER POP TAB */}
        {activeSubTab === 'userpop' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">User Proof of Presence (PoP) Logs</h2>
                <p className="text-xs text-slate-500">Live GPS check-ins and location attendance logs from active seekers</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
                {userPops.length} Total Check-ins
              </span>
            </div>

            {userPops.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-purple-50 mx-auto mb-3 flex items-center justify-center text-purple-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No User Presence Logs Recorded</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  When seekers or users perform presence check-ins within active geofences, their telemetry pings will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {userPops.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.userName}</span>
                        <span className="text-[10px] text-slate-400">({item.userRole})</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">{item.gigTitle}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-3">
                        <span>Ref: {item.reference}</span>
                        <span>•</span>
                        <span>Logged: {item.date}</span>
                        <span>•</span>
                        <span>Telemetry: {item.fileName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUserPoP(item.id, 'Approved')}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Validate Ping
                      </button>
                      <button
                        onClick={() => handleUserPoP(item.id, 'Disputed')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold cursor-pointer transition-colors border border-slate-200"
                      >
                        Flag Anomaly
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. ACTIVE TENANTS TAB */}
        {activeSubTab === 'active-tenants' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Active Tenants</h2>
                <p className="text-xs text-slate-500">
                  {totalActiveTenantsCount} active commercial {totalActiveTenantsCount === 1 ? 'tenant' : 'tenants'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                Active Status Only
              </span>
            </div>

            {totalActiveTenantsCount === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-emerald-50 mx-auto mb-3 flex items-center justify-center text-emerald-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No Active Tenants</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  There are currently no active commercial tenants.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {activeTenantsList.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{tenant.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium">{tenant.businessType}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span className="font-bold text-slate-900">R{tenant.monthlySubscription.toLocaleString()} / mo</span>
                        <span>•</span>
                        <span>Joined: {tenant.joinedDate}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {activeLeasesList.map((lease) => (
                  <div
                    key={lease.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{lease.userName || 'Commercial Tenant'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {lease.property} • Unit {lease.unit}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span className="font-bold text-slate-900">Rent: R{lease.rent.toLocaleString()} / mo</span>
                        <span>•</span>
                        <span>Effective: {lease.startDate || 'Current'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. ACTIVE SUBSCRIPTION USERS TAB */}
        {activeSubTab === 'active-subscriptions' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Active Subscription Users</h2>
                <p className="text-xs text-slate-500">
                  {activeSubscribersList.length} active subscription {activeSubscribersList.length === 1 ? 'user' : 'users'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
                Active Status Only
              </span>
            </div>

            {activeSubscribersList.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-purple-50 mx-auto mb-3 flex items-center justify-center text-purple-600">
                  <Crown className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No Active Subscription Users</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Users with an active subscription plan will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {activeSubscribersList.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        alt={user.name}
                        className="w-12 h-12 rounded-xl object-cover border border-purple-200 shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{user.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Active Subscription
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{user.subscriptionPlan || 'User Subscription'}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-900">
                            R{(user.subscriptionAmount || 29.99).toFixed(2)} / mo
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {user.email} • Renew: {user.subscriptionRenewalDate || 'End of month'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. REFERRALS TAB */}
        {activeSubTab === 'referrals' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Admin Referral Link &amp; Management</h2>
                    <p className="text-xs text-slate-500">Share your official referral link. Anyone who joins through it is managed by you.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickSimulate}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 border border-slate-200"
                  title="Simulate someone clicking the link and registering"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Simulate Join</span>
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Referral</span>
                </button>
              </div>
            </div>

            {/* Shareable Link Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 rounded-3xl text-white shadow-xl shadow-slate-900/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-black uppercase tracking-wider">
                      Official Admin Link
                    </span>
                    <span className="text-[11px] text-slate-400">Code: <strong className="text-white">admin</strong></span>
                  </div>
                  <h3 className="text-base font-black text-white">Your Personal Admin Referral Link</h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Share this unique link with contractors, seekers, and providers. Whoever registers via this link automatically enters your management roster for verification and oversight.
                  </p>
                </div>
              </div>

              {/* Link Box */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0 px-2">
                  <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-xs font-mono text-blue-200 truncate select-all">{adminReferralLink}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-900 hover:bg-slate-100 shadow-sm'
                    }`}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                  </button>

                  <button
                    onClick={handleShareLink}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Quick metrics in banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Joined</div>
                  <div className="text-lg font-black text-white">{adminReferrals.length}</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Active Managed</div>
                  <div className="text-lg font-black text-emerald-400">{adminReferrals.filter(r => r.status === 'Active').length}</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-amber-400">Pending Review</div>
                  <div className="text-lg font-black text-amber-400">{adminReferrals.filter(r => r.status === 'Pending Review').length}</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-rose-400">Suspended</div>
                  <div className="text-lg font-black text-rose-400">{adminReferrals.filter(r => r.status === 'Suspended').length}</div>
                </div>
              </div>
            </div>

            {/* Filter and search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'Active', 'Pending Review', 'Suspended'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setReferralFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      referralFilter === filter
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter} ({
                      filter === 'all' 
                        ? adminReferrals.length 
                        : adminReferrals.filter(r => r.status === filter).length
                    })
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search referred members..."
                  value={referralSearch}
                  onChange={(e) => setReferralSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-blue-500"
                />
              </div>
            </div>

            {/* Managed Referral List */}
            {filteredReferrals.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No referred members found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Share your link with recruits, or click "Simulate Join" to test user management through your referral link right now.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    Copy Referral Link
                  </button>
                  <button
                    onClick={handleQuickSimulate}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Simulate Join
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredReferrals.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* User Info */}
                      <div className="flex items-start gap-3">
                        <img
                          src={r.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={r.userName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">{r.userName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Ref: admin
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.status === 'Pending Review'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium">
                            {r.userRole || 'Service Provider'} • Joined {r.joinedDate}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {r.userEmail}</span>
                            {r.userPhone && (
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {r.userPhone}</span>
                            )}
                            {r.userLocation && (
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {r.userLocation}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Management Controls */}
                      <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                        {/* Status Select */}
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                          <span className="text-[10px] font-bold text-slate-500">Status:</span>
                          <select
                            value={r.status}
                            onChange={(e) => handleStatusChange(r.id, e.target.value as any)}
                            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                          >
                            <option value="Active">Active</option>
                            <option value="Pending Review">Pending Review</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </div>

                        {/* KYC Verification Toggle */}
                        <button
                          onClick={() => handleToggleVerification(r.id, r.verificationStatus)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 border ${
                            r.verificationStatus === 'Verified'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Toggle Verification Status"
                        >
                          <UserCheck2 className="w-3.5 h-3.5" />
                          <span>{r.verificationStatus === 'Verified' ? 'Verified' : 'Pending KYC'}</span>
                        </button>

                        {/* Subscription Toggle */}
                        <button
                          onClick={() => handleToggleSubscription(r.id, r.isSubscribed)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 border ${
                            r.isSubscribed
                              ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Toggle User Plan Subscription"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>{r.isSubscribed ? 'Subscribed' : 'Free Tier'}</span>
                        </button>

                        {/* Direct Email / Call */}
                        <a
                          href={`mailto:${r.userEmail}`}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          title="Email user"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        {r.userPhone && (
                          <a
                            href={`tel:${r.userPhone}`}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                            title="Call user"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Remove */}
                        <button
                          onClick={() => handleDeleteReferral(r.id)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                          title="Remove referral"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Notes Row */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs">
                      {editingNotesId === r.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            placeholder="Enter admin management notes..."
                            className="flex-1 px-2 py-1 text-xs rounded-lg bg-white border border-slate-200 focus:outline-blue-500"
                          />
                          <button
                            onClick={() => handleSaveNotes(r.id)}
                            className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-slate-600 flex items-center gap-1.5">
                            <span className="font-bold text-[11px] text-slate-800">Admin Notes:</span>
                            <span className="italic text-slate-500">{r.notes || 'No notes added yet'}</span>
                          </div>
                          <button
                            onClick={() => {
                              setEditingNotesId(r.id);
                              setNotesDraft(r.notes || '');
                            }}
                            className="text-[11px] text-blue-600 hover:underline font-bold cursor-pointer"
                          >
                            Edit Note
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: ADD REFERRAL USER DIRECTLY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Add Referred Member</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Register a user under Admin referral management</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReferralUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sipho Sithole"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. sipho@example.co.za"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +27 82 123 4567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Role / Trade</label>
                  <input
                    type="text"
                    placeholder="e.g. Plumber"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Location / Province</label>
                <input
                  type="text"
                  placeholder="e.g. Cape Town, Western Cape"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Admin Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Onboarded via direct referral link"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
                >
                  Create &amp; Manage Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Menu Bar inside Admin Portal */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 py-2.5 px-1 sm:px-2 z-40 shadow-xl">
        <div className="max-w-xl mx-auto grid grid-cols-7 gap-1">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-1" />
            <span className="text-[8px] sm:text-[9px] tracking-tight truncate max-w-full">Overview</span>
          </button>

          <button
            onClick={() => setActiveSubTab('verification')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'verification'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-1" />
            <span className="text-[8px] sm:text-[9px] tracking-tight truncate max-w-full">Verify</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tenantpop')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'tenantpop'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
          >
            <FileText className="w-4 h-4 mb-1" />
            <span className="text-[8px] sm:text-[9px] tracking-tight truncate max-w-full">Tenant PoP</span>
          </button>

          <button
            onClick={() => setActiveSubTab('userpop')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'userpop'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
          >
            <UserCheck className="w-4 h-4 mb-1" />
            <span className="text-[8px] sm:text-[9px] tracking-tight truncate max-w-full">User PoP</span>
          </button>

          <button
            onClick={() => setActiveSubTab('active-tenants')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'active-tenants'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
          >
            <Building2 className="w-4 h-4 mb-1" />
            <span className="text-[8px] sm:text-[9px] tracking-tight truncate max-w-full">Tenants</span>
          </button>

          <button
            onClick={() => setActiveSubTab('active-subscriptions')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'active-subscriptions'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
          >
            <Crown className="w-4 h-4 mb-1" />
            <span className="text-[8px] sm:text-[9px] tracking-tight truncate max-w-full">Subs</span>
          </button>

          <button
            onClick={() => setActiveSubTab('referrals')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'referrals'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
          >
            <Share2 className="w-4 h-4 mb-1" />
            <span className="text-[8px] sm:text-[9px] tracking-tight truncate max-w-full">Referrals</span>
          </button>
        </div>
      </div>
    </div>
  );
};
