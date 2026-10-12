import { RegisteredUser, SeekerProfile, TenantPoPRecord, TenantLeaseRecord } from '../types';

const STORAGE_USERS_KEY = 'timegig_registered_users';
const STORAGE_CURRENT_USER_ID = 'timegig_current_user_id';
const STORAGE_USER_POPS_KEY = 'timegig_user_pops';
const STORAGE_TENANT_POPS_KEY = 'timegig_tenant_pops';
const STORAGE_TENANT_LEASES_KEY = 'timegig_tenant_leases';
const STORAGE_REAL_ACTIVITIES_KEY = 'timegig_real_activities';
const STORAGE_REAL_TENANTS_KEY = 'timegig_real_tenants';

// All mock and demo fake tenant PoPs removed: only real verified payments recorded
export const INITIAL_TENANT_POPS: TenantPoPRecord[] = [];

export interface RealTenantRecord {
  id: string;
  name: string;
  businessType: string;
  monthlySubscription: number;
  joinedDate: string;
  status: 'Active' | 'Pending';
}

export interface RealUserActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  activityType: 'registration' | 'go_live' | 'gig_completed' | 'subscription_renewed' | 'instant_payout' | 'verification_passed';
  description: string;
  location: string;
  amount: number;
  profit: number;
  timestamp: string;
  status: 'Completed' | 'Live' | 'Cleared' | 'Pending';
}

export interface UserPoPRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  gigTitle: string;
  reference: string;
  amount: number;
  bank: string;
  date: string;
  status: 'Approved' | 'Pending Approval' | 'Disputed';
  fileName: string;
}

export const getRegisteredUsers = (): RegisteredUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse registered users:', err);
    return [];
  }
};

export const saveRegisteredUser = (user: RegisteredUser): void => {
  try {
    const existing = getRegisteredUsers();
    const index = existing.findIndex((u) => u.id === user.id);
    let updated: RegisteredUser[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = user;
    } else {
      updated = [user, ...existing];
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
    localStorage.setItem(STORAGE_CURRENT_USER_ID, user.id);
  } catch (err) {
    console.error('Failed to save registered user:', err);
  }
};

export const getCurrentUser = (): RegisteredUser | null => {
  try {
    const currentId = localStorage.getItem(STORAGE_CURRENT_USER_ID);
    const users = getRegisteredUsers();
    if (!currentId) {
      return users.length > 0 ? users[0] : null;
    }
    const found = users.find((u) => u.id === currentId);
    return found || (users.length > 0 ? users[0] : null);
  } catch (err) {
    console.error('Failed to get current user:', err);
    return null;
  }
};

export const setCurrentUser = (userId: string | null): void => {
  if (userId) {
    localStorage.setItem(STORAGE_CURRENT_USER_ID, userId);
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER_ID);
  }
};

export const updateUserLiveStatus = (userId: string, isLive: boolean): RegisteredUser | null => {
  const users = getRegisteredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index >= 0) {
    users[index] = { ...users[index], isLive };
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    return users[index];
  }
  return null;
};

export const updateUserVerificationStatus = (
  userId: string,
  status: 'Pending' | 'Verified' | 'Rejected'
): RegisteredUser | null => {
  const users = getRegisteredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index >= 0) {
    users[index] = { ...users[index], verificationStatus: status };
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    return users[index];
  }
  return null;
};

export const updateUserSubscription = (
  userId: string,
  isSubscribed: boolean,
  plan?: string,
  amount?: number
): RegisteredUser | null => {
  const users = getRegisteredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index >= 0) {
    const today = new Date().toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' });
    const renewDate = new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' });
    users[index] = {
      ...users[index],
      isSubscribed,
      subscriptionPlan: plan || 'User Subscription',
      subscriptionAmount: amount || 29.99,
      subscriptionStartDate: today,
      subscriptionRenewalDate: renewDate,
    };
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    return users[index];
  }
  return null;
};

export const getLiveSeekers = (): SeekerProfile[] => {
  const users = getRegisteredUsers();
  return users
    .filter((u) => u.isLive)
    .map((u) => ({
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
    }));
};

export const getUserPoPs = (): UserPoPRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_USER_POPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse user pops:', err);
    return [];
  }
};

