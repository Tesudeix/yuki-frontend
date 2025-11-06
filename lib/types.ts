export type MessageTone = "info" | "success" | "error";

export type MessageDescriptor = {
  tone: MessageTone;
  text: string;
};

export type AuthenticatedUserBase = {
  phone: string;
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  age?: number | null;
  lastVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  lastPasswordResetAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  hasPassword?: boolean;
};

export type AuthenticatedUser = AuthenticatedUserBase & Record<string, unknown>;

export type SalonLocation = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  description?: string | null;
  imageUrl?: string | null;
};

export type SalonArtist = {
  id: string;
  name: string;
  bio?: string | null;
  specialties: string[];
  avatarUrl?: string | null;
};

export type AvailabilitySlot = {
  time: string;
  available: boolean;
};

export type AvailabilityDay = {
  date: string;
  weekday?: string;
  slots: AvailabilitySlot[];
};

export type BookingSummary = {
  id: string;
  status: string;
  date: string;
  time: string;
  location: { id: string; name: string };
  artist: { id: string; name: string };
  createdAt?: string | null;
};

export type AdminProfile = {
  id: string;
  phone: string;
  name?: string | null;
};

export type AdminLocation = {
  id: string;
  name: string;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  phone?: string | null;
  workingHours?: string | null;
  description?: string | null;
  active?: boolean;
};

export type AdminArtist = {
  id: string;
  name: string;
  bio?: string | null;
  specialties: string[];
  avatarUrl?: string | null;
  locations: { id: string; name: string }[];
  active: boolean;
};

export type AdminArtistStat = {
  id: string;
  name: string;
  totalBookings: number;
  latestBooking?: string | null;
};

export type AdminLocationForm = {
  id: string | null;
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  workingHours: string;
  description: string;
  active: boolean;
};

export type AdminArtistForm = {
  id: string | null;
  name: string;
  bio: string;
  specialtiesText: string;
  avatarUrl: string;
  locationIds: string[];
  active: boolean;
};

export const bookingSteps = [
  { key: "location", label: "1. Салон" },
  { key: "artist", label: "2. Артист" },
  { key: "time", label: "3. Цаг" },
  { key: "summary", label: "4. Баталгаажсан" },
] as const;

export type BookingStep = (typeof bookingSteps)[number]["key"];

export type AdminTab = "locations" | "artists" | "analytics";

export type AuthMode = "register" | "login";
