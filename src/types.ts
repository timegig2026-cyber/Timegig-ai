export type GigCategory = 
  | 'dogwalking'
  | 'cleaning'
  | 'nanny'
  | 'construction'
  | 'security'
  | 'labor'
  | 'movers'
  | 'painting'
  | 'gardening'
  | 'handyman'
  | 'plumbing'
  | 'electrical'
  | 'catering'
  | 'delivery'
  | 'carpentry'
  | 'music' 
  | 'events' 
  | 'creative' 
  | 'tech' 
  | 'services' 
  | 'hospitality';

export interface Gig {
  id: string;
  title: string;
  organizer: string;
  organizerAvatar?: string;
  organizerRating: number;
  organizerReviewCount: number;
  category: GigCategory;
  categoryLabel: string;
  pay: number;
  payType: 'hourly' | 'fixed' | 'per_event';
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  date: string;
  time: string;
  duration: string;
  description: string;
  requirements: string[];
  tags: string[];
  isUrgent?: boolean;
  isVerified?: boolean;
  applicantsCount: number;
  distanceKm?: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  timestamp?: number;
}

export interface GigFilters {
  category: string;
  minPay: number;
  maxPay: number;
  payType: 'all' | 'hourly' | 'fixed';
  maxDistanceKm: number;
  onlyUrgent: boolean;
  searchQuery: string;
}

export type ActiveTab = 'gigs' | 'seekers' | 'post' | 'tenantportal' | 'admin' | 'profile' | 'help' | 'about';

export interface SeekerProfile {
  id: string;
  name: string;
  firstName?: string;
  middleName?: string;
  surname?: string;
  role: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number; // In Rands
  location: string;
  phone: string;
  email: string;
  bio: string;
  skills: string[];
  isAvailable: boolean;
  completedGigs: number;
  latitude: number;
  longitude: number;
  isLive?: boolean;
  socialLinks?: { id: string; platform: string; url: string }[];
  experiences?: {
    id: string;
    role: string;
    organization: string;
    duration: string;
    description: string;
    referenceName: string;
    referenceContact: string;
  }[];
}

export interface RegisteredUser {
  id: string;
  firstName: string;
  middleName?: string;
  surname: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  hourlyRate: number;
  location: string;
  avatar: string;
  bio: string;
  skills: string[];
  rating: number;
  reviewsCount: number;
  completedGigs: number;
  isAvailable: boolean;
  isLive: boolean;
  latitude: number;
  longitude: number;
  joinedDate: string;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
  isSubscribed?: boolean;
  subscriptionPlan?: string;
  subscriptionAmount?: number;
  subscriptionStartDate?: string;
  subscriptionRenewalDate?: string;
  referredBy?: string;
  referredByType?: 'admin' | 'tenant';
  referredAt?: string;
  socialLinks?: { id: string; platform: string; url: string }[];
  experiences?: {
    id: string;
    role: string;
    organization: string;
    duration: string;
    description: string;
    referenceName: string;
    referenceContact: string;
  }[];
}

export interface NavigationRoute {
  seekerLocation: [number, number];
  seekerName: string;
  seekerRole: string;
  seekerAvatar: string;
  userDestination: [number, number];
  destinationName: string;
  distanceKm: number;
  estimatedMinutes: number;
  currentStepIndex: number;
  instructions: string[];
  isNavigating: boolean;
}

export interface TenantPoPRecord {
  id: string;
  reference: string;
  description: string;
  amount: number;
  bank: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Review';
  fileName: string;
}

export interface TenantLeaseRecord {
  id: string;
  userId?: string;
  userName?: string;
  property: string;
  unit: string;
  rent: number;
  status: 'Active' | 'Pending Verification' | 'Expired';
  startDate?: string;
  notes?: string;
}