export const saveUserPoP = (pop: UserPoPRecord): void => {
  try {
    const existing = getUserPoPs();
    const updated = [pop, ...existing];
    localStorage.setItem(STORAGE_USER_POPS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save user pop:', err);
  }
};

export const updateUserPoPStatus = (popId: string, status: 'Approved' | 'Pending Approval' | 'Disputed'): void => {
  try {
    const existing = getUserPoPs();
    const updated = existing.map((p) => (p.id === popId ? { ...p, status } : p));
    localStorage.setItem(STORAGE_USER_POPS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update user pop status:', err);
  }
};

export const getTenantPoPs = (): TenantPoPRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_TENANT_POPS_KEY);
    if (!raw) return INITIAL_TENANT_POPS;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse tenant pops:', err);
    return INITIAL_TENANT_POPS;
  }
};

export const saveTenantPoP = (pop: TenantPoPRecord): void => {
  try {
    const existing = getTenantPoPs();
    const updated = [pop, ...existing];
    localStorage.setItem(STORAGE_TENANT_POPS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save tenant pop:', err);
  }
};

export const updateTenantPoPStatus = (popId: string, status: 'Approved' | 'Pending' | 'Review'): void => {
  try {
    const existing = getTenantPoPs();
    const updated = existing.map((p) => (p.id === popId ? { ...p, status } : p));
    localStorage.setItem(STORAGE_TENANT_POPS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update tenant pop status:', err);
  }
};

export const getTenantLeases = (): TenantLeaseRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_TENANT_LEASES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse tenant leases:', err);
    return [];
  }
};

export const saveTenantLease = (lease: TenantLeaseRecord): void => {
  try {
    const existing = getTenantLeases();
    const index = existing.findIndex((l) => l.id === lease.id);
    let updated: TenantLeaseRecord[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = lease;
    } else {
      updated = [lease, ...existing];
    }
    localStorage.setItem(STORAGE_TENANT_LEASES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save tenant lease:', err);
  }
};

export const updateTenantLeaseStatus = (
  id: string,
  status: 'Active' | 'Pending Verification' | 'Expired'
): void => {
  try {
    const existing = getTenantLeases();
    const updated = existing.map((l) => (l.id === id ? { ...l, status } : l));
    localStorage.setItem(STORAGE_TENANT_LEASES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update tenant lease status:', err);
  }
};

export const deleteTenantLease = (id: string): void => {
  try {
    const existing = getTenantLeases();
    const updated = existing.filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_TENANT_LEASES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete tenant lease:', err);
  }
};

export const getRealTenants = (): RealTenantRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_REAL_TENANTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse real tenants:', err);
    return [];
  }
};

