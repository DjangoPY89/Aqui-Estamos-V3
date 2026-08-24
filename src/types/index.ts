export type ServiceHour = 4 | 6 | 8;
export type FrequencyType = 'once' | 'weekly_2_4' | 'biweekly' | 'monthly';
export type PaymentMethod = 'cash' | 'sipap' | 'card';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';
export type UserRole = 'CUSTOMER' | 'ADMIN' | 'CLEANER';

export interface ExtraService {
  id: string;
  name: string;
  price: number; // en Gs.
  icon: string;
  description?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  serviceHours: ServiceHour;
  frequency: FrequencyType;
  extras: string[]; // IDs de extras
  serviceDate: string; // YYYY-MM-DD
  serviceTime: string; // "08:00", "09:00", etc.
  totalPrice: number; // en Gs.
  discount: number; // en Gs.
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  assignedCleaner?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  phone?: string | null;
  address?: string | null;
  ruc?: string | null;
  taxName?: string | null;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  ci?: string | null;
  phone: string;
  email?: string | null;
  image?: string | null;
  zone: string;
  ipsVerified: boolean;
  rating: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  activeBookingsCount?: number;
  completedBookingsCount?: number;
  createdAt: string;
}

export interface CorporateLead {
  id: string;
  companyName: string;
  ruc?: string | null;
  facilityType: string;
  contactName: string;
  phone: string;
  email?: string | null;
  requirements?: string | null;
  status: 'NEW' | 'CONTACTED' | 'QUOTE_SENT' | 'WON' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  rating: number; // 1-5
  comment: string;
  serviceType: string;
  isPublished: boolean;
  createdAt: string;
}

export interface PricingBreakdown {
  basePrice: number;
  extrasTotal: number;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  hoursTitle: string;
}
