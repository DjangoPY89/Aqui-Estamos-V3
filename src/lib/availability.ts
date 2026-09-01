import fs from 'fs';
import path from 'path';
import { 
  AvailabilitySettings, 
  DateAvailabilityCheck, 
  DayOfWeek, 
  BlockedDate, 
  TimeSlotConfig 
} from '@/types';
import { getAllEmployees, getBookings, getAvailabilitySettingsFromDb, saveAvailabilitySettingsToDb } from '@/lib/db';
import { 
  supabaseGetAllEmployees, 
  supabaseGetAllBookings,
  supabaseGetAvailabilitySettings,
  supabaseSaveAvailabilitySettings
} from '@/lib/supabase-db';

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'availability-settings.json');
const TMP_SETTINGS_FILE_PATH = path.join('/tmp', 'aquiestamos_availability_settings.json');

// Feriados Oficiales de Paraguay Precargados
export const DEFAULT_PARAGUAY_HOLIDAYS: BlockedDate[] = [
  // 2025
  { id: 'hol_2025_01_01', date: '2025-01-01', reason: 'Año Nuevo', isHoliday: true, enabled: true },
  { id: 'hol_2025_03_01', date: '2025-03-01', reason: 'Día de los Héroes', isHoliday: true, enabled: true },
  { id: 'hol_2025_04_17', date: '2025-04-17', reason: 'Jueves Santo', isHoliday: true, enabled: true },
  { id: 'hol_2025_04_18', date: '2025-04-18', reason: 'Viernes Santo', isHoliday: true, enabled: true },
  { id: 'hol_2025_05_01', date: '2025-05-01', reason: 'Día del Trabajador', isHoliday: true, enabled: true },
  { id: 'hol_2025_05_14', date: '2025-05-14', reason: 'Independencia Nacional (Día 1)', isHoliday: true, enabled: true },
  { id: 'hol_2025_05_15', date: '2025-05-15', reason: 'Independencia Nacional / Día de la Madre', isHoliday: true, enabled: true },
  { id: 'hol_2025_06_12', date: '2025-06-12', reason: 'Paz del Chaco', isHoliday: true, enabled: true },
  { id: 'hol_2025_08_15', date: '2025-08-15', reason: 'Fundación de Asunción', isHoliday: true, enabled: true },
  { id: 'hol_2025_09_29', date: '2025-09-29', reason: 'Victoria de Boquerón', isHoliday: true, enabled: true },
  { id: 'hol_2025_12_08', date: '2025-12-08', reason: 'Virgen de Caacupé', isHoliday: true, enabled: true },
  { id: 'hol_2025_12_25', date: '2025-12-25', reason: 'Navidad', isHoliday: true, enabled: true },

  // 2026
  { id: 'hol_2026_01_01', date: '2026-01-01', reason: 'Año Nuevo', isHoliday: true, enabled: true },
  { id: 'hol_2026_03_01', date: '2026-03-01', reason: 'Día de los Héroes', isHoliday: true, enabled: true },
  { id: 'hol_2026_04_02', date: '2026-04-02', reason: 'Jueves Santo', isHoliday: true, enabled: true },
  { id: 'hol_2026_04_03', date: '2026-04-03', reason: 'Viernes Santo', isHoliday: true, enabled: true },
  { id: 'hol_2026_05_01', date: '2026-05-01', reason: 'Día del Trabajador', isHoliday: true, enabled: true },
  { id: 'hol_2026_05_14', date: '2026-05-14', reason: 'Independencia Nacional (Día 1)', isHoliday: true, enabled: true },
  { id: 'hol_2026_05_15', date: '2026-05-15', reason: 'Independencia Nacional / Día de la Madre', isHoliday: true, enabled: true },
  { id: 'hol_2026_06_12', date: '2026-06-12', reason: 'Paz del Chaco', isHoliday: true, enabled: true },
  { id: 'hol_2026_08_15', date: '2026-08-15', reason: 'Fundación de Asunción', isHoliday: true, enabled: true },
  { id: 'hol_2026_09_29', date: '2026-09-29', reason: 'Victoria de Boquerón', isHoliday: true, enabled: true },
  { id: 'hol_2026_12_08', date: '2026-12-08', reason: 'Virgen de Caacupé', isHoliday: true, enabled: true },
  { id: 'hol_2026_12_25', date: '2026-12-25', reason: 'Navidad', isHoliday: true, enabled: true },

  // 2027
  { id: 'hol_2027_01_01', date: '2027-01-01', reason: 'Año Nuevo', isHoliday: true, enabled: true },
  { id: 'hol_2027_03_01', date: '2027-03-01', reason: 'Día de los Héroes', isHoliday: true, enabled: true },
  { id: 'hol_2027_03_25', date: '2027-03-25', reason: 'Jueves Santo', isHoliday: true, enabled: true },
  { id: 'hol_2027_03_26', date: '2027-03-26', reason: 'Viernes Santo', isHoliday: true, enabled: true },
  { id: 'hol_2027_05_01', date: '2027-05-01', reason: 'Día del Trabajador', isHoliday: true, enabled: true },
  { id: 'hol_2027_05_14', date: '2027-05-14', reason: 'Independencia Nacional (Día 1)', isHoliday: true, enabled: true },
  { id: 'hol_2027_05_15', date: '2027-05-15', reason: 'Independencia Nacional / Día de la Madre', isHoliday: true, enabled: true },
  { id: 'hol_2027_06_12', date: '2027-06-12', reason: 'Paz del Chaco', isHoliday: true, enabled: true },
  { id: 'hol_2027_08_15', date: '2027-08-15', reason: 'Fundación de Asunción', isHoliday: true, enabled: true },
  { id: 'hol_2027_09_29', date: '2027-09-29', reason: 'Victoria de Boquerón', isHoliday: true, enabled: true },
  { id: 'hol_2027_12_08', date: '2027-12-08', reason: 'Virgen de Caacupé', isHoliday: true, enabled: true },
  { id: 'hol_2027_12_25', date: '2027-12-25', reason: 'Navidad', isHoliday: true, enabled: true },
];