export const saveRealTenant = (tenant: RealTenantRecord): void => {
  try {
    const existing = getRealTenants();
    const updated = [tenant, ...existing.filter((t) => t.id !== tenant.id)];
    localStorage.setItem(STORAGE_REAL_TENANTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save real tenant:', err);
  }
};

export const updateRealTenantStatus = (id: string, status: 'Active' | 'Pending'): void => {
  try {
    const existing = getRealTenants();
    const updated = existing.map((t) => (t.id === id ? { ...t, status } : t));
    localStorage.setItem(STORAGE_REAL_TENANTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update real tenant status:', err);
  }
};

export const deleteRealTenant = (id: string): void => {
  try {
    const existing = getRealTenants();
    const updated = existing.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_REAL_TENANTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete real tenant:', err);
  }
};

export const getRealActivities = (): RealUserActivity[] => {
  try {
    const raw = localStorage.getItem(STORAGE_REAL_ACTIVITIES_KEY);
    let stored: RealUserActivity[] = raw ? JSON.parse(raw) : [];

    // Sanitize any legacy registration events that were erroneously assigned artificial profit/amount
    let hasChanges = false;
    stored = stored.map((act) => {
      if (act.activityType === 'registration' && (act.profit !== 0 || act.amount !== 0)) {
        hasChanges = true;
        return { ...act, amount: 0, profit: 0 };
      }
      return act;
    });

    if (hasChanges) {
      localStorage.setItem(STORAGE_REAL_ACTIVITIES_KEY, JSON.stringify(stored));
    }

    // If no activities logged yet, derive strictly from real registered users with 0 profit (profile registration is free)
    if (stored.length === 0) {
      const users = getRegisteredUsers();
      if (users.length === 0) return [];

      return users.map((u) => ({
        id: `act-${u.id}`,
        userId: u.id,
        userName: u.name,
        userAvatar: u.avatar,
        userRole: u.role,
        activityType: 'registration' as const,
        description: `Registered verified profile on TimeGig platform`,
        location: u.location,
        amount: 0,
        profit: 0,
        timestamp: u.joinedDate || 'Recently',
        status: 'Completed' as const,
      }));
    }
    return stored;
  } catch (err) {
    console.error('Failed to get real activities:', err);
    return [];
  }
};

export const addRealActivity = (activity: Omit<RealUserActivity, 'id' | 'timestamp'>): void => {
  try {
    const raw = localStorage.getItem(STORAGE_REAL_ACTIVITIES_KEY);
    const existing: RealUserActivity[] = raw ? JSON.parse(raw) : [];
    const newActivity: RealUserActivity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
    };
    const updated = [newActivity, ...existing].slice(0, 50);
    localStorage.setItem(STORAGE_REAL_ACTIVITIES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to add real activity:', err);
  }
};

export const STORAGE_ACTIVATION_SUBMISSIONS_KEY = 'timegig_activation_submissions';
export const STORAGE_TENANT_ACTIVATION_KEY = 'timegig_tenant_activation';

export interface ActivationSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  planType: 'tenant' | 'user'; // 'tenant' = Become a Tenant | 'user' = User Subscription
  planLabel: 'Become a Tenant' | 'User Subscription';
  amount: number; // 299.99
  bank: 'Capitec';
  accountName: 'Matthews';
  accountNumber: '1334067366';
  reference: 'Ten29' | 'User29';
  documentName: string;
  documentDataUrl?: string;
  fileSize?: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedAt?: string;
  notes?: string;
}

export const getActivationSubmissions = (): ActivationSubmission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVATION_SUBMISSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse activation submissions:', err);
    return [];
  }
};

export const saveActivationSubmission = (submission: ActivationSubmission): void => {
  try {
    const existing = getActivationSubmissions();
    const updated = [submission, ...existing.filter((s) => s.id !== submission.id)];
    localStorage.setItem(STORAGE_ACTIVATION_SUBMISSIONS_KEY, JSON.stringify(updated));

    // Also link into tenant PoPs for records
    if (submission.planType === 'tenant') {
      saveTenantPoP({
        id: submission.id,
        reference: submission.reference,
        description: `Activation: ${submission.planLabel} (Capitec ref: ${submission.reference})`,
        amount: submission.amount,
        bank: `${submission.bank} - ${submission.accountName}`,
        date: submission.submittedAt,
        status: submission.status === 'Approved' ? 'Approved' : 'Pending',
        fileName: submission.documentName,
      });
    }
  } catch (err) {
    console.error('Failed to save activation submission:', err);
  }
};

