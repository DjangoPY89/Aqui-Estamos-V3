"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  CalendarOff,
  Settings2,
  CalendarRange,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Lock,
  Unlock,
  Check,
  Ban,
  Flag,
  CalendarDays,
  LayoutGrid,
  Columns2
} from 'lucide-react';
import { 
  AvailabilitySettings, 
  DayOfWeek, 
  BlockedDate, 
  TimeSlotConfig, 
  Employee 
} from '@/types';

interface AvailabilityManagerProps {
  employees: Employee[];
  onNotice?: (msg: string) => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const DAY_LABELS: { id: DayOfWeek; label: string; desc: string }[] = [
  { id: 'monday', label: 'Lunes', desc: 'Inicio de semana laboral' },
  { id: 'tuesday', label: 'Martes', desc: 'Día operativo regular' },
  { id: 'wednesday', label: 'Miércoles', desc: 'Día operativo regular' },
  { id: 'thursday', label: 'Jueves', desc: 'Día operativo regular' },
  { id: 'friday', label: 'Viernes', desc: 'Día operativo regular' },
  { id: 'saturday', label: 'Sábado', desc: 'Horario especial de fin de semana' },
  { id: 'sunday', label: 'Domingo', desc: 'Descanso semanal de la cuadrilla' },
];

const QUICK_REASONS = [
  "Vacaciones de Cuadrilla",
  "Receso de Fin de Año",
  "Mantenimiento General",
  "Capacitación de Personal IPS",
  "Feriado Puente",
  "Inventario y Limpieza"
];

export default function AvailabilityManager({ employees, onNotice }: AvailabilityManagerProps) {
  const [settings, setSettings] = useState<AvailabilitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('¡Configuración guardada automáticamente!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Vista de Calendario Airbnb (Mes actual y navegación)
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [calendarViewMode, setCalendarViewMode] = useState<'SINGLE' | 'DUAL'>('DUAL');

  // Selección Interactiva tipo Airbnb (Rango o Día Único)
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [selectedActionReason, setSelectedActionReason] = useState<string>('Vacaciones de Cuadrilla');

  // Modal / Pestañas de configuración secundaria
  const [activeSubTab, setActiveSubTab] = useState<'CALENDAR' | 'CAPACITY' | 'HOURS' | 'HOLIDAYS'>('CALENDAR');

  // Formulario para nuevo turno
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  // Cargar configuraciones (con respaldo local + API)
  const fetchSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/availability-settings?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      
      if (data?.settings) {
        setSettings(data.settings);
        try {
          localStorage.setItem('aquiestamos_admin_availability_settings', JSON.stringify(data.settings));
        } catch (e) {}
      }
    } catch (err: any) {
      try {
        const local = localStorage.getItem('aquiestamos_admin_availability_settings');
        if (local) {
          setSettings(JSON.parse(local));
        }
      } catch (e) {}
      setErrorMessage(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Guardar configuraciones automáticamente en backend y localStorage
  const handleAutoSave = async (customSettings?: AvailabilitySettings, customSuccessMsg?: string) => {
    const toSave = customSettings || settings;
    if (!toSave) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    // Guardar inmediatamente en localStorage del navegador
    try {
      localStorage.setItem('aquiestamos_admin_availability_settings', JSON.stringify(toSave));
    } catch (e) {}

    try {
      const res = await fetch('/api/admin/availability-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      });
      const data = await res.json();
      
      if (data?.settings) {
        setSettings(data.settings);
        try {
          localStorage.setItem('aquiestamos_admin_availability_settings', JSON.stringify(data.settings));
        } catch (e) {}
      } else {
        setSettings(toSave);
      }

      setSaveMessage(customSuccessMsg || '¡Guardado automático sincronizado con el calendario!');
      setSaveSuccess(true);
      if (onNotice) onNotice(customSuccessMsg || '¡Cambios guardados automáticamente!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage('Guardado localmente en tu navegador.');
      setSettings(toSave);
    } finally {
      setIsSaving(false);
    }
  };

  // Navegación de Meses
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleResetToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Generador de Grilla Mensual para el Calendario Dinámico
  const getMonthDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // 0=Dom, 1=Lun... Convertir a base Lunes (0=Lun, ..., 6=Dom)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ dayNumber: 0, dateStr: '', isPadding: true });
    }

    for (let d = 1; d <= totalDays; d++) {
      const yearStr = year.toString();
      const monthStr = (month + 1).toString().padStart(2, '0');
      const dayStr = d.toString().padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

      const dateObj = new Date(year, month, d);
      const dayOfWeekIndex = dateObj.getDay();
      const dayKeyMap: Record<number, DayOfWeek> = {
        0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday'
      };
      const dayKey = dayKeyMap[dayOfWeekIndex];
      const isSunday = dayOfWeekIndex === 0;

      // Estado operativo por día de la semana
      const dayConfig = settings?.workingDays ? settings.workingDays[dayKey] : null;
      const isDayClosedByWeeklySchedule = dayConfig ? !dayConfig.enabled : false;

      // Estado de bloqueo por fecha o rango
      let matchingBlock: BlockedDate | undefined = undefined;
      if (settings?.blockedDates && Array.isArray(settings.blockedDates)) {
        matchingBlock = settings.blockedDates.find((b: BlockedDate) => {
          if (!b.enabled) return false;
          if (b.endDate) {
            return dateStr >= b.date && dateStr <= b.endDate;
          }
          return b.date === dateStr;
        });
      }

      const isHoliday = !!matchingBlock?.isHoliday;
      const isCustomBlocked = !!matchingBlock && !matchingBlock.isHoliday;
      const isBlocked = !!matchingBlock || isDayClosedByWeeklySchedule;
      const blockReason = matchingBlock?.reason || (isDayClosedByWeeklySchedule ? (isSunday ? 'Domingo Cerrado' : 'Día No Laborable') : '');

      // Evaluar si cae dentro del rango actualmente seleccionado en la interfaz
      let isSelected = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isInSelectedRange = false;

      if (selectedStartDate && !selectedEndDate) {
        isSelected = selectedStartDate === dateStr;
      } else if (selectedStartDate && selectedEndDate) {
        const start = selectedStartDate < selectedEndDate ? selectedStartDate : selectedEndDate;
        const end = selectedStartDate < selectedEndDate ? selectedEndDate : selectedStartDate;
        isInSelectedRange = dateStr >= start && dateStr <= end;
        isRangeStart = dateStr === start;
        isRangeEnd = dateStr === end;
        isSelected = isInSelectedRange;
      }

      days.push({
        dayNumber: d,
        dateStr,
        isPadding: false,
        isSunday,
        isDayClosedByWeeklySchedule,
        isHoliday,
        isCustomBlocked,
        isBlocked,
        blockReason,
        matchingBlock,
        isSelected,
        isRangeStart,
        isRangeEnd,
        isInSelectedRange,
      });
    }

    return days;
  };

  // Manejar Clic en un Día (Estilo Airbnb: Selección simple o rango con 2 clics)
  const handleDateClick = (dateStr: string) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Iniciar nueva selección
      setSelectedStartDate(dateStr);
      setSelectedEndDate(null);
    } else {
      // Completar selección de rango
      if (dateStr === selectedStartDate) {
        // Mismo día seleccionado
        setSelectedEndDate(dateStr);
      } else if (dateStr < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(dateStr);
      } else {
        setSelectedEndDate(dateStr);
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  // Calcular cantidad de días seleccionados en el rango
  const calculateDaysSelected = () => {
    if (!selectedStartDate) return 0;
    if (!selectedEndDate || selectedEndDate === selectedStartDate) return 1;
    const diff = Math.round((new Date(selectedEndDate).getTime() - new Date(selectedStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  // ACCIÓN AIRBNB: BLOQUEAR FECHAS SELECCIONADAS
  const handleApplyBlockToSelection = (reasonText?: string) => {
    if (!selectedStartDate || !settings) return;

    const startDate = selectedStartDate;
    const endDate = selectedEndDate && selectedEndDate !== selectedStartDate ? selectedEndDate : undefined;
    const daysCount = calculateDaysSelected();
    const finalReason = (reasonText || selectedActionReason || '').trim() || (endDate ? `Cierre por Período (${daysCount} días)` : 'Día Bloqueado');

    const newBlock: BlockedDate = {
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: startDate,
      endDate: endDate,
      reason: finalReason,
      isHoliday: false,
      enabled: true,
    };

    // Filtrar posibles bloqueos anteriores que queden completamente solapados
    const currentBlocks = settings.blockedDates || [];
    const updated = {
      ...settings,
      blockedDates: [newBlock, ...currentBlocks],
    };

    setSettings(updated);
    handleClearSelection();
    handleAutoSave(
      updated,
      endDate 
        ? `✓ Rango de ${daysCount} días bloqueado en calendario (${startDate} al ${endDate})` 
        : `✓ Fecha ${startDate} bloqueada en calendario.`
    );
  };

  // ACCIÓN AIRBNB: DESBLOQUEAR / HABILITAR FECHAS SELECCIONADAS
  const handleApplyUnblockToSelection = () => {
    if (!selectedStartDate || !settings) return;

    const start = selectedStartDate;
    const end = selectedEndDate || selectedStartDate;

    // Eliminar o deshabilitar cualquier bloqueo que caiga dentro de este rango
    const filteredBlocks = (settings.blockedDates || []).filter((b) => {
      if (b.isHoliday) return true; // Mantener feriados en lista pero respetar estado
      if (b.endDate) {
        // Si el rango bloqueado se solapa con la selección
        const overlaps = !(b.endDate < start || b.date > end);
        return !overlaps;
      }
      return !(b.date >= start && b.date <= end);
    });

    const updated = {
      ...settings,
      blockedDates: filteredBlocks,
    };

    const daysCount = calculateDaysSelected();
    setSettings(updated);
    handleClearSelection();
    handleAutoSave(
      updated,
      `✓ ${daysCount} día(s) desbloqueados y habilitados para reservas (${start} al ${end}).`
    );
  };

  // Alternar regla individual directamente desde la tabla o el calendario
  const handleDeleteBlockedRule = (id: string) => {
    if (!settings) return;
    const target = (settings.blockedDates || []).find(b => b.id === id);
    const filtered = (settings.blockedDates || []).filter((b) => b.id !== id);
    const updated = { ...settings, blockedDates: filtered };
    setSettings(updated);
    handleAutoSave(updated, target ? `Regla "${target.reason}" eliminada.` : 'Bloqueo eliminado.');
  };

  const toggleDayOfWeek = (dayKey: DayOfWeek) => {
    if (!settings) return;
    const updated = {
      ...settings,
      workingDays: {
        ...settings.workingDays,
        [dayKey]: {
          ...settings.workingDays[dayKey],
          enabled: !settings.workingDays[dayKey].enabled,
        },
      },
    };
    if (dayKey === 'sunday') {
      updated.allowSundayBookings = !settings.workingDays.sunday.enabled;
    }
    setSettings(updated);
    handleAutoSave(updated, `Día ${updated.workingDays[dayKey].name} ${updated.workingDays[dayKey].enabled ? 'habilitado' : 'cerrado'}.`);
  };

  const toggleTimeSlot = (id: string) => {
    if (!settings) return;
    const updatedSlots = settings.timeSlots.map((slot) => {
      if (slot.id === id) return { ...slot, enabled: !slot.enabled };
      return slot;
    });
    const updated = { ...settings, timeSlots: updatedSlots };
    setSettings(updated);
    handleAutoSave(updated, 'Turno horario actualizado.');
  };

  const handleAddCustomSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime || !settings) return;

    const id = `slot_${newSlotTime.replace(':', '')}_${Date.now()}`;
    const period = parseInt(newSlotTime.split(':')[0], 10) < 12 ? 'morning' : 'afternoon';
    const label = newSlotLabel || `Turno ${newSlotTime} hs`;

    const newSlot: TimeSlotConfig = {
      id,
      time: newSlotTime,
      label,
      period,
      enabled: true,
    };

    const updated = {
      ...settings,
      timeSlots: [...settings.timeSlots, newSlot].sort((a, b) => a.time.localeCompare(b.time)),
    };

    setSettings(updated);
    setNewSlotTime('');
    setNewSlotLabel('');
    setIsAddingSlot(false);
    handleAutoSave(updated, `Nuevo turno (${newSlotTime} hs) añadido.`);
  };

  const handleDeleteSlot = (id: string) => {
    if (!settings) return;
    const filtered = settings.timeSlots.filter((s) => s.id !== id);
    const updated = { ...settings, timeSlots: filtered };
    setSettings(updated);
    handleAutoSave(updated, 'Turno eliminado.');
  };

  if (isLoading || !settings) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-electric-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Cargando calendario dinámico de anfitrión...</p>
      </div>
    );
  }

  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE');
  const activeCount = Math.max(1, activeEmployees.length);
  const calculatedDailyCapacity = settings.capacityMode === 'AUTO_BY_EMPLOYEES'
    ? activeCount * (settings.maxBookingsPerEmployeePerDay || 1)
    : settings.manualDailyMaxBookings;

  const customBlockedRules = (settings.blockedDates || []).filter((b) => !b.isHoliday && b.enabled);
  const paraguayHolidays = (settings.blockedDates || []).filter((b) => b.isHoliday);

  // Mes 1 y Mes 2 para vista dual de anfitrión
  const month1Year = currentYear;
  const month1Month = currentMonth;
  const month2Month = (currentMonth + 1) % 12;
  const month2Year = currentMonth === 11 ? currentYear + 1 : currentYear;

  const month1Days = getMonthDays(month1Year, month1Month);
  const month2Days = getMonthDays(month2Year, month2Month);

  const daysSelectedCount = calculateDaysSelected();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* BARRA SUPERIOR: ENCABEZADO MULTICALENDARIO AIRBNB */}
      <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-slate-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-electric-500/20 text-electric-300 border border-electric-500/30 rounded-full text-xs font-bold">
            <CalendarRange className="w-3.5 h-3.5 text-electric-400" />
            <span>Multicalendario de Anfitrión & Operaciones</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Calendario Dinámico de Disponibilidad</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-600/80 text-white font-bold hidden sm:inline">
              Estilo Airbnb
            </span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Haz clic en un día o selecciona un rango de fechas directamente en el calendario interactivo para bloquear vacaciones, mantenimiento o habilitar turnos con sincronización automática en vivo.
          </p>
        </div>

        {/* Indicador de Auto-Save en Tiempo Real */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl text-xs font-bold text-white shadow-inner shrink-0">
          {isSaving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-electric-400" />
              <span className="text-electric-300">Sincronizando cambios...</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-300">Guardado Automático Activo</span>
            </>
          )}
        </div>
      </div>

      {/* Alertas */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-3 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">{saveMessage}</p>
            <p className="text-[11px] text-emerald-700">El cotizador de reservas online refleja estos cambios al instante.</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-3 animate-in fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PESTAÑAS DE VISTA Y CONTROL */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSubTab('CALENDAR')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'CALENDAR'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-electric-600" />
            <span>Calendario Interactivo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('CAPACITY')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'CAPACITY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Capacidad & Personal ({activeCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('HOURS')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'HOURS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Horarios & Turnos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('HOLIDAYS')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'HOLIDAYS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flag className="w-4 h-4 text-purple-600" />
            <span>Feriados PY ({paraguayHolidays.length})</span>
          </button>
        </div>

        {/* Control de Modo de Vista (1 Mes vs 2 Meses) */}
        {activeSubTab === 'CALENDAR' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Vista:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCalendarViewMode('SINGLE')}
                className={`p-1.5 rounded-lg transition-all ${
                  calendarViewMode === 'SINGLE' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
                title="1 Mes Grande"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCalendarViewMode('DUAL')}
                className={`p-1.5 rounded-lg transition-all ${
                  calendarViewMode === 'DUAL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
                title="2 Meses en Paralelo"
              >
                <Columns2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: CALENDARIO DINÁMICO INTERACTIVO TIPO AIRBNB                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'CALENDAR' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* BARRA DE NAVEGACIÓN Y ACCIONES RÁPIDAS DEL CALENDARIO */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Controles de Mes */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors active:scale-95 shadow-2xs"
                  title="Mes Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors active:scale-95 shadow-2xs"
                  title="Mes Siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center lg:text-left">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {calendarViewMode === 'DUAL'
                    ? `${MONTH_NAMES[month1Month]} ${month1Year}  ➔  ${MONTH_NAMES[month2Month]} ${month2Year}`
                    : `${MONTH_NAMES[month1Month]} ${month1Year}`}
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Toca un día para iniciar o selecciona dos fechas para crear un rango
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetToToday}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Hoy
              </button>
            </div>

            {/* Leyenda Visual de Estados */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[9px] font-bold text-emerald-800">
                  ✓
                </span>
                <span>Disponible ({calculatedDailyCapacity}/día)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300 flex items-center justify-center text-[9px] font-bold text-rose-700">
                  ✕
                </span>
                <span>Bloqueado por Admin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-purple-100 border border-purple-300 flex items-center justify-center text-[9px] font-bold text-purple-700">
                  🇵🇾
                </span>
                <span>Feriado Oficial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300" />
                <span>Domingo / No laboral</span>
              </div>
            </div>
          </div>

          {/* INSPECTOR DE ACCIONES RÁPIDAS FLOTANTE (ESTILO AIRBNB HOST BAR) */}
          {selectedStartDate && (
            <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white rounded-3xl p-5 sm:p-6 border border-purple-500/40 shadow-xl space-y-4 animate-in slide-in-from-top-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-black">
                    <CalendarRange className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                        Período Seleccionado:
                      </span>
                      <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-black rounded-md">
                        {daysSelectedCount} {daysSelectedCount === 1 ? 'día' : 'días consecutivos'}
                      </span>
                    </div>
                    <p className="text-base sm:text-lg font-black text-white font-mono">
                      {selectedStartDate} {selectedEndDate && selectedEndDate !== selectedStartDate ? `➔ ${selectedEndDate}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  ✕ Deseleccionar
                </button>
              </div>

              {/* Botones de Acción Inmediata sobre la Selección */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Campo de Motivo */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Motivo para Bloqueo (Opcional):
                  </label>
                  <input
                    type="text"
                    value={selectedActionReason}
                    onChange={(e) => setSelectedActionReason(e.target.value)}
                    placeholder="Ej: Vacaciones de Cuadrilla, Mantenimiento..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/90 border border-purple-500/40 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  {/* Chips rápidos de motivos */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {QUICK_REASONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedActionReason(r)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 hover:bg-purple-500/30 text-purple-200 border border-white/10 transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="md:col-span-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => handleApplyBlockToSelection()}
                    className="flex-1 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Bloquear {daysSelectedCount > 1 ? `Rango (${daysSelectedCount}d)` : 'Fecha'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyUnblockToSelection()}
                    className="flex-1 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Habilitar / Abrir Fechas</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GRILLA DE MESES AIRBNB (1 O 2 MESES EN PARALELO) */}
          <div className={`grid grid-cols-1 ${calendarViewMode === 'DUAL' ? 'lg:grid-cols-2' : ''} gap-6`}>
            
            {/* MES 1 */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 select-none">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-extrabold text-base text-slate-900">
                  {MONTH_NAMES[month1Month]} {month1Year}
                </h4>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Mes Principal
                </span>
              </div>

              {/* Días de la Semana */}
              <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[11px] text-slate-500 pb-1">
                {DAY_NAMES.map((n, i) => (
                  <span key={n} className={i === 6 ? 'text-rose-500 font-black' : ''}>{n}</span>
                ))}
              </div>

              {/* Días del Mes 1 */}
              <div className="grid grid-cols-7 gap-1.5">
                {month1Days.map((item, idx) => {
                  if (item.isPadding) {
                    return <div key={`m1-pad-${idx}`} className="h-14 rounded-xl opacity-0" />;
                  }

                  const {
                    dayNumber,
                    dateStr,
                    isSunday,
                    isHoliday,
                    isCustomBlocked,
                    isBlocked,
                    blockReason,
                    isSelected,
                    isRangeStart,
                    isRangeEnd,
                    isInSelectedRange,
                  } = item;

                  let cellClass = 'relative h-14 rounded-2xl p-1.5 flex flex-col justify-between transition-all cursor-pointer text-xs font-bold border ';

                  if (isSelected) {
                    cellClass += 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-600 ring-offset-1 z-10 ';
                  } else if (isInSelectedRange) {
                    cellClass += 'bg-purple-100 border-purple-300 text-purple-950 ';
                  } else if (isCustomBlocked) {
                    cellClass += 'bg-rose-50/90 border-rose-200/90 text-rose-800 hover:bg-rose-100 ';
                  } else if (isHoliday) {
                    cellClass += 'bg-purple-50/80 border-purple-200 text-purple-900 hover:bg-purple-100 ';
                  } else if (isSunday) {
                    cellClass += 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200 ';
                  } else {
                    cellClass += 'bg-emerald-50/40 hover:bg-emerald-100/60 border-emerald-200/70 text-slate-900 ';
                  }

                  return (
                    <div
                      key={`m1-${dateStr}`}
                      onClick={() => handleDateClick(dateStr)}
                      className={cellClass}
                      title={`${dateStr}: ${blockReason || 'Disponible'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${isSelected ? 'text-white' : ''}`}>
                          {dayNumber}
                        </span>
                        {isCustomBlocked && !isSelected && (
                          <Lock className="w-3 h-3 text-rose-600 shrink-0" />
                        )}
                        {isHoliday && !isSelected && (
                          <span className="text-[9px]">🇵🇾</span>
                        )}
                      </div>

                      {/* Etiqueta / Estado inferior */}
                      <div className="truncate text-[9px] font-extrabold leading-none">
                        {isSelected ? (
                          <span className="text-white">✓ Marcado</span>
                        ) : isCustomBlocked ? (
                          <span className="text-rose-700 truncate">{blockReason || 'Cerrado'}</span>
                        ) : isHoliday ? (
                          <span className="text-purple-700 truncate">{blockReason}</span>
                        ) : isSunday ? (
                          <span className="text-slate-400">Descanso</span>
                        ) : (
                          <span className="text-emerald-700">✓ {calculatedDailyCapacity} cupos</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MES 2 (SI ESTÁ EN VISTA DUAL) */}
            {calendarViewMode === 'DUAL' && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 select-none">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-extrabold text-base text-slate-900">
                    {MONTH_NAMES[month2Month]} {month2Year}
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Mes Siguiente
                  </span>
                </div>

                {/* Días de la Semana */}
                <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[11px] text-slate-500 pb-1">
                  {DAY_NAMES.map((n, i) => (
                    <span key={n} className={i === 6 ? 'text-rose-500 font-black' : ''}>{n}</span>
                  ))}
                </div>

                {/* Días del Mes 2 */}
                <div className="grid grid-cols-7 gap-1.5">
                  {month2Days.map((item, idx) => {
                    if (item.isPadding) {
                      return <div key={`m2-pad-${idx}`} className="h-14 rounded-xl opacity-0" />;
                    }

                    const {
                      dayNumber,
                      dateStr,
                      isSunday,
                      isHoliday,
                      isCustomBlocked,
                      isBlocked,
                      blockReason,
                      isSelected,
                      isInSelectedRange,
                    } = item;

                    let cellClass = 'relative h-14 rounded-2xl p-1.5 flex flex-col justify-between transition-all cursor-pointer text-xs font-bold border ';

                    if (isSelected) {
                      cellClass += 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-600 ring-offset-1 z-10 ';
                    } else if (isInSelectedRange) {
                      cellClass += 'bg-purple-100 border-purple-300 text-purple-950 ';
                    } else if (isCustomBlocked) {
                      cellClass += 'bg-rose-50/90 border-rose-200/90 text-rose-800 hover:bg-rose-100 ';
                    } else if (isHoliday) {
                      cellClass += 'bg-purple-50/80 border-purple-200 text-purple-900 hover:bg-purple-100 ';
                    } else if (isSunday) {
                      cellClass += 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200 ';
                    } else {
                      cellClass += 'bg-emerald-50/40 hover:bg-emerald-100/60 border-emerald-200/70 text-slate-900 ';
                    }

                    return (
                      <div
                        key={`m2-${dateStr}`}
                        onClick={() => handleDateClick(dateStr)}
                        className={cellClass}
                        title={`${dateStr}: ${blockReason || 'Disponible'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black ${isSelected ? 'text-white' : ''}`}>
                            {dayNumber}
                          </span>
                          {isCustomBlocked && !isSelected && (
                            <Lock className="w-3 h-3 text-rose-600 shrink-0" />
                          )}
                          {isHoliday && !isSelected && (
                            <span className="text-[9px]">🇵🇾</span>
                          )}
                        </div>

                        {/* Etiqueta / Estado inferior */}
                        <div className="truncate text-[9px] font-extrabold leading-none">
                          {isSelected ? (
                            <span className="text-white">✓ Marcado</span>
                          ) : isCustomBlocked ? (
                            <span className="text-rose-700 truncate">{blockReason || 'Cerrado'}</span>
                          ) : isHoliday ? (
                            <span className="text-purple-700 truncate">{blockReason}</span>
                          ) : isSunday ? (
                            <span className="text-slate-400">Descanso</span>
                          ) : (
                            <span className="text-emerald-700">✓ {calculatedDailyCapacity} cupos</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* LISTA RESUMEN DE BLOQUEOS ACTIVOS EN EL CALENDARIO */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Reglas de Bloqueo Activas en el Calendario ({customBlockedRules.length})</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Todas estas fechas y rangos están inhabilitados en tiempo real en la página de reservas online.
                </p>
              </div>
            </div>

            {customBlockedRules.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                No hay bloqueos activos. Selecciona fechas en el calendario superior para programar vacaciones o cierres.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {customBlockedRules.map((b) => {
                  const isRange = !!b.endDate && b.endDate !== b.date;
                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-black text-purple-900 font-mono">
                          <span>{b.date}</span>
                          {isRange && (
                            <>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span>{b.endDate}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-700 truncate">{b.reason}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteBlockedRule(b.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                        title="Desbloquear y eliminar regla"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: CAPACIDAD Y PERSONAL IPS                                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'CAPACITY' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Gestión de Capacidad y Cuadrilla IPS
            </h3>
            <p className="text-xs text-slate-500">
              Define el número máximo de reservas diarias aceptadas según las empleadas disponibles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div
              onClick={() => {
                const updated = { ...settings, capacityMode: 'AUTO_BY_EMPLOYEES' as const };
                setSettings(updated);
                handleAutoSave(updated, 'Modo automático por empleadas activado.');
              }}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                settings.capacityMode === 'AUTO_BY_EMPLOYEES'
                  ? 'border-electric-600 bg-electric-50/40 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span className="text-base">⚡</span> Capacidad Automática por Cuadrilla
                </span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  settings.capacityMode === 'AUTO_BY_EMPLOYEES' ? 'border-electric-600 bg-electric-600' : 'border-slate-300'
                }`}>
                  {settings.capacityMode === 'AUTO_BY_EMPLOYEES' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multiplica las {activeCount} empleadas activas por los servicios diarios configurados ({calculatedDailyCapacity} cupos totales al día).
              </p>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700">
                  Servicios por Empleada / Día:
                </label>
                <select
                  value={settings.maxBookingsPerEmployeePerDay || 1}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...settings, maxBookingsPerEmployeePerDay: val };
                    setSettings(updated);
                    handleAutoSave(updated, `Capacidad: ${val} servicio(s) por empleada.`);
                  }}
                  className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-electric-600"
                >
                  <option value={1}>1 servicio por día</option>
                  <option value={2}>2 servicios por día</option>
                </select>
              </div>
            </div>

            <div
              onClick={() => {
                const updated = { ...settings, capacityMode: 'MANUAL_LIMIT' as const };
                setSettings(updated);
                handleAutoSave(updated, 'Modo manual fijo activado.');
              }}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                settings.capacityMode === 'MANUAL_LIMIT'
                  ? 'border-electric-600 bg-electric-50/40 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span className="text-base">🎯</span> Límite Manual Fijo
                </span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  settings.capacityMode === 'MANUAL_LIMIT' ? 'border-electric-600 bg-electric-600' : 'border-slate-300'
                }`}>
                  {settings.capacityMode === 'MANUAL_LIMIT' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Establece un tope fijo de reservas diarias sin importar la cantidad de personal.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700">
                  Máximo de reservas al día:
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.manualDailyMaxBookings || 4}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                    const updated = { ...settings, manualDailyMaxBookings: val };
                    setSettings(updated);
                    handleAutoSave(updated, `Tope diario manual: ${val} citas.`);
                  }}
                  className="w-20 text-xs font-bold border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-electric-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: HORARIOS Y DÍAS DE ATENCIÓN                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'HOURS' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Días de la Semana */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Días de Atención Semanal</h3>
                <p className="text-xs text-slate-500">Habilita o cierra días operativos de la semana.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {DAY_LABELS.map(({ id, label, desc }) => {
                const day = settings.workingDays[id];
                const isSunday = id === 'sunday';

                return (
                  <div
                    key={id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      day.enabled
                        ? isSunday
                          ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 shadow-2xs'
                        : 'bg-neutral-100/70 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">{label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.enabled}
                          onChange={() => toggleDayOfWeek(id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-electric-600"></div>
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-500">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Turnos Horarios */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Franjas Horarias de Llegada</h3>
                <p className="text-xs text-slate-500">Horarios disponibles para el cliente.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingSlot(!isAddingSlot)}
                className="px-3 py-1.5 bg-electric-50 hover:bg-electric-100 text-electric-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Turno</span>
              </button>
            </div>

            {isAddingSlot && (
              <form onSubmit={handleAddCustomSlot} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora (HH:MM)</label>
                  <input
                    type="time"
                    required
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Etiqueta</label>
                  <input
                    type="text"
                    placeholder="Ej: Turno Vespertino"
                    value={newSlotLabel}
                    onChange={(e) => setNewSlotLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button type="submit" className="flex-1 py-2 bg-electric-600 text-white rounded-xl text-xs font-bold">
                    Añadir
                  </button>
                  <button type="button" onClick={() => setIsAddingSlot(false)} className="py-2 px-3 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {settings.timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    slot.enabled ? 'bg-slate-50 border-slate-200 shadow-2xs' : 'bg-neutral-100 opacity-50'
                  }`}
                >
                  <div>
                    <span className="font-mono font-black text-sm text-slate-900">{slot.time}</span>
                    <p className="text-xs font-semibold text-slate-600">{slot.label}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slot.enabled}
                      onChange={() => toggleTimeSlot(slot.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-electric-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 4: FERIADOS OFICIALES DE PARAGUAY                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'HOLIDAYS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>🇵🇾 Feriados Oficiales de Paraguay</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                {paraguayHolidays.length} Registrados
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Configura si la plataforma debe aceptar reservas durante los feriados oficiales nacionales.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-extrabold uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Fecha</th>
                  <th className="py-2.5 px-4">Festividad</th>
                  <th className="py-2.5 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paraguayHolidays.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{b.date}</td>
                    <td className="py-2.5 px-4">{b.reason}</td>
                    <td className="py-2.5 px-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={b.enabled}
                          onChange={() => {
                            const updatedBlocked = (settings.blockedDates || []).map((item) =>
                              item.id === b.id ? { ...item, enabled: !item.enabled } : item
                            );
                            const updated = { ...settings, blockedDates: updatedBlocked };
                            setSettings(updated);
                            handleAutoSave(updated, `Feriado ${b.reason} ${!b.enabled ? 'bloqueado' : 'habilitado'}.`);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
