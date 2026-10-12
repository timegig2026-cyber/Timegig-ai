import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  ShieldCheck, 
  FileText, 
  UserCheck, 
  Building2, 
  CheckCircle2, 
  Clock, 
  PlusCircle,
  MapPin,
  X,
  Upload,
  Calendar,
  AlertCircle,
  Crown,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Mail,
  Phone,
  Trash2,
  Sparkles,
  Link2,
  UserPlus,
  Search,
  Users
} from 'lucide-react';
import { TenantLeaseRecord, TenantPoPRecord, RegisteredUser } from '../types';
import { 
  getCurrentUser, 
  getTenantLeases, 
  saveTenantLease, 
  getTenantPoPs, 
  saveTenantPoP, 
  getUserPoPs, 
  saveUserPoP,
  UserPoPRecord,
  getRealTenants,
  saveRealTenant,
  RealTenantRecord,
  getRegisteredUsers,
  getTenantReferrals,
  saveTenantReferral,
  updateTenantReferral,
  removeTenantReferral,
  TenantReferralRecord,
  registerUserViaReferral
} from '../utils/userStorage';

interface TenantPortalViewProps {
  onBackToProfile?: () => void;
}

type TenantSubTab = 'overview' | 'verification' | 'tenantpop' | 'userpop' | 'active-tenants' | 'active-subscriptions' | 'referrals';