export const updateActivationSubmissionStatus = (id: string, status: 'Approved' | 'Rejected'): void => {
  try {
    const existing = getActivationSubmissions();
    const sub = existing.find((s) => s.id === id);
    const updated = existing.map((s) =>
      s.id === id ? { ...s, status, reviewedAt: new Date().toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }) } : s
    );
    localStorage.setItem(STORAGE_ACTIVATION_SUBMISSIONS_KEY, JSON.stringify(updated));

    if (sub) {
      if (status === 'Approved') {
        // The activation will glow green!
        localStorage.setItem(STORAGE_TENANT_ACTIVATION_KEY, 'true');

        if (sub.planType === 'tenant') {
          saveRealTenant({
            id: `tenant-${sub.id}`,
            name: sub.userName || 'Commercial Tenant',
            businessType: 'Hub Tenancy & Facilities',
            monthlySubscription: sub.amount || 299.99,
            joinedDate: new Date().toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Active',
          });
          updateTenantPoPStatus(sub.id, 'Approved');
        } else {
          const users = getRegisteredUsers();
          const userIdx = users.findIndex((u) => u.id === sub.userId || u.name === sub.userName);
          if (userIdx >= 0) {
            users[userIdx] = {
              ...users[userIdx],
              isSubscribed: true,
              subscriptionPlan: 'pro_seeker',
              subscriptionAmount: sub.amount || 29.99,
            } as any;
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
          }
        }

        // Link into Admin Referrals so profit shows in admin Tenant Profit and User Sub Profit
        saveAdminReferral({
          id: `ref-${sub.id}`,
          userId: sub.userId || 'usr-ref',
          userName: sub.userName || 'Referred Member',
          userEmail: sub.userEmail || 'member@timegig.co.za',
          userAvatar: sub.userAvatar,
          planType: sub.planType,
          planLabel: sub.planLabel,
          monthlyProfit: sub.amount || (sub.planType === 'tenant' ? 299.99 : 29.99),
          joinedDate: new Date().toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Active',
          referralCode: 'admin',
        });

        // Add real activity log
        addRealActivity({
          userId: sub.userId || 'admin',
          userName: sub.userName || 'Verified Subscriber',
          userAvatar: sub.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          userRole: sub.planType === 'tenant' ? 'Corporate Tenant' : 'Pro Subscriber',
          activityType: 'subscription_renewed',
          description: sub.planType === 'tenant' 
            ? `Tenant activated (R299,99 via Capitec ref: ${sub.reference}) - earn passive monthly income` 
            : `User subscription activated (R29,99 monthly via Capitec ref: ${sub.reference}) to keep app active`,
          location: 'South Africa',
          amount: sub.amount,
          profit: sub.amount,
          status: 'Completed',
        });
      } else {
        const hasOtherApproved = updated.some((s) => s.id !== id && s.status === 'Approved');
        if (!hasOtherApproved) {
          localStorage.setItem(STORAGE_TENANT_ACTIVATION_KEY, 'false');
        }
      }
    }
  } catch (err) {
    console.error('Failed to update activation submission status:', err);
  }
};

export const isActivationApproved = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_TENANT_ACTIVATION_KEY);
    if (raw !== null) {
      return raw === 'true';
    }
    const submissions = getActivationSubmissions();
    return submissions.some((s) => s.status === 'Approved');
  } catch {
    return false;
  }
};

export const STORAGE_ADMIN_REFERRALS_KEY = 'timegig_admin_referrals';
export const STORAGE_REFERRAL_CODE_KEY = 'timegig_active_referral_code';
export const STORAGE_TENANT_SUBSCRIPTION_KEY = 'timegig_tenant_subscription';
export const STORAGE_TENANT_REFERRALS_KEY = 'timegig_tenant_referrals';

export interface TenantSubscriptionState {
  isActive: boolean;
  planType: 'tenant' | 'user';
  planLabel: string;
  amount: number;
  startDate: string;
  expiryDate: string;
  daysRemaining: number;
  isExpiringSoon: boolean; // true if <= 5 days remaining
  isExpired: boolean;
}

export const getTenantSubscriptionState = (): TenantSubscriptionState => {
  try {
    const raw = localStorage.getItem(STORAGE_TENANT_SUBSCRIPTION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    const approved = isActivationApproved();
    if (approved) {
      const now = new Date();
      const expiry = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);
      return {
        isActive: true,
        planType: 'tenant',
        planLabel: 'Become a Tenant',
        amount: 299.99,
        startDate: now.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }),
        expiryDate: expiry.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }),
        daysRemaining: 25,
        isExpiringSoon: false,
        isExpired: false,
      };
    }
    return {
      isActive: false,
      planType: 'tenant',
      planLabel: 'Become a Tenant',
      amount: 299.99,
      startDate: '',
      expiryDate: '',
      daysRemaining: 0,
      isExpiringSoon: false,
      isExpired: true,
    };
  } catch {
    return {
      isActive: false,
      planType: 'tenant',
      planLabel: 'Become a Tenant',
      amount: 299.99,
      startDate: '',
      expiryDate: '',
      daysRemaining: 0,
      isExpiringSoon: false,
      isExpired: true,
    };
  }
};