export const DEFAULT_TIME_SLOTS: TimeSlotConfig[] = [
  { id: 'slot_0730', time: '07:30', label: 'Temprano (07:30 AM)', period: 'morning', enabled: false },
  { id: 'slot_0800', time: '08:00', label: 'Mañana (08:00 AM)', period: 'morning', enabled: true },
  { id: 'slot_1300', time: '13:00', label: 'Tarde (13:00 PM)', period: 'afternoon', enabled: true },
  { id: 'slot_1400', time: '14:00', label: 'Media Tarde (14:00 PM)', period: 'afternoon', enabled: false },
];

export const DEFAULT_AVAILABILITY_SETTINGS: AvailabilitySettings = {
  workingDays: {
    monday: { enabled: true, name: 'Lunes', startTime: '07:00', endTime: '18:00' },
    tuesday: { enabled: true, name: 'Martes', startTime: '07:00', endTime: '18:00' },
    wednesday: { enabled: true, name: 'Miércoles', startTime: '07:00', endTime: '18:00' },
    thursday: { enabled: true, name: 'Jueves', startTime: '07:00', endTime: '18:00' },
    friday: { enabled: true, name: 'Viernes', startTime: '07:00', endTime: '18:00' },
    saturday: { enabled: true, name: 'Sábado', startTime: '07:30', endTime: '13:00' },
    sunday: { enabled: false, name: 'Domingo', startTime: '08:00', endTime: '14:00' },
  },
  timeSlots: DEFAULT_TIME_SLOTS,
  capacityMode: 'AUTO_BY_EMPLOYEES',
  maxBookingsPerEmployeePerDay: 2,
  manualDailyMaxBookings: 8,
  blockedDates: DEFAULT_PARAGUAY_HOLIDAYS,
  allowSundayBookings: false,
  allowHolidayBookings: false,
  minAdvanceHours: 12,
  maxAdvanceDays: 60,
  updatedAt: new Date().toISOString(),
};

declare global {
  var __aquiestamos_availability_settings: AvailabilitySettings | undefined;
}

// Función auxiliar para combinar listas de fechas bloqueadas sin duplicados
function mergeBlockedDates(existingList: BlockedDate[] = [], defaultHolidays: BlockedDate[] = []): BlockedDate[] {
  const map = new Map<string, BlockedDate>();

  // 1. Insertar feriados por defecto
  defaultHolidays.forEach((h) => {
    map.set(h.id, h);
  });

  // 2. Insertar o sobreescribir con las fechas y rangos existentes
  existingList.forEach((b) => {
    map.set(b.id, b);
  });

  return Array.from(map.values());
}

/**
 * Carga asíncrona de configuraciones desde Supabase Cloud DB.
 * Garantiza sincronización en tiempo real 100% cross-device (PC, Mac, iPhone, Android).
 */
export async function getAvailabilitySettingsAsync(): Promise<AvailabilitySettings> {
  try {
    const supaSettings = await supabaseGetAvailabilitySettings();
    if (supaSettings && typeof supaSettings === 'object' && supaSettings.workingDays) {
      const merged: AvailabilitySettings = {
        ...DEFAULT_AVAILABILITY_SETTINGS,
        ...supaSettings,
        blockedDates: mergeBlockedDates(supaSettings.blockedDates || [], DEFAULT_PARAGUAY_HOLIDAYS),
      };
      globalThis.__aquiestamos_availability_settings = merged;
      return merged;
    }
  } catch (e) {
    console.error('Error fetching availability settings from Supabase:', e);
  }

  return getAvailabilitySettings();
}

