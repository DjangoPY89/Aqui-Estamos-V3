import { ExtraService, FrequencyType, PricingBreakdown, ServiceHour } from "@/types";

export const SERVICE_PACKAGES: Record<
  ServiceHour,
  {
    name: string;
    hours: ServiceHour;
    basePrice: number; // Gs.
    tagline: string;
    description: string;
    popular?: boolean;
    features: string[];
  }
> = {
  4: {
    name: "Express",
    hours: 4,
    basePrice: 145000,
    tagline: "Ideal para departamentos pequeños",
    description: "Mantenimiento rápido de áreas específicas como baños, cocina y pisos.",
    features: [
      "Mantenimiento esencial",
      "Espacios de 1-2 ambientes",
      "Limpieza de superficies y pisos",
      "Desinfección de baño y cocina",
    ],
  },
  6: {
    name: "Integral",
    hours: 6,
    basePrice: 185000,
    tagline: "Nuestra opción más equilibrada",
    description: "Perfecta para una limpieza detallada de un hogar promedio de 2 a 3 habitaciones.",
    popular: true,
    features: [
      "Limpieza profunda de baños",
      "Desinfección total de cocina",
      "Organización general y dormitorios",
      "Lavado y aspirado de pisos",
    ],
  },
  8: {
    name: "Full Day",
    hours: 8,
    basePrice: 245000,
    tagline: "Jornada completa y exhaustiva",
    description: "Para hogares grandes, limpiezas de mudanza o reseteo profundo.",
    features: [
      "Limpieza de fin de obra / mudanza",
      "Interior de vidrios y gabinetes",
      "Atención detallada a cada rincón",
      "Lavado y doblado de prendas",
    ],
  },
};

export const AVAILABLE_EXTRAS: ExtraService[] = [
  {
    id: "nevera",
    name: "Limpieza de Heladera",
    price: 10000,
    icon: "❄️",
    description: "Desinfección y limpieza interna profunda",
  },
  {
    id: "horno",
    name: "Limpieza de Horno",
    price: 10000,
    icon: "🔥",
    description: "Eliminación de grasa acumulada",
  },
  {
    id: "lavanderia",
    name: "Lavado de Ropa (Carga)",
    price: 25000,
    icon: "🧺",
    description: "Carga en lavarropas y tendido",
  },
  {
    id: "ventanas",
    name: "Limpieza de Ventanales",
    price: 0,
    icon: "🪟",
    description: "Incluido en tiempo contratado",
  },
  {
    id: "gabinetes",
    name: "Interior de Gabinetes",
    price: 0,
    icon: "🚪",
    description: "Incluido en tiempo contratado",
  },
];

export function calculatePricing(
  hours: ServiceHour,
  frequency: FrequencyType,
  selectedExtrasIds: string[] = [],
  datesCount: number = 1
): PricingBreakdown {
  const pkg = SERVICE_PACKAGES[hours] || SERVICE_PACKAGES[4];
  const basePrice = pkg.basePrice;

  // Calcular suma de extras con costo adicional por servicio
  const extrasTotal = selectedExtrasIds.reduce((sum, extraId) => {
    const extra = AVAILABLE_EXTRAS.find((e) => e.id === extraId);
    return sum + (extra ? extra.price : 0);
  }, 0);

  const singleServiceSubtotal = basePrice + extrasTotal;
  const count = frequency === "custom" || frequency === "multi_weekly" || frequency === "weekly_2_4" ? Math.max(datesCount, 1) : 1;
  const subtotal = singleServiceSubtotal * count;

  // Descuentos según las especificaciones:
  // - Personalizado (al menos 5 fechas en 30 días): 20% OFF
  // - Más de una vez por semana: 15% OFF
  // - Semanal: 15% OFF
  // - Quincenal: 10% OFF
  // - Mensual: 5% OFF
  // - Servicio Único: 0%
  let discountPercentage = 0;
  if (frequency === "custom") {
    discountPercentage = 20; // 20% OFF
  } else if (frequency === "multi_weekly" || frequency === "weekly_2_4") {
    discountPercentage = 15; // 15% OFF
  } else if (frequency === "weekly") {
    discountPercentage = 15; // 15% OFF
  } else if (frequency === "biweekly") {
    discountPercentage = 10; // 10% OFF
  } else if (frequency === "monthly") {
    discountPercentage = 5;  // 5% OFF
  }

  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const finalPrice = subtotal - discountAmount;

  return {
    basePrice: basePrice * count,
    extrasTotal: extrasTotal * count,
    subtotal,
    discountPercentage,
    discountAmount,
    finalPrice,
    hoursTitle: `${pkg.name} (${hours} Horas)`,
  };
}

export function formatGs(amount: number): string {
  return new Intl.NumberFormat("es-PY", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " Gs.";
}