export const saveTenantSubscriptionState = (state: TenantSubscriptionState): void => {
  try {
    localStorage.setItem(STORAGE_TENANT_SUBSCRIPTION_KEY, JSON.stringify(state));
    if (state.isActive && !state.isExpired) {
      localStorage.setItem(STORAGE_TENANT_ACTIVATION_KEY, 'true');
    } else {
      localStorage.setItem(STORAGE_TENANT_ACTIVATION_KEY, 'false');
    }
  } catch (err) {
    console.error('Failed to save tenant subscription state:', err);
  }
};

export interface TenantReferralRecord {
  id: string;
  userId?: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar: string;
  location: string;
  joinedDate: string;
  status: 'Active' | 'Pending Verification' | 'Suspended';
  completedGigs: number;
  tenantAssigned: string;
  tenantId?: string;
  notes?: string;
  unitAssigned?: string;
}

export const getTenantReferrals = (): TenantReferralRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_TENANT_REFERRALS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse tenant referrals:', err);
    return [];
  }
};

export const saveTenantReferral = (record: TenantReferralRecord): void => {
  try {
    const existing = getTenantReferrals();
    const updated = [record, ...existing.filter((r) => r.id !== record.id)];
    localStorage.setItem(STORAGE_TENANT_REFERRALS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save tenant referral:', err);
  }
};

export const updateTenantReferral = (
  id: string,
  updates: Partial<TenantReferralRecord>
): void => {
  try {
    const existing = getTenantReferrals();
    const target = existing.find((r) => r.id === id);
    const updated = existing.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    localStorage.setItem(STORAGE_TENANT_REFERRALS_KEY, JSON.stringify(updated));

    // Also sync if linked to registered user
    if (target?.userId) {
      const users = getRegisteredUsers();
      const uIndex = users.findIndex((u) => u.id === target.userId);
      if (uIndex >= 0) {
        const u = users[uIndex];
        const updatedUser: RegisteredUser = {
          ...u,
          name: updates.name !== undefined ? updates.name : u.name,
          role: updates.role !== undefined ? updates.role : u.role,
          phone: updates.phone !== undefined ? updates.phone : u.phone,
          location: updates.location !== undefined ? updates.location : u.location,
        };
        saveRegisteredUser(updatedUser);
      }
    }
  } catch (err) {
    console.error('Failed to update tenant referral:', err);
  }
};

export const updateTenantReferralStatus = (
  id: string,
  status: 'Active' | 'Pending Verification' | 'Suspended',
  notes?: string
): void => {
  updateTenantReferral(id, { status, ...(notes !== undefined ? { notes } : {}) });
};

export const removeTenantReferral = (id: string): void => {
  try {
    const existing = getTenantReferrals();
    const updated = existing.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_TENANT_REFERRALS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove tenant referral:', err);
  }
};

export interface AdminReferralRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userAvatar?: string;
  userRole?: string;
  userLocation?: string;
  planType?: 'tenant' | 'user'; // 'tenant' = Become a Tenant (R299,99) | 'user' = User Subscription (R29,99)
  planLabel?: string;
  monthlyProfit?: number; // 299.99 or 29.99
  joinedDate: string;
  status: 'Active' | 'Pending Review' | 'Suspended';
  referralCode: string; // 'admin'
  notes?: string;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
  isSubscribed?: boolean;
}

export const getAdminReferrals = (): AdminReferralRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_REFERRALS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse admin referrals:', err);
    return [];
  }
};

