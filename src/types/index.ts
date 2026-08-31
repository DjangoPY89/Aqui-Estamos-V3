export type ServiceHour = 4 | 6 | 8;
export type FrequencyType = 'once' | 'multi_weekly' | 'weekly' | 'biweekly' | 'monthly' | 'weekly_2_4';
export type PaymentMethod = 'sipap' | 'card' | 'cash';
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
  selectedDates?: string[]; // Fechas múltiples para multi_weekly
  serviceTime: string; // "08:00", "09:00", etc.
  totalPrice: number; // en Gs.
  discount: number; // en Gs.
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  preferredCleanerId?: string | null;
  assignedCleaner?: string | null;
  employeeName?: string | null;
  employeeImage?: string | null;
  employeePhone?: string | null;
  employeeRating?: number | null;
  employeeZone?: string | null;
  employeeIps?: boolean | null;
  notes?: string | null;
  rating?: number | null;
  reviewComment?: string | null;
  reviewedAt?: string | null;
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
  latitude?: number | null;
  longitude?: number | null;
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
  rating?: number | null;
  reviewCount?: number;
  ratingsHistory?: { rating: number; comment?: string; customerName?: string; createdAt: string }[];
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

// -------------------------------------------------------------
// Tipos para Gestión de Disponibilidad y Capacidad de Reservas
// -------------------------------------------------------------

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DaySchedule {
  enabled: boolean;
  name: string;
  startTime: string; // ej: "07:00"
  endTime: string;   // ej: "18:00"
}

export interface TimeSlotConfig {
  id: string;
  time: string; // "07:00", "08:00", "13:00", etc.
  label: string; // "Turno Mañana (08:00 AM)"
  period: 'morning' | 'afternoon' | 'evening';
  enabled: boolean;
  maxCapacityPerSlot?: number; // límite opcional por turno específico
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD (fecha puntual o fecha de inicio)
  endDate?: string; // YYYY-MM-DD (opcional para rangos de fechas)
  reason: string; // "Año Nuevo", "Feriado Nacional", "Mantenimiento Operativo", "Vacaciones"
  isHoliday: boolean;
  enabled: boolean;
}

export type CapacityMode = 'AUTO_BY_EMPLOYEES' | 'MANUAL_LIMIT';

export interface AvailabilitySettings {
  workingDays: Record<DayOfWeek, DaySchedule>;
  timeSlots: TimeSlotConfig[];
  capacityMode: CapacityMode;
  maxBookingsPerEmployeePerDay: number; // Por defecto: 1 o 2 turnos por empleado
  manualDailyMaxBookings: number; // Por si se usa límite manual
  blockedDates: BlockedDate[];
  allowSundayBookings: boolean;
  allowHolidayBookings: boolean;
  minAdvanceHours: number; // Mínimo de horas previas para reservar (ej: 12h)
  maxAdvanceDays: number; // Máximo de días hacia adelante para reservar (ej: 60 días)
  updatedAt: string;
}

export interface DateAvailabilityCheck {
  date: string;
  isOpen: boolean;
  isSunday: boolean;
  isHoliday: boolean;
  holidayReason?: string;
  closedReason?: string;
  totalActiveEmployees: number;
  maxCapacity: number;
  currentBookingsCount: number;
  availableCapacity: number;
  isFullyBooked: boolean;
  slots: {
    time: string;
    label: string;
    enabled: boolean;
    currentBookings: number;
    maxCapacity: number;
    available: boolean;
  }[];
}
