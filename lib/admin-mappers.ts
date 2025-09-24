import {
  coerceBoolean,
  coerceId,
  coerceNullableString,
  coerceNumber,
  coerceString,
  coerceStringArray,
  isRecord,
} from "./utils";
import { AdminArtist, AdminArtistStat, AdminLocation } from "./types";

export const mapAdminLocation = (location: unknown): AdminLocation => {
  if (!isRecord(location)) {
    return {
      id: "",
      name: "",
      city: null,
      district: null,
      address: null,
      phone: null,
      workingHours: null,
      description: null,
      active: true,
    };
  }

  return {
    id: coerceId(location),
    name: coerceString(location.name),
    city: coerceNullableString(location.city),
    district: coerceNullableString(location.district),
    address: coerceNullableString(location.address),
    phone: coerceNullableString(location.phone),
    workingHours: coerceNullableString(location.workingHours),
    description: coerceNullableString(location.description),
    active: coerceBoolean(location.active),
  };
};

export const mapAdminArtist = (artist: unknown): AdminArtist => {
  if (!isRecord(artist)) {
    return {
      id: "",
      name: "",
      bio: null,
      specialties: [],
      avatarUrl: null,
      locations: [],
      active: true,
    };
  }

  const locationEntries = Array.isArray(artist.locations)
    ? artist.locations.map((location) => {
        if (!isRecord(location)) {
          return { id: "", name: "" };
        }

        return {
          id: coerceId(location),
          name: coerceString(location.name),
        };
      })
    : [];

  return {
    id: coerceId(artist),
    name: coerceString(artist.name),
    bio: coerceNullableString(artist.bio),
    specialties: coerceStringArray(artist.specialties),
    avatarUrl: coerceNullableString(artist.avatarUrl),
    locations: locationEntries,
    active: coerceBoolean(artist.active),
  };
};

export const mapAdminStat = (stat: unknown): AdminArtistStat => {
  if (!isRecord(stat)) {
    return {
      id: "",
      name: "",
      totalBookings: 0,
      latestBooking: null,
    };
  }

  const artistName = isRecord(stat.artist) ? coerceString(stat.artist.name) : "";

  return {
    id: coerceId(stat),
    name: coerceString(stat.name, artistName),
    totalBookings: coerceNumber(stat.totalBookings),
    latestBooking:
      typeof stat.latestBooking === "string"
        ? new Date(stat.latestBooking).toISOString()
        : null,
  };
};