export const saveAdminReferral = (record: AdminReferralRecord): void => {
  try {
    const existing = getAdminReferrals();
    const updated = [record, ...existing.filter((r) => r.id !== record.id)];
    localStorage.setItem(STORAGE_ADMIN_REFERRALS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save admin referral:', err);
  }
};

export const updateAdminReferral = (
  id: string,
  updates: Partial<AdminReferralRecord>
): void => {
  try {
    const existing = getAdminReferrals();
    const target = existing.find((r) => r.id === id);
    const updated = existing.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    localStorage.setItem(STORAGE_ADMIN_REFERRALS_KEY, JSON.stringify(updated));

    // Also sync to registered users
    const userId = target?.userId || updates.userId;
    if (userId) {
      const users = getRegisteredUsers();
      const uIndex = users.findIndex((u) => u.id === userId);
      if (uIndex >= 0) {
        const u = users[uIndex];
        const updatedUser: RegisteredUser = {
          ...u,
          name: updates.userName !== undefined ? updates.userName : u.name,
          role: updates.userRole !== undefined ? updates.userRole : u.role,
          phone: updates.userPhone !== undefined ? updates.userPhone : u.phone,
          location: updates.userLocation !== undefined ? updates.userLocation : u.location,
          verificationStatus: updates.verificationStatus !== undefined ? updates.verificationStatus : u.verificationStatus,
          isSubscribed: updates.isSubscribed !== undefined ? updates.isSubscribed : u.isSubscribed,
        };
        saveRegisteredUser(updatedUser);
      }
    }
  } catch (err) {
    console.error('Failed to update admin referral:', err);
  }
};

export const updateAdminReferralStatus = (
  id: string,
  status: 'Active' | 'Pending Review' | 'Suspended',
  notes?: string
): void => {
  updateAdminReferral(id, { status, ...(notes !== undefined ? { notes } : {}) });
};

export const removeAdminReferral = (id: string): void => {
  try {
    const existing = getAdminReferrals();
    const updated = existing.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_ADMIN_REFERRALS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove admin referral:', err);
  }
};

export const registerUserViaReferral = (
  referralType: 'admin' | 'tenant',
  payload: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
    location?: string;
    notes?: string;
    unitAssigned?: string;
    initialStatus?: 'Active' | 'Pending Review' | 'Pending Verification';
    isSubscribed?: boolean;
    verificationStatus?: 'Pending' | 'Verified';
  }
): { user: RegisteredUser; adminRef?: AdminReferralRecord; tenantRef?: TenantReferralRecord } => {
  const newId = `user-ref-${Date.now().toString().slice(-6)}`;
  const avatarList = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  ];
  const chosenAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];
  const todayStr = new Date().toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' });

  const newUser: RegisteredUser = {
    id: newId,
    name: payload.name.trim(),
    firstName: payload.name.trim().split(' ')[0] || payload.name.trim(),
    surname: payload.name.trim().split(' ').slice(1).join(' ') || 'Member',
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || '+27 82 ' + Math.floor(1000000 + Math.random() * 9000000),
    role: payload.role?.trim() || (referralType === 'admin' ? 'General Contractor' : 'Commercial Hub Specialist'),
    hourlyRate: 250,
    location: payload.location?.trim() || 'Cape Town, Western Cape',
    avatar: chosenAvatar,
    bio: `Joined via ${referralType === 'admin' ? 'Admin' : 'Tenant'} direct referral link. Verified partner on TimeGiG.`,
    skills: ['Reliable', 'Customer Service', 'Verified'],
    rating: 5.0,
    reviewsCount: 1,
    completedGigs: 0,
    isAvailable: true,
    isLive: true,
    latitude: -33.9249 + (Math.random() - 0.5) * 0.05,
    longitude: 18.4241 + (Math.random() - 0.5) * 0.05,
    joinedDate: todayStr,
    verificationStatus: payload.verificationStatus || (referralType === 'admin' ? 'Verified' : 'Pending'),
    isSubscribed: payload.isSubscribed ?? false,
    subscriptionPlan: payload.isSubscribed ? 'User Subscription' : undefined,
    subscriptionAmount: payload.isSubscribed ? 29.99 : 0,
    subscriptionStartDate: payload.isSubscribed ? todayStr : undefined,
    referredBy: referralType === 'admin' ? 'Admin' : 'Tenant',
    referredByType: referralType,
    referredAt: todayStr,
  };

  saveRegisteredUser(newUser);

  let adminRef: AdminReferralRecord | undefined;
  let tenantRef: TenantReferralRecord | undefined;

  if (referralType === 'admin') {
    adminRef = {
      id: `a-ref-${newUser.id}`,
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
      userPhone: newUser.phone,
      userAvatar: newUser.avatar,
      userRole: newUser.role,
      userLocation: newUser.location,
      joinedDate: todayStr,
      status: (payload.initialStatus as any) || 'Active',
      referralCode: 'admin',
      notes: payload.notes || 'Joined through Admin referral link',
      verificationStatus: newUser.verificationStatus,
      isSubscribed: newUser.isSubscribed,
    };
    saveAdminReferral(adminRef);
  } else {
    tenantRef = {
      id: `t-ref-${newUser.id}`,
      userId: newUser.id,
      name: newUser.name,
      role: newUser.role,
      email: newUser.email,
      phone: newUser.phone,
      avatar: newUser.avatar,
      location: newUser.location,
      joinedDate: todayStr,
      status: (payload.initialStatus as any) || 'Active',
      completedGigs: 0,
      tenantAssigned: 'Commercial Tenant Hub',
      unitAssigned: payload.unitAssigned || 'Unit ' + Math.floor(10 + Math.random() * 90),
      notes: payload.notes || 'Joined through Tenant referral link',
    };
    saveTenantReferral(tenantRef);
  }

  addRealActivity({
    userId: newUser.id,
    userName: newUser.name,
    userAvatar: newUser.avatar,
    userRole: newUser.role,
    activityType: 'registration',
    description: `Joined via ${referralType === 'admin' ? 'Admin' : 'Tenant'} referral link`,
    location: newUser.location,
    amount: 0,
    profit: 0,
    status: 'Live',
  });

  return { user: newUser, adminRef, tenantRef };
};

