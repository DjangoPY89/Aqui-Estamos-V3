"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Check, 
  Ban, 
  Sparkles,
  Info
} from 'lucide-react';
import { AvailabilitySettings, BlockedDate } from '@/types';

interface BookingCalendarPickerProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  availabilitySettings?: AvailabilitySettings | null;
  disabled?: boolean;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function BookingCalendarPicker({
  selectedDate,
  onSelectDate,
  availabilitySettings,
  disabled = false,
}: BookingCalendarPickerProps) {
  // Fecha actual o fecha seleccionada para inicializar el mes visible
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  
  const [localSettings, setLocalSettings] = useState<AvailabilitySettings | null>(() => {
    if (availabilitySettings) return availabilitySettings;
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('aquiestamos_admin_availability_settings');
        if (local) return JSON.parse(local);
      } catch (e) {}
    }
    return null;
  });
  
  const [isLoadingSettings, setIsLoadingSettings] = useState(!availabilitySettings);

  // Función para sincronizar la disponibilidad más reciente de la nube
  const loadFreshAvailability = useCallback(() => {
    fetch(`/api/availability?t=${Date.now()}`, { 
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } 
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          let mergedSettings = data.settings;
          try {
            const local = localStorage.getItem('aquiestamos_admin_availability_settings');
            if (local) {
              const parsed = JSON.parse(local);
              if (parsed?.blockedDates && Array.isArray(parsed.blockedDates)) {
                const map = new Map<string, any>();
                parsed.blockedDates.forEach((b: any) => map.set(b.id, b));
                (mergedSettings.blockedDates || []).forEach((b: any) => map.set(b.id, b));
                mergedSettings = { ...mergedSettings, blockedDates: Array.from(map.values()) };
              }
            }
          } catch (e) {}
          setLocalSettings(mergedSettings);
        }
      })
      .catch((err) => console.error('Error loading calendar availability:', err))
      .finally(() => setIsLoadingSettings(false));
  }, []);

  // Sincronizar configuraciones en tiempo real
  useEffect(() => {
    if (availabilitySettings) {
      let mergedSettings = availabilitySettings;
      try {
        const local = localStorage.getItem('aquiestamos_admin_availability_settings');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed?.blockedDates && Array.isArray(parsed.blockedDates)) {
            const map = new Map<string, any>();
            parsed.blockedDates.forEach((b: any) => map.set(b.id, b));
            (mergedSettings.blockedDates || []).forEach((b: any) => map.set(b.id, b));
            mergedSettings = { ...mergedSettings, blockedDates: Array.from(map.values()) };
          }
        }
      } catch (e) {}
      setLocalSettings(mergedSettings);
      setIsLoadingSettings(false);
    }

    loadFreshAvailability();

    // Auto-actualizar cuando la app/pestaña vuelve a estar activa en móviles
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadFreshAvailability();
      }
    };

    window.addEventListener('focus', loadFreshAvailability);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', loadFreshAvailability);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [availabilitySettings, loadFreshAvailability]);

  // Si cambia la fecha seleccionada externamente, sincronizar mes
  useEffect(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      if (y && m) {
        setCurrentYear(y);
        setCurrentMonth(m - 1);
      }
    }
  }, [selectedDate]);

  // Navegación de mes
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Calcular días del mes actual y espaciado
  const calendarDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Mínimo para reservar: Mañana
    const minBookingDate = new Date(today);
    minBookingDate.setDate(minBookingDate.getDate() + 1);

    // Máximo para reservar: 90 días
    const maxBookingDate = new Date(today);
    maxBookingDate.setDate(maxBookingDate.getDate() + 90);

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Días vacíos para rellenar la primera semana
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ dayNumber: 0, dateStr: '', isPadding: true });
    }

    // Días del mes
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const yearStr = currentYear.toString();
      const monthStr = (currentMonth + 1).toString().padStart(2, '0');
      const dayStr = d.toString().padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

      // 1. Validar si es fecha pasada o antes de mañana
      const isPast = dateObj < minBookingDate;
      const isTooFar = dateObj > maxBookingDate;

      // 2. Validar día de la semana (Lunes a Domingo)
      const dayOfWeekIndex = dateObj.getDay();
      const dayKeyMap: Record<number, string> = {
        0: 'sunday',
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday',
      };
      const dayKey = dayKeyMap[dayOfWeekIndex];
      const isSunday = dayOfWeekIndex === 0;

      let isDayOfWeekClosed = false;
      let dayClosedReason = '';

      if (localSettings?.workingDays) {
        const dayConfig = (localSettings.workingDays as any)[dayKey];
        if (dayConfig && !dayConfig.enabled) {
          isDayOfWeekClosed = true;
          dayClosedReason = isSunday ? 'Domingo Cerrado' : `Cerrado los ${dayConfig.name || 'días no laborales'}`;
        }
      }

      // 3. Validar si cae en fecha puntual bloqueada o dentro de un rango bloqueado
      let isBlocked = false;
      let blockReason = '';
      let isHoliday = false;

      if (localSettings?.blockedDates && Array.isArray(localSettings.blockedDates)) {
        const matchingBlocked = localSettings.blockedDates.find((b: BlockedDate) => {
          if (!b.enabled) return false;
          if (b.endDate) {
            return dateStr >= b.date && dateStr <= b.endDate;
          }
          return b.date === dateStr;
        });

        if (matchingBlocked) {
          isBlocked = true;
          blockReason = matchingBlocked.reason || 'Fecha Bloqueada';
          isHoliday = matchingBlocked.isHoliday;
        }
      }

      const isSelectable = !isPast && !isTooFar && !isDayOfWeekClosed && !isBlocked;
      const isSelected = selectedDate === dateStr;

      days.push({
        dayNumber: d,
        dateStr,
        isPadding: false,
        isPast,
        isTooFar,
        isSunday,
        isDayOfWeekClosed,
        dayClosedReason,
        isBlocked,
        blockReason,
        isHoliday,
        isSelectable,
        isSelected,
      });
    }

    return days;
  }, [currentYear, currentMonth, localSettings, selectedDate]);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-3 sm:p-5 shadow-xs select-none space-y-4 touch-manipulation">
      
      {/* Cabecera del Calendario: Mes y Año + Navegación */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-electric-50 text-electric-600 flex items-center justify-center font-bold">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 capitalize">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">Selecciona un día disponible</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-90"
            title="Mes Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-90"
            title="Mes Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Días de la semana (LUN a DOM) */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_NAMES.map((name, i) => (
          <span
            key={name}
            className={`text-[11px] font-extrabold py-1 ${
              i === 6 ? 'text-rose-500' : 'text-slate-500'
            }`}
          >
            {name}
          </span>
        ))}
      </div>

      {/* Grilla de Días del Mes (Optimizada para Touch Móvil) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
        {calendarDays.map((item, index) => {
          if (item.isPadding) {
            return <div key={`pad-${index}`} className="h-11 sm:h-12" />;
          }

          const {
            dayNumber,
            dateStr,
            isPast,
            isDayOfWeekClosed,
            dayClosedReason,
            isBlocked,
            blockReason,
            isHoliday,
            isSelectable,
            isSelected,
          } = item;

          // Clases dinámicas según estado
          let tileClass = 'relative min-h-[44px] sm:min-h-[48px] rounded-xl flex flex-col items-center justify-center transition-all text-xs font-bold touch-manipulation ';

          if (isSelected) {
            tileClass += 'bg-electric-600 text-white shadow-md shadow-electric-600/30 ring-2 ring-electric-600 ring-offset-2 scale-105 z-10';
          } else if (isBlocked) {
            tileClass += 'bg-rose-50/90 border border-rose-200 text-rose-500 cursor-not-allowed opacity-80';
          } else if (isDayOfWeekClosed) {
            tileClass += 'bg-slate-100/80 border border-slate-200/70 text-slate-400 cursor-not-allowed';
          } else if (isPast) {
            tileClass += 'text-slate-300 cursor-not-allowed opacity-40';
          } else if (isSelectable) {
            tileClass += 'bg-slate-50/80 hover:bg-electric-50 hover:text-electric-700 hover:border-electric-300 border border-slate-200/80 text-slate-800 cursor-pointer active:scale-95 shadow-2xs';
          }

          const tooltipText = isBlocked
            ? `🚫 Bloqueado: ${blockReason}`
            : isDayOfWeekClosed
            ? `⛔ ${dayClosedReason}`
            : isPast
            ? 'Fecha pasada'
            : `Disponible para reserva`;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={!isSelectable || disabled}
              onClick={() => isSelectable && onSelectDate(dateStr)}
              title={tooltipText}
              className={tileClass}
            >
              <span className="text-[12px] sm:text-xs leading-none">{dayNumber}</span>

              {/* Indicador visual inferior */}
              {isSelected ? (
                <Check className="w-3 h-3 text-white stroke-[3] mt-0.5" />
              ) : isBlocked ? (
                <span className="text-[7.5px] sm:text-[8px] font-black text-rose-600 leading-none truncate max-w-full px-0.5 mt-0.5">
                  {isHoliday ? 'Feriado' : 'Cerrado'}
                </span>
              ) : isDayOfWeekClosed ? (
                <span className="text-[7.5px] sm:text-[8px] font-bold text-slate-400 leading-none mt-0.5">
                  Descanso
                </span>
              ) : isSelectable ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Leyenda Explicativa */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] font-semibold text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-electric-600" />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Feriado / Rango Bloqueado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span>Descanso</span>
        </div>
      </div>

    </div>
  );
}