/**
 * Guarda asíncronamente en Supabase Cloud DB y actualiza cachés locales.
 */
export async function saveAvailabilitySettingsAsync(newSettings: Partial<AvailabilitySettings>): Promise<AvailabilitySettings> {
  const current = await getAvailabilitySettingsAsync();

  const mergedBlockedDates = newSettings.blockedDates !== undefined 
    ? newSettings.blockedDates 
    : current.blockedDates;

  const updated: AvailabilitySettings = {
    ...current,
    ...newSettings,
    blockedDates: mergedBlockedDates,
    updatedAt: new Date().toISOString(),
  };

  // Guardar en Supabase Cloud (garantiza persistencia cross-device)
  try {
    await supabaseSaveAvailabilitySettings(updated);
  } catch (e) {
    console.error('Error saving availability settings to Supabase:', e);
  }

  // Actualizar memoria y archivos locales
  globalThis.__aquiestamos_availability_settings = updated;
  try { saveAvailabilitySettingsToDb(updated); } catch (e) {}
  try { fs.writeFileSync(TMP_SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8'); } catch (e) {}

  return updated;
}

export function getAvailabilitySettings(): AvailabilitySettings {
  if (globalThis.__aquiestamos_availability_settings) {
    return globalThis.__aquiestamos_availability_settings;
  }

  // 0. Intentar leer desde el store compartido de db.ts (fuente más fiable cross-device en Vercel)
  try {
    const dbSettings = getAvailabilitySettingsFromDb();
    if (dbSettings && typeof dbSettings === 'object' && dbSettings.workingDays) {
      const merged: AvailabilitySettings = {
        ...DEFAULT_AVAILABILITY_SETTINGS,
        ...dbSettings,
        blockedDates: mergeBlockedDates(dbSettings.blockedDates || [], DEFAULT_PARAGUAY_HOLIDAYS),
      };
      globalThis.__aquiestamos_availability_settings = merged;
      return merged;
    }
  } catch (e) {}

  // 1. Intentar leer desde /tmp (Vercel serverless)
  try {
    if (fs.existsSync(TMP_SETTINGS_FILE_PATH)) {
      const tmpData = fs.readFileSync(TMP_SETTINGS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(tmpData);
      if (parsed && typeof parsed === 'object') {
        const merged: AvailabilitySettings = {
          ...DEFAULT_AVAILABILITY_SETTINGS,
          ...parsed,
          blockedDates: mergeBlockedDates(parsed.blockedDates || [], DEFAULT_PARAGUAY_HOLIDAYS),
        };
        globalThis.__aquiestamos_availability_settings = merged;
        try { saveAvailabilitySettingsToDb(merged); } catch (e) {}
        return merged;
      }
    }
  } catch (e) {}

  // 2. Intentar leer desde src/data/availability-settings.json
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        const merged: AvailabilitySettings = {
          ...DEFAULT_AVAILABILITY_SETTINGS,
          ...parsed,
          blockedDates: mergeBlockedDates(parsed.blockedDates || [], DEFAULT_PARAGUAY_HOLIDAYS),
        };
        globalThis.__aquiestamos_availability_settings = merged;
        try { saveAvailabilitySettingsToDb(merged); } catch (e) {}
        return merged;
      }
    }
  } catch (error) {
    console.error('Error reading availability settings file:', error);
  }

  globalThis.__aquiestamos_availability_settings = DEFAULT_AVAILABILITY_SETTINGS;
  return DEFAULT_AVAILABILITY_SETTINGS;
}