export const getCapturedReferralCode = (): string | null => {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        localStorage.setItem(STORAGE_REFERRAL_CODE_KEY, ref.toLowerCase());
        return ref.toLowerCase();
      }
    }
    return localStorage.getItem(STORAGE_REFERRAL_CODE_KEY);
  } catch {
    return null;
  }
};

export const STORAGE_FRESH_START_FLAG = 'timegig_profits_fresh_start_reset_v3';

export const resetAllProfitsFreshStart = (): void => {
  try {
    // 1. Reset Admin Referrals (clears admin Tenant Profit & admin User Sub Profit)
    localStorage.removeItem(STORAGE_ADMIN_REFERRALS_KEY);

    // 2. Reset Real Tenants (clears tenant Live Subscription Profit)
    localStorage.removeItem(STORAGE_REAL_TENANTS_KEY);

    // 3. Reset PoPs
    localStorage.removeItem(STORAGE_TENANT_POPS_KEY);
    localStorage.removeItem(STORAGE_USER_POPS_KEY);

    // 4. Reset User Subscriptions on registered users (so no subscription amount creates profit)
    const users = getRegisteredUsers();
    if (users.length > 0) {
      const sanitizedUsers = users.map((u: any) => ({
        ...u,
        isSubscribed: false,
        subscriptionPlan: undefined,
        subscriptionAmount: 0,
      }));
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(sanitizedUsers));
    }

    // 5. Reset Activation Submissions (clear old submissions so no ghost profits exist)
    localStorage.removeItem(STORAGE_ACTIVATION_SUBMISSIONS_KEY);

    // 6. Reset Tenant Subscription State to fresh inactive/unlocked state
    localStorage.removeItem(STORAGE_TENANT_SUBSCRIPTION_KEY);
    localStorage.setItem(STORAGE_TENANT_ACTIVATION_KEY, 'false');

    // 7. Sanitize Real Activities to 0 profit & 0 amount
    const acts = getRealActivities();
    if (acts.length > 0) {
      const sanitizedActs = acts.map((a) => ({
        ...a,
        profit: 0,
        amount: 0,
      }));
      localStorage.setItem(STORAGE_REAL_ACTIVITIES_KEY, JSON.stringify(sanitizedActs));
    } else {
      localStorage.removeItem(STORAGE_REAL_ACTIVITIES_KEY);
    }
  } catch (err) {
    console.error('Failed to reset all profits:', err);
  }
};

export const checkAndRunAutoFreshStart = (): void => {
  try {
    if (typeof window !== 'undefined') {
      const hasReset = localStorage.getItem(STORAGE_FRESH_START_FLAG);
      if (!hasReset) {
        resetAllProfitsFreshStart();
        localStorage.setItem(STORAGE_FRESH_START_FLAG, 'true');
      }
    }
  } catch (err) {
    console.error('Failed to check auto fresh start:', err);
  }
};

// Immediately execute fresh start check on import
checkAndRunAutoFreshStart();