export const TenantPortalView: React.FC<TenantPortalViewProps> = ({ onBackToProfile }) => {
  const [activeSubTab, setActiveSubTab] = useState<TenantSubTab>('overview');

  // Real data state
  const currentUser = getCurrentUser();
  const [leases, setLeases] = useState<TenantLeaseRecord[]>([]);
  const [paymentProofs, setPaymentProofs] = useState<TenantPoPRecord[]>([]);
  const [userPops, setUserPops] = useState<UserPoPRecord[]>([]);
  const [realTenants, setRealTenants] = useState<RealTenantRecord[]>([]);
  const [allUsers, setAllUsers] = useState<RegisteredUser[]>([]);
  const [tenantReferrals, setTenantReferrals] = useState<TenantReferralRecord[]>([]);

  // Referral UI state
  const [referralSearch, setReferralSearch] = useState('');
  const [referralFilter, setReferralFilter] = useState<'all' | 'Active' | 'Pending Verification' | 'Suspended'>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAddReferralModalOpen, setIsAddReferralModalOpen] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitDraft, setUnitDraft] = useState('');

  // Form states for new referral
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('Commercial Hub Associate');
  const [formLocation, setFormLocation] = useState('Cape Town Commercial Precinct');
  const [formUnit, setFormUnit] = useState('Unit 3B - Studio');
  const [formNotes, setFormNotes] = useState('Joined via Commercial Tenant Referral Link');

  // Modals for real data entry
  const [isAddLeaseOpen, setIsAddLeaseOpen] = useState(false);
  const [isAddPoPOpen, setIsAddPoPOpen] = useState(false);
  const [isLoggingCheckin, setIsLoggingCheckin] = useState(false);

  // Form states for new Lease
  const [newLeaseProperty, setNewLeaseProperty] = useState('');
  const [newLeaseUnit, setNewLeaseUnit] = useState('');
  const [newLeaseRent, setNewLeaseRent] = useState('');

  // Form states for new PoP
  const [newPoPDesc, setNewPoPDesc] = useState('');
  const [newPoPAmount, setNewPoPAmount] = useState('');
  const [newPoPRef, setNewPoPRef] = useState('');
  const [newPoPBank, setNewPoPBank] = useState('Capitec Bank');
  const [newPoPFile, setNewPoPFile] = useState('Rent_Receipt_Proof.pdf');

  // Load real records
  const refreshData = () => {
    setLeases(getTenantLeases());
    setPaymentProofs(getTenantPoPs());
    setUserPops(getUserPoPs());
    setRealTenants(getRealTenants());
    setAllUsers(getRegisteredUsers());
    setTenantReferrals(getTenantReferrals());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handle Add Real Lease
  const handleSaveLease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaseProperty.trim() || !newLeaseRent.trim()) return;

    const lease: TenantLeaseRecord = {
      id: `lease-${Date.now()}`,
      userId: currentUser?.id,
      userName: currentUser?.name || 'Commercial Tenant',
      property: newLeaseProperty.trim(),
      unit: newLeaseUnit.trim() || 'Main Suite',
      rent: parseFloat(newLeaseRent) || 0,
      status: 'Active',
      startDate: new Date().toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    saveTenantLease(lease);

    // Also register as active real tenant for the hub directory
    saveRealTenant({
      id: `tenant-${Date.now()}`,
      name: currentUser?.name || newLeaseProperty.trim(),
      businessType: `${newLeaseProperty.trim()} (Unit ${newLeaseUnit.trim() || 'Suite'})`,
      monthlySubscription: parseFloat(newLeaseRent) || 299.99,
      joinedDate: new Date().toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Active',
    });

    setNewLeaseProperty('');
    setNewLeaseUnit('');
    setNewLeaseRent('');
    setIsAddLeaseOpen(false);
    refreshData();
  };

  // Handle Submit Real PoP Receipt
  const handleSavePoP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoPDesc.trim() || !newPoPAmount.trim()) return;

    const pop: TenantPoPRecord = {
      id: `tp-${Date.now()}`,
      reference: newPoPRef.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      description: newPoPDesc.trim(),
      amount: parseFloat(newPoPAmount) || 0,
      bank: newPoPBank.trim(),
      date: new Date().toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Approved',
      fileName: newPoPFile.trim(),
    };

    saveTenantPoP(pop);
    setNewPoPDesc('');
    setNewPoPAmount('');
    setNewPoPRef('');
    setIsAddPoPOpen(false);
    refreshData();
  };

  // Handle Log Presence Check-in (PoP)
  const handleLogPresenceCheckin = () => {
    setIsLoggingCheckin(true);

    const recordCheckin = (locationLabel: string) => {
      const pop: UserPoPRecord = {
        id: `up-${Date.now()}`,
        userId: currentUser?.id || 'guest-user',
        userName: currentUser?.name || 'Live Seeker',
        userRole: currentUser?.role || 'Service Specialist',
        gigTitle: `Presence Check-in @ ${locationLabel}`,
        reference: `PING-${Date.now().toString().slice(-6)}`,
        amount: 0,
        bank: 'Geo-Verification',
        date: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }),
        status: 'Approved',
        fileName: 'GeoFence_Verified.log',
      };

      saveUserPoP(pop);
      setIsLoggingCheckin(false);
      refreshData();
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const locStr = `Lat ${pos.coords.latitude.toFixed(4)}, Lon ${pos.coords.longitude.toFixed(4)}`;
          recordCheckin(locStr);
        },
        () => {
          recordCheckin('Cape Town Hub');
        },
        { timeout: 5000 }
      );
    } else {
      recordCheckin('Registered Facility');
    }
  };

  // Calculated metrics
  const activeLeases = leases.filter((l) => l.status === 'Active');
  const activeTenants = realTenants.filter((t) => t.status === 'Active');
  const totalActiveTenantsCount = activeTenants.length + activeLeases.length;
  const totalRentDue = activeLeases.reduce((sum, l) => sum + (l.rent || 0), 0);
  const verifiedPopsCount = paymentProofs.filter((p) => p.status === 'Approved').length;

  const currentRegisteredUser = allUsers.find((u) => u.id === currentUser?.id);
  const isSubscribed = currentRegisteredUser?.isSubscribed ?? false;
  const activeSubscribersList = allUsers.filter((u) => u.isSubscribed);

  // Referral links & management handlers
  const tenantReferralLink = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?ref=tenant`
    : 'https://timegig.app/?ref=tenant';

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(tenantReferralLink);
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
          title: 'Join TimeGiG - Commercial Tenant Referral Link',
          text: 'Join TimeGiG through our Commercial Tenant Hub referral link to be assigned to our commercial property network.',
          url: tenantReferralLink,
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
    registerUserViaReferral('tenant', {
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      location: formLocation,
      unitAssigned: formUnit,
      notes: formNotes,
      initialStatus: 'Active',
    });
    setIsAddReferralModalOpen(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    refreshData();
  };

  const handleQuickSimulate = () => {
    const sampleNames = ['Nandi Mazibuko', 'Tshepo Maseko', 'Lindiwe Buthelezi', 'Sipho Zulu', 'Ayanda Mthembu'];
    const sampleRoles = ['Beauty Salon Stylist', 'Commercial Hub Tech', 'Boutique Florist', 'Consulting Desk Member', 'Specialist Tailor'];
    const randIdx = Math.floor(Math.random() * sampleNames.length);
    const name = sampleNames[randIdx];
    const email = `${name.toLowerCase().replace(' ', '.')}@tenant-hub.co.za`;
    registerUserViaReferral('tenant', {
      name,
      email,
      phone: '+27 82 ' + Math.floor(1000000 + Math.random() * 9000000),
      role: sampleRoles[randIdx],
      location: 'Cape Town Commercial Precinct',
      unitAssigned: 'Unit ' + Math.floor(10 + Math.random() * 80),
      notes: 'Simulated recruit joined via Tenant referral link',
      initialStatus: 'Active',
    });
    refreshData();
  };

  const handleStatusChange = (id: string, status: 'Active' | 'Pending Verification' | 'Suspended') => {
    updateTenantReferral(id, { status });
    refreshData();
  };

  const handleSaveUnit = (id: string) => {
    updateTenantReferral(id, { unitAssigned: unitDraft });
    setEditingUnitId(null);
    refreshData();
  };

  const handleSaveNotes = (id: string) => {
    updateTenantReferral(id, { notes: notesDraft });
    setEditingNotesId(null);
    refreshData();
  };

  const handleDeleteReferral = (id: string) => {
    removeTenantReferral(id);
    refreshData();
  };

  const filteredReferrals = tenantReferrals.filter((r) => {
    const matchesFilter = referralFilter === 'all' || r.status === referralFilter;
    if (!matchesFilter) return false;
    if (!referralSearch.trim()) return true;
    const q = referralSearch.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.role.toLowerCase().includes(q) ||
      (r.location && r.location.toLowerCase().includes(q)) ||
      (r.unitAssigned && r.unitAssigned.toLowerCase().includes(q))
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
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight">Tenant Portal</h1>
              <p className="text-[10px] text-slate-500 font-medium">Real Leases, Payments &amp; PoP Hub</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {currentUser.name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold">
              Tenant Dashboard
            </span>
          )}
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
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Leases</div>
                <div className="text-xl font-black text-slate-900">{activeLeases.length}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  {leases.length} Registered properties
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monthly Rent Due</div>
                <div className="text-xl font-black text-amber-600">
                  {totalRentDue > 0 ? `R${totalRentDue.toLocaleString()}` : 'R0.00'}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  Current cycle
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Verified PoPs</div>
                <div className="text-xl font-black text-emerald-600">{verifiedPopsCount}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  Bank receipts
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Presence Pings</div>
                <div className="text-xl font-black text-purple-600">{userPops.length}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  Logged check-ins
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Tenants</div>
                <div className="text-xl font-black text-indigo-600">{realTenants.length + activeLeases.length}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  Hub community
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">My Subscription</div>
                <div className="text-xl font-black text-rose-600">{isSubscribed ? 'Active' : 'Free'}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  {isSubscribed ? 'Pro Member' : 'Standard'}
                </div>
              </div>

              <div 
                onClick={() => setActiveSubTab('referrals')}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs cursor-pointer hover:border-amber-300 transition-colors"
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">My Referrals</div>
                <div className="text-xl font-black text-amber-600">{tenantReferrals.length}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">
                  {tenantReferrals.filter(r => r.status === 'Active').length} Active in Hub
                </div>
              </div>
            </div>

            {/* Quick Referral Share Banner inside Overview */}
            <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 text-[10px] font-bold border border-amber-400/20">
                    Commercial Tenant Link
                  </span>
                  <span className="text-[11px] text-amber-200 font-mono">Code: tenant</span>
                </div>
                <h3 className="text-sm font-bold text-white">Share Your Commercial Hub Referral Link</h3>
                <p className="text-xs text-amber-200/90 max-w-xl">
                  Share your referral link with sub-tenants and business partners. Whoever joins through your link is assigned to your commercial roster and managed by you.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-white text-amber-950 hover:bg-amber-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={() => setActiveSubTab('referrals')}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Manage Referrals ({tenantReferrals.length})</span>
                </button>
              </div>
            </div>


            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

              <div
                onClick={() => setActiveSubTab('referrals')}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-300 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Share2 className="w-5 h-5 text-amber-600" />
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                </div>
                <div className="text-xs font-bold text-slate-900">Referrals Hub ({tenantReferrals.length})</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Share link &amp; manage recruits
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. VERIFICATION TAB */}
        {activeSubTab === 'verification' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-sm font-black text-slate-900">Lease Verification &amp; Tenancy Records</h2>
                <p className="text-xs text-slate-500">Official active premises agreements registered on TimeGig</p>
              </div>

              <button
                onClick={() => setIsAddLeaseOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Lease Agreement</span>
              </button>
            </div>

            {leases.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 mx-auto flex items-center justify-center text-amber-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No Lease Agreements Registered</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Register your first commercial lease agreement to enable official tenant verification badges and PoP accounting.
                </p>
                <button
                  onClick={() => setIsAddLeaseOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register First Lease</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {leases.map((lease) => (
                  <div
                    key={lease.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{lease.property}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {lease.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">Unit: {lease.unit} • Tenant: {lease.userName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span className="font-semibold text-slate-900">R{lease.rent.toLocaleString()} / mo</span>
                        <span>•</span>
                        <span>Effective: {lease.startDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsAddPoPOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Submit PoP Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. TENANT POP TAB */}
        {activeSubTab === 'tenantpop' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-sm font-black text-slate-900">Tenant Proof of Payment (PoP)</h2>
                <p className="text-xs text-slate-500">Official bank payment receipts uploaded for administrative verification</p>
              </div>

              <button
                onClick={() => setIsAddPoPOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New PoP</span>
              </button>
            </div>

            {paymentProofs.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 mx-auto flex items-center justify-center text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No PoP Receipts Uploaded</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Submit your bank deposit or EFT transfer proof to clear your lease ledger with management.
                </p>
                <button
                  onClick={() => setIsAddPoPOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Proof of Payment</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {paymentProofs.map((item) => (
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
                      <div className="text-[10px] text-indigo-600 font-mono">Attachment: {item.fileName}</div>
                    </div>

                    <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Recorded on Ledger</span>
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
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-sm font-black text-slate-900">User Proof of Presence (PoP)</h2>
                <p className="text-xs text-slate-500">Live GPS on-site check-ins for attendance verification</p>
              </div>

              <button
                onClick={handleLogPresenceCheckin}
                disabled={isLoggingCheckin}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isLoggingCheckin ? 'Acquiring GPS...' : 'Log Presence Check-in'}</span>
              </button>
            </div>

            {userPops.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-purple-50 mx-auto flex items-center justify-center text-purple-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No Presence Check-ins Logged</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click &quot;Log Presence Check-in&quot; above to register your on-site attendance ping.
                </p>
                <button
                  onClick={handleLogPresenceCheckin}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Log Check-in Now</span>
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
                {userPops.map((pop) => (
                  <div key={pop.id} className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900">{pop.gigTitle}</div>
                      <div className="text-[11px] text-slate-500">Logged: {pop.date} • {pop.userName}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {pop.status}
                    </span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeTenants.map((t) => (
                  <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-500">{t.businessType}</div>
                      <div className="text-[10px] text-slate-400">Joined: {t.joinedDate}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                ))}

                {activeLeases.map((l) => (
                  <div key={l.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900">{l.property} (Unit {l.unit})</div>
                      <div className="text-[11px] text-slate-500">Tenant: {l.userName}</div>
                      <div className="text-[10px] text-slate-400">R{l.rent.toLocaleString()}/mo</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
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
                  Users with an active subscription will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeSubscribersList.map((sub) => (
                  <div key={sub.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={sub.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        alt={sub.name}
                        className="w-10 h-10 rounded-xl object-cover border border-purple-200"
                      />
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900">{sub.name}</div>
                        <div className="text-[11px] text-slate-500">{sub.role}</div>
                        <div className="text-[10px] text-purple-600 font-semibold">{sub.subscriptionPlan || 'Active Subscriber'}</div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                      Active
                    </span>
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
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Tenant Referral Link &amp; Management</h2>
                    <p className="text-xs text-slate-500">Share your dedicated commercial referral link. Anyone who joins through it is managed by you.</p>
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
                  onClick={() => setIsAddReferralModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm shadow-amber-500/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Member</span>
                </button>
              </div>
            </div>

            {/* Shareable Link Card */}
            <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-900/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                      Commercial Tenant Link
                    </span>
                    <span className="text-[11px] text-slate-400">Code: <strong className="text-white">tenant</strong></span>
                  </div>
                  <h3 className="text-base font-black text-white">Your Commercial Hub Referral Link</h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Invite sub-tenants, contractors, and retail partners to join under your commercial tenancy. Whoever registers via this link is assigned to your hub for space allocation and oversight.
                  </p>
                </div>
              </div>

              {/* Link Box */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0 px-2">
                  <Link2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-mono text-amber-200 truncate select-all">{tenantReferralLink}</span>
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
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
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
                  <div className="text-lg font-black text-white">{tenantReferrals.length}</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Active in Hub</div>
                  <div className="text-lg font-black text-emerald-400">{tenantReferrals.filter(r => r.status === 'Active').length}</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-amber-400">Pending Verification</div>
                  <div className="text-lg font-black text-amber-400">{tenantReferrals.filter(r => r.status === 'Pending Verification').length}</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-rose-400">Suspended</div>
                  <div className="text-lg font-black text-rose-400">{tenantReferrals.filter(r => r.status === 'Suspended').length}</div>
                </div>
              </div>
            </div>

            {/* Filter and search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'Active', 'Pending Verification', 'Suspended'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setReferralFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      referralFilter === filter
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter} ({
                      filter === 'all' 
                        ? tenantReferrals.length 
                        : tenantReferrals.filter(r => r.status === filter).length
                    })
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search recruits &amp; members..."
                  value={referralSearch}
                  onChange={(e) => setReferralSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-amber-500"
                />
              </div>
            </div>

            {/* Managed Referral List */}
            {filteredReferrals.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No hub recruits found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Share your link with prospective tenants, or click "Simulate Join" to test member management through your referral link right now.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors"
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
                          src={r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={r.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">{r.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Ref: tenant
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.status === 'Pending Verification'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium">
                            {r.role || 'Hub Specialist'} • Joined {r.joinedDate}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {r.email}</span>
                            {r.phone && (
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {r.phone}</span>
                            )}
                            {r.location && (
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {r.location}</span>
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
                            <option value="Pending Verification">Pending Verification</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </div>

                        {/* Unit Assignment */}
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                          <span className="text-[10px] font-bold text-slate-500">Unit:</span>
                          {editingUnitId === r.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={unitDraft}
                                onChange={(e) => setUnitDraft(e.target.value)}
                                className="w-20 px-1 py-0.5 text-xs rounded bg-white border border-slate-200 focus:outline-amber-500"
                              />
                              <button
                                onClick={() => handleSaveUnit(r.id)}
                                className="px-1.5 py-0.5 rounded bg-amber-600 text-white text-[10px] font-bold cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUnitId(r.id);
                                setUnitDraft(r.unitAssigned || 'Unit 1');
                              }}
                              className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                            >
                              {r.unitAssigned || 'Assign Unit'}
                            </button>
                          )}
                        </div>

                        {/* Direct Email / Call */}
                        <a
                          href={`mailto:${r.email}`}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          title="Email member"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        {r.phone && (
                          <a
                            href={`tel:${r.phone}`}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                            title="Call member"
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
                            placeholder="Enter tenant management notes..."
                            className="flex-1 px-2 py-1 text-xs rounded-lg bg-white border border-slate-200 focus:outline-amber-500"
                          />
                          <button
                            onClick={() => handleSaveNotes(r.id)}
                            className="px-3 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold cursor-pointer"
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
                            <span className="font-bold text-[11px] text-slate-800">Tenant Notes:</span>
                            <span className="italic text-slate-500">{r.notes || 'No notes added yet'}</span>
                          </div>
                          <button
                            onClick={() => {
                              setEditingNotesId(r.id);
                              setNotesDraft(r.notes || '');
                            }}
                            className="text-[11px] text-amber-600 hover:underline font-bold cursor-pointer"
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

      {/* MODAL: ADD LEASE */}
      {isAddLeaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black text-slate-900">Register Commercial Lease</h3>
              </div>
              <button
                onClick={() => setIsAddLeaseOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLease} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Property Name / Hub</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cape Town Tech Hub or Downtown Commercial"
                  value={newLeaseProperty}
                  onChange={(e) => setNewLeaseProperty(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit / Suite Number</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 4B"
                  value={newLeaseUnit}
                  onChange={(e) => setNewLeaseUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Monthly Rent Amount (ZAR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="4500.00"
                  value={newLeaseRent}
                  onChange={(e) => setNewLeaseRent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeaseOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Save Lease Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD POP */}
      {isAddPoPOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Submit Proof of Payment (PoP)</h3>
              </div>
              <button
                onClick={() => setIsAddPoPOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePoP} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Rent Payment - October"
                  value={newPoPDesc}
                  onChange={(e) => setNewPoPDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount Paid (ZAR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="4500.00"
                  value={newPoPAmount}
                  onChange={(e) => setNewPoPAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. CAP-839210-POP"
                  value={newPoPRef}
                  onChange={(e) => setNewPoPRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Institution</label>
                <select
                  value={newPoPBank}
                  onChange={(e) => setNewPoPBank(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-indigo-500"
                >
                  <option value="Capitec Bank">Capitec Bank</option>
                  <option value="FNB (First National Bank)">FNB (First National Bank)</option>
                  <option value="Standard Bank">Standard Bank</option>
                  <option value="Nedbank">Nedbank</option>
                  <option value="ABSA">ABSA</option>
                  <option value="Investec">Investec</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPoPOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Submit PoP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD REFERRAL MEMBER DIRECTLY */}
      {isAddReferralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Add Hub Member</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Register a recruit under Tenant referral management</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddReferralModalOpen(false)}
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
                  placeholder="e.g. Nomvula Khumalo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. nomvula@tenant-hub.co.za"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +27 83 234 5678"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Role / Trade</label>
                  <input
                    type="text"
                    placeholder="e.g. Stylist"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit / Space Assigned</label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 4B"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Cape Town Hub"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tenant Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Commercial sub-lease assigned"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddReferralModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
                >
                  Create &amp; Manage Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Menu Bar inside Tenant Portal */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 py-2.5 px-1 sm:px-2 z-40 shadow-xl">
        <div className="max-w-xl mx-auto grid grid-cols-7 gap-1">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
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
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
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
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
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
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
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
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
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
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
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
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
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