export function saveAvailabilitySettings(newSettings: Partial<AvailabilitySettings>): AvailabilitySettings {
  const current = getAvailabilitySettings();
  
  const mergedBlockedDates = newSettings.blockedDates !== undefined 
    ? newSettings.blockedDates 
    : current.blockedDates;

  const updated: AvailabilitySettings = {
    ...current,
    ...newSettings,
    blockedDates: mergedBlockedDates,
    updatedAt: new Date().toISOString(),
  };

  // Guardar en variable global de proceso
  globalThis.__aquiestamos_availability_settings = updated;

  // Guardar en el store compartido de db.ts (cross-device — FUENTE PRINCIPAL en Vercel)
  try { saveAvailabilitySettingsToDb(updated); } catch (e) {}

  // Guardar en /tmp (compatible con Vercel)
  try {
    fs.writeFileSync(TMP_SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e) {}

  // Guardar en src/data si está en entorno con permisos de escritura
  try {
    const dataDir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (error) {}

  return updated;
}

export const DAY_OF_WEEK_MAP: Record<number, DayOfWeek> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export async function checkDateAvailability(dateStr: string): Promise<DateAvailabilityCheck> {
  const settings = await getAvailabilitySettingsAsync();
  
  // 1. Obtener empleados activos
  let employees: any[] = [];
  try {
    employees = await supabaseGetAllEmployees();
  } catch (e) {
    employees = getAllEmployees();
  }
  const activeEmployees = employees.filter((emp) => emp.status === 'ACTIVE');
  const totalActiveEmployees = Math.max(1, activeEmployees.length);

  // 2. Analizar día de la semana
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayKey = DAY_OF_WEEK_MAP[dateObj.getDay()];
  const daySchedule = settings.workingDays[dayKey];
  const isSunday = dayKey === 'sunday';
  const isSaturday = dayKey === 'saturday';

  // 3. Determinar capacidad máxima según reglas operativas
  // Sábado: 1 servicio de 4h por empleada activa (capacidad = N * 1)
  // Lunes a Viernes: hasta 2 servicios de 4h por empleada activa (capacidad = N * 2 cupos de 4h)
  const maxCapacityPerEmp = isSaturday ? 1 : (settings.maxBookingsPerEmployeePerDay || 2);
  const maxCapacity = settings.capacityMode === 'AUTO_BY_EMPLOYEES'
    ? totalActiveEmployees * maxCapacityPerEmp
    : (isSaturday ? Math.min(totalActiveEmployees, settings.manualDailyMaxBookings || 4) : (settings.manualDailyMaxBookings || 8));

  // 4. Obtener reservas existentes para esa fecha
  let allBookings: any[] = [];
  try {
    allBookings = await supabaseGetAllBookings();
  } catch (e) {
    allBookings = getBookings();
  }

  const dateBookings = allBookings.filter(
    (b) => b.serviceDate === dateStr && b.status !== 'CANCELLED'
  );
  
  // Consumo efectivo de cupos de 4 horas:
  // - En sábado: cada servicio consume 1 cupo.
  // - De lunes a viernes: servicios de 6 u 8 horas consumen 2 cupos; servicios de 4 horas consumen 1 cupo.
  let effectiveUsedCapacity = 0;
  dateBookings.forEach((b) => {
    const hours = Number(b.serviceHours) || 4;
    if (isSaturday) {
      effectiveUsedCapacity += 1;
    } else {
      effectiveUsedCapacity += hours >= 6 ? 2 : 1;
    }
  });

  const currentBookingsCount = dateBookings.length;
  const availableCapacity = Math.max(0, maxCapacity - effectiveUsedCapacity);
  const isFullyBooked = availableCapacity <= 0;

  // 5. Analizar si es Feriado o Fecha Bloqueada
  const blockedEntry = settings.blockedDates.find((b) => {
    if (!b.enabled) return false;
    if (b.endDate) {
      return dateStr >= b.date && dateStr <= b.endDate;
    }
    return b.date === dateStr;
  });
  const isHoliday = !!blockedEntry?.isHoliday;
  const holidayReason = blockedEntry?.reason;

  // Determinar si está abierto
  let isOpen = true;
  let closedReason: string | undefined = undefined;

  if (isSunday && !settings.allowSundayBookings && !daySchedule?.enabled) {
    isOpen = false;
    closedReason = 'Domingo - Atención cerrada por descanso semanal.';
  } else if (blockedEntry) {
    isOpen = false;
    closedReason = 'Cerrado por ' + (blockedEntry.reason || 'Día No Laborable') + '.';
  } else if (!daySchedule?.enabled) {
    isOpen = false;
    closedReason = (daySchedule?.name || 'Día') + ' no operativo.';
  } else if (isFullyBooked) {
    isOpen = false;
    closedReason = `Capacidad completa (${effectiveUsedCapacity}/${maxCapacity} cupos cubiertos hoy).`;
  }

  // 6. Slots y disponibilidad por turno
  const enabledSlots = settings.timeSlots.filter((s) => s.enabled);
  const slots = enabledSlots.map((slot) => {
    // Sábados: turnos posteriores a las 12:00 PM no operan
    const isSaturdayAfternoon = isSaturday && slot.time >= '13:00';
    const slotBookings = dateBookings.filter((b) => b.serviceTime === slot.time).length;
    const slotMaxCapacity = isSaturday ? totalActiveEmployees : (slot.maxCapacityPerSlot || totalActiveEmployees);
    const slotAvailable = isOpen && !isSaturdayAfternoon && slotBookings < slotMaxCapacity && !isFullyBooked;

    return {
      time: slot.time,
      label: slot.label,
      enabled: slot.enabled && !isSaturdayAfternoon,
      currentBookings: slotBookings,
      maxCapacity: slotMaxCapacity,
      available: slotAvailable,
    };
  });

  return {
    date: dateStr,
    isOpen,
    isSunday,
    isHoliday,
    holidayReason,
    closedReason,
    totalActiveEmployees,
    maxCapacity,
    currentBookingsCount,
    availableCapacity,
    isFullyBooked,
    slots,
  };
}
