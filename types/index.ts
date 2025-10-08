import type { IBooking } from '@/models/Booking';
import type { ICabin } from '@/models/Cabin';
import type { ICustomer } from '@/models/Customer';
import type { IExperience } from '@/models/Experience';
import type { ISettings } from '@/models/Settings';
import type { IDining } from '@/models/Dining';
import { SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Re-export model types for easier importing
export type Cabin = ICabin;
export type Customer = ICustomer;
export type Booking = IBooking;
export type Settings = ISettings;
export type Experience = IExperience;
export type Dining = IDining;

// Extended types for populated models (used in API responses)
export interface PopulatedBooking
  extends Omit<
    IBooking,
    'cabin' | 'customer' | 'checkInDate' | 'checkOutDate'
  > {
  cabin: ICabin;
  customer: ICustomer;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  cabinName?: string;
  guest?: ICustomer;
}

// API request types
export interface CreateCabinData {
  name: string;
  image: string;
  capacity: number;
  price: number;
  discount: number;
  description: string;
  amenities: string[];
}

export interface UpdateCabinData extends Partial<CreateCabinData> {
  _id: string;
}

export interface CreateBookingData {
  cabin: string;
  customer: string;
  checkInDate: Date;
  checkOutDate: Date;
  numGuests: number;
  extras?: {
    hasBreakfast?: boolean;
    hasPets?: boolean;
    hasParking?: boolean;
    hasEarlyCheckIn?: boolean;
    hasLateCheckOut?: boolean;
  };
  specialRequests?: string[];
  observations?: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  nationalId: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    smokingPreference?: 'smoking' | 'non-smoking' | 'no-preference';
    dietaryRestrictions?: string[];
    accessibilityNeeds?: string[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Cabin availability check
export interface AvailabilityQuery {
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
}

export interface AvailableCabin extends ICabin {
  isAvailable: boolean;
  conflictingBookings?: string[];
}

// Experience-related types
export interface ExperienceQueryParams {
  category?: string;
  difficulty?: 'Easy' | 'Moderate' | 'Challenging';
  minPrice?: number;
  maxPrice?: number;
  isPopular?: boolean;
  tags?: string[];
}

export interface CreateExperienceData {
  name: string;
  price: number;
  duration: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  category: string;
  description: string;
  longDescription?: string;
  image: string;
  gallery?: string[];
  includes: string[];
  available: string[];
  ctaText: string;
  isPopular?: boolean;
  maxParticipants?: number;
  minAge?: number;
  requirements?: string[];
  location?: string;
  highlights?: string[];
  whatToBring?: string[];
  cancellationPolicy?: string;
  seasonality?: string;
  tags?: string[];
}

export interface UpdateExperienceData extends Partial<CreateExperienceData> {
  _id: string;
}

// Dining-related types
export interface DiningQueryParams {
  type?: 'menu' | 'experience';
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'all-day';
  category?: 'regular' | 'craft-beer' | 'wine' | 'spirits' | 'non-alcoholic';
  isPopular?: boolean;
  dietary?: string[];
  minPrice?: number;
  maxPrice?: number;
}
