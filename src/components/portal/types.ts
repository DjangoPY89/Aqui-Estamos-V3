import { Booking, User } from "@/types";

export interface SavedPortalAddress {
  id: string;
  label: string;
  address: string;
  street?: string;
  apartment?: string;
  reference?: string;
  zone?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export type PortalTabType = "ACTIVE" | "HISTORY" | "INVOICES" | "ADDRESSES" | "PROFILE" | "GUARANTEE";

export const PORTAL_ZONES = [
  { name: "Asunción (Villa Morra / Ykua Satî)", lat: -25.2831, lng: -57.5612 },
  { name: "Asunción (Carmelitas / Manorá)", lat: -25.2775, lng: -57.5670 },
  { name: "Asunción (Santa Teresa / Eje Corporativo)", lat: -25.2890, lng: -57.5520 },
  { name: "Asunción (Centro / Mcal. López)", lat: -25.2867, lng: -57.6470 },
  { name: "Asunción (Mburucuyá / Trinidad)", lat: -25.2650, lng: -57.5580 },
  { name: "Luque (Aeropuerto / Conmebol)", lat: -25.2678, lng: -57.4856 },
  { name: "San Lorenzo (Campus UNA)", lat: -25.3392, lng: -57.5089 },
  { name: "Lambaré (Yacht / Centro)", lat: -25.3456, lng: -57.6083 },
  { name: "Fernando de la Mora", lat: -25.3211, lng: -57.5528 },
];
