"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
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
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Flag
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
  "Inventario y Limpieza Interna"
];

export default function AvailabilityManager({ employees, onNotice }: AvailabilityManagerProps) {
  const [settings, setSettings] = useState<AvailabilitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('¡Configuración guardada automáticamente!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formulario para Bloqueo de Fechas o Rangos (PROTAGONISTA)
  const [blockMode, setBlockMode] = useState<'RANGE' | 'SINGLE'>('RANGE');
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedEndDate, setNewBlockedEndDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');

  // Estado del acordeón de Feriados de Paraguay (SEGUNDO PLANO)
  const [showHolidaysAccordion, setShowHolidaysAccordion] = useState(false);

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
      
      let finalSettings: AvailabilitySettings = data.settings;

      // Recuperar y fusionar reglas guardadas en localStorage si existían
      try {
        const local = localStorage.getItem('aquiestamos_admin_availability_settings');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && Array.isArray(parsed.blockedDates)) {
            const currentIds = new Set((finalSettings?.blockedDates || []).map(b => b.id));
            const extraLocalBlocks = parsed.blockedDates.filter((b: BlockedDate) => !currentIds.has(b.id));
            if (extraLocalBlocks.length > 0 && finalSettings) {
              finalSettings = {
                ...finalSettings,
                blockedDates: [...extraLocalBlocks, ...(finalSettings.blockedDates || [])],
              };
            }
          }
        }
      } catch (e) {}

      setSettings(finalSettings);
      try {
        localStorage.setItem('aquiestamos_admin_availability_settings', JSON.stringify(finalSettings));
      } catch (e) {}
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

  // Calcular cantidad de días en un rango
  const calculateDaysInRange = (startDate: string, endDate?: string) => {
    if (!endDate || endDate === startDate) return 1;
    const diff = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  if (isLoading || !settings) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-electric-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Cargando configuraciones de disponibilidad y calendario...</p>
      </div>
    );
  }

  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE');
  const activeCount = Math.max(1, activeEmployees.length);
  const calculatedDailyCapacity = settings.capacityMode === 'AUTO_BY_EMPLOYEES'
    ? activeCount * (settings.maxBookingsPerEmployeePerDay || 1)
    : settings.manualDailyMaxBookings;

  // Filtrar fechas y rangos bloqueados por el admin vs feriados de Paraguay
  const customBlockedRules = (settings.blockedDates || []).filter((b) => !b.isHoliday);
  const paraguayHolidays = (settings.blockedDates || []).filter((b) => b.isHoliday);

  // Modificadores de Estado con AUTO-SAVE INSTANTÁNEO
  const toggleDay = (dayKey: DayOfWeek) => {
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
    handleAutoSave(updated, `Día ${updated.workingDays[dayKey].name} ${updated.workingDays[dayKey].enabled ? 'habilitado' : 'cerrado'} automáticamente.`);
  };

  const updateDayTimes = (dayKey: DayOfWeek, startTime: string, endTime: string) => {
    const updated = {
      ...settings,
      workingDays: {
        ...settings.workingDays,
        [dayKey]: {
          ...settings.workingDays[dayKey],
          startTime,
          endTime,
        },
      },
    };
    setSettings(updated);
    handleAutoSave(updated, `Horario de ${updated.workingDays[dayKey].name} actualizado automáticamente.`);
  };

  const toggleTimeSlot = (id: string) => {
    const updatedSlots = settings.timeSlots.map((slot) => {
      if (slot.id === id) return { ...slot, enabled: !slot.enabled };
      return slot;
    });
    const updated = { ...settings, timeSlots: updatedSlots };
    setSettings(updated);
    handleAutoSave(updated, 'Turno horario actualizado automáticamente.');
  };

  const handleAddCustomSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime) return;

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
    handleAutoSave(updated, `Nuevo turno (${newSlotTime} hs) añadido y guardado automáticamente.`);
  };

  const handleDeleteSlot = (id: string) => {
    const filtered = settings.timeSlots.filter((s) => s.id !== id);
    const updated = { ...settings, timeSlots: filtered };
    setSettings(updated);
    handleAutoSave(updated, 'Turno eliminado automáticamente.');
  };

  // Agregar Fecha o Rango Bloqueado (Guardado instantáneo sin botones extra)
  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) return;

    const isRange = blockMode === 'RANGE' && newBlockedEndDate && newBlockedEndDate !== newBlockedDate;
    const daysCount = isRange ? calculateDaysInRange(newBlockedDate, newBlockedEndDate) : 1;

    const id = `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reason = newBlockedReason.trim() || (isRange ? `Cierre por Período (${daysCount} días)` : 'Día No Laborable');

    const newBlock: BlockedDate = {
      id,
      date: newBlockedDate,
      endDate: isRange ? newBlockedEndDate : undefined,
      reason,
      isHoliday: false,
      enabled: true,
    };

    const currentBlocks = settings.blockedDates || [];
    const updated = {
      ...settings,
      blockedDates: [newBlock, ...currentBlocks],
    };

    setSettings(updated);
    setNewBlockedDate('');
    setNewBlockedEndDate('');
    setNewBlockedReason('');
    handleAutoSave(
      updated,
      isRange 
        ? `✓ Rango guardado automáticamente (${daysCount} días: ${newBlock.date} al ${newBlock.endDate})`
        : `✓ Fecha ${newBlock.date} guardada automáticamente en el calendario.`
    );
  };

  const toggleBlockedRule = (id: string) => {
    const updatedBlocked = (settings.blockedDates || []).map((b) => {
      if (b.id === id) return { ...b, enabled: !b.enabled };
      return b;
    });
    const updated = { ...settings, blockedDates: updatedBlocked };
    setSettings(updated);
    handleAutoSave(updated, 'Estado del bloqueo actualizado automáticamente.');
  };

  const handleDeleteBlockedDate = (id: string) => {
    const target = (settings.blockedDates || []).find(b => b.id === id);
    const filtered = (settings.blockedDates || []).filter((b) => b.id !== id);
    const updated = { ...settings, blockedDates: filtered };
    setSettings(updated);
    handleAutoSave(updated, target ? `Regla "${target.reason}" eliminada automáticamente.` : 'Bloqueo eliminado automáticamente.');
  };

  const toggleAllHolidays = (enable: boolean) => {
    const updatedBlocked = (settings.blockedDates || []).map((b) => {
      if (b.isHoliday) return { ...b, enabled: enable };
      return b;
    });
    const updated = { ...settings, blockedDates: updatedBlocked };
    setSettings(updated);
    handleAutoSave(updated, enable ? 'Todos los feriados activados automáticamente.' : 'Feriados deshabilitados automáticamente.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Barra Superior Informativa con Indicador de Guardado Automático */}
      <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-slate-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-electric-500/20 text-electric-300 border border-electric-500/30 rounded-full text-xs font-bold">
            <Settings2 className="w-3.5 h-3.5" />
            <span>Control de Calendario en Vivo</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Bloqueo de Fechas, Rangos y Capacidad Operativa
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Bloquea días específicos o rangos continuos (vacaciones de cuadrilla, mantenimiento, recesos) para que queden físicamente inhabilitados en el calendario de reservas web.
          </p>
        </div>

        {/* Indicador de Auto-Save en Tiempo Real (Reemplaza el botón manual) */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl text-xs font-bold text-white shadow-inner shrink-0">
          {isSaving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-electric-400" />
              <span className="text-electric-300">Guardando cambios...</span>
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

      {/* Alertas de Auto-Guardado */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-3 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">{saveMessage}</p>
            <p className="text-[11px] text-emerald-700">El calendario del cotizador en línea ahora refleja estos cambios al instante.</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-3 animate-in fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPIs Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Rangos y Fechas Bloqueadas</span>
            <CalendarRange className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600">
            {customBlockedRules.filter(b => b.enabled).length}{' '}
            <span className="text-xs font-semibold text-slate-400">reglas activas</span>
          </p>
          <p className="text-[11px] text-slate-500">Bloqueos creados por la administración</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Capacidad Diaria</span>
            <Sparkles className="w-4 h-4 text-electric-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {calculatedDailyCapacity} <span className="text-xs font-semibold text-slate-400">citas / día</span>
          </p>
          <p className="text-[11px] text-slate-500">{activeCount} empleadas IPS activas</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Domingos</span>
            <CalendarOff className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-900 flex items-center gap-2">
            {settings.workingDays.sunday.enabled ? (
              <span className="text-emerald-600">🟢 Abierto</span>
            ) : (
              <span className="text-rose-600">🔴 Cerrado</span>
            )}
          </p>
          <p className="text-[11px] text-slate-500">
            {settings.workingDays.sunday.enabled ? 'Se reciben reservas' : 'Descanso semanal'}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Turnos Habilitados</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">
            {settings.timeSlots.filter(s => s.enabled).length}{' '}
            <span className="text-xs font-semibold text-slate-400">horarios</span>
          </p>
          <p className="text-[11px] text-slate-500">Franjas de llegada al domicilio</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1 (PROTAGONISTA): BLOQUEO DE FECHAS O RANGOS COMPLETOS            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-purple-200 shadow-md space-y-6">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black shadow-xs">
              <CalendarRange className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Bloqueo de Fechas y Rangos Operativos
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase">
                  Control en Vivo
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Bloquea días específicos o períodos completos (vacaciones de cuadrilla, mantenimiento, recesos).
              </p>
            </div>
          </div>
        </div>

        {/* Formulario de Bloqueo Destacado */}
        <form onSubmit={handleAddBlockedDate} className="p-5 sm:p-6 bg-gradient-to-br from-purple-50/70 via-slate-50/50 to-purple-50/70 border border-purple-200/90 rounded-2xl space-y-4 shadow-xs">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-purple-200/60">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" />
              <span>Crear Nuevo Bloqueo en Calendario:</span>
            </span>

            {/* Selector de Modalidad: Rango vs Fecha Única */}
            <div className="flex bg-white p-1 rounded-xl border border-purple-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setBlockMode('RANGE')}
                className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 ${
                  blockMode === 'RANGE'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>🗓️ Rango de Fechas (Vacaciones / Receso)</span>
              </button>
              <button
                type="button"
                onClick={() => setBlockMode('SINGLE')}
                className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 ${
                  blockMode === 'SINGLE'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>📅 Fecha Única (Cierre Puntual)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {/* Fecha Inicio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {blockMode === 'RANGE' ? 'Fecha de Inicio del Período *' : 'Fecha Específica a Bloquear *'}
              </label>
              <input
                type="date"
                required
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none shadow-2xs"
              />
            </div>

            {/* Fecha Fin (Solo en Modo Rango) */}
            {blockMode === 'RANGE' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Fecha de Fin del Período *
                </label>
                <input
                  type="date"
                  required
                  min={newBlockedDate}
                  value={newBlockedEndDate}
                  onChange={(e) => setNewBlockedEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none shadow-2xs"
                />
              </div>
            )}

            {/* Motivo */}
            <div className={blockMode === 'RANGE' ? 'sm:col-span-2 lg:col-span-1' : 'sm:col-span-2'}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Motivo Visible en Calendario *
              </label>
              <input
                type="text"
                required
                placeholder={blockMode === 'RANGE' ? 'Ej: Vacaciones de Cuadrilla' : 'Ej: Mantenimiento de Equipos'}
                value={newBlockedReason}
                onChange={(e) => setNewBlockedReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none shadow-2xs"
              />
            </div>
          </div>

          {/* Sugerencias Rápidas de Motivos */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-500">Sugerencias rápidas:</span>
            {QUICK_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setNewBlockedReason(reason)}
                className="px-2.5 py-1 bg-white hover:bg-purple-100/70 text-slate-700 hover:text-purple-900 text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors shadow-2xs"
              >
                {reason}
              </button>
            ))}
          </div>

          {/* Previsualización del Período */}
          {blockMode === 'RANGE' && newBlockedDate && newBlockedEndDate && (
            <div className="p-3 bg-purple-100/80 text-purple-950 text-xs rounded-xl flex items-center justify-between font-bold border border-purple-200">
              <span className="flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-purple-700 shrink-0" />
                <span>
                  Se bloquearán {calculateDaysInRange(newBlockedDate, newBlockedEndDate)} días consecutivos ({newBlockedDate} al {newBlockedEndDate}) en el formulario de reservas.
                </span>
              </span>
            </div>
          )}

          {/* Botón de Envío */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-7 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Guardando Bloqueo...</span>
                </>
              ) : (
                <>
                  <CalendarRange className="w-4 h-4" />
                  <span>{blockMode === 'RANGE' ? 'Guardar y Bloquear Rango de Fechas' : 'Guardar y Bloquear Fecha'}</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Tabla / Lista de Bloqueos Creados por la Administración */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Bloqueos Activos de la Administración ({customBlockedRules.length})</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              Sincronizado con el componente de reservas
            </span>
          </div>

          {customBlockedRules.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <CalendarRange className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No hay rangos ni fechas bloqueadas manualmente</p>
              <p className="text-[11px] text-slate-500">Utiliza el formulario superior para programar vacaciones o días cerrados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Período / Fecha</th>
                    <th className="py-3 px-4">Motivo del Bloqueo</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">En Reservas</th>
                    <th className="py-3 px-4 text-right">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {customBlockedRules.map((b) => {
                    const isRange = !!b.endDate && b.endDate !== b.date;
                    const daysCount = isRange ? calculateDaysInRange(b.date, b.endDate) : 1;

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {isRange ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-purple-700 font-black">{b.date}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-purple-700 font-black">{b.endDate}</span>
                              <span className="text-[10px] font-bold text-slate-500 ml-1">({daysCount} días)</span>
                            </div>
                          ) : (
                            <span className="text-slate-900">{b.date}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {b.reason}
                        </td>
                        <td className="py-3 px-4">
                          {isRange ? (
                            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-black rounded-lg">
                              🗓️ Rango ({daysCount} días)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black rounded-lg">
                              📅 Fecha Única
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={b.enabled}
                              onChange={() => toggleBlockedRule(b.id)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteBlockedDate(b.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                            title="Eliminar regla de bloqueo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 2 (SEGUNDO PLANO): FERIADOS DE PARAGUAY EN ACORDEÓN               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHolidaysAccordion(!showHolidaysAccordion)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              <Flag className="w-4 h-4 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  🇵🇾 Feriados Nacionales de Paraguay (Segundo Plano / Opcional)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {paraguayHolidays.length} Feriados Registrados
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Festividades oficiales de Paraguay precargadas (Año Nuevo, Semana Santa, Día de la Independencia, etc.).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span>{showHolidaysAccordion ? "Ocultar" : "Ver Feriados"}</span>
            {showHolidaysAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showHolidaysAccordion && (
          <div className="p-6 pt-0 border-t border-slate-100 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-600 font-medium">
                Activa o desactiva si deseas recibir reservas durante los feriados oficiales nacionales.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleAllHolidays(true)}
                  className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[11px] font-bold rounded-lg border border-purple-200 hover:bg-purple-100"
                >
                  Bloquear Todos
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllHolidays(false)}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg hover:bg-slate-200"
                >
                  Permitir Reservas
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-extrabold uppercase text-[10px] tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Fecha</th>
                    <th className="py-2.5 px-4">Festividad</th>
                    <th className="py-2.5 px-4">Cerrar en Calendario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {paraguayHolidays.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-4 font-mono font-bold text-slate-900">{b.date}</td>
                      <td className="py-2 px-4 text-slate-800">{b.reason}</td>
                      <td className="py-2 px-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={b.enabled}
                            onChange={() => toggleBlockedRule(b.id)}
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

      {/* SECCIÓN 3: REGLAS DE CAPACIDAD Y CUADRILLA */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-electric-50 text-electric-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Capacidad Máxima de Citas Diarias
              </h3>
              <p className="text-xs text-slate-500">
                Define cuántas veces se puede reservar un mismo día en base al personal disponible.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            onClick={() => {
              const updated = { ...settings, capacityMode: 'AUTO_BY_EMPLOYEES' as const };
              setSettings(updated);
              handleAutoSave(updated, 'Modo de capacidad automática activado.');
            }}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              settings.capacityMode === 'AUTO_BY_EMPLOYEES'
                ? 'border-electric-600 bg-electric-50/40 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <span className="text-base">⚡</span> Modo Automático (Recomendado)
              </span>
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                settings.capacityMode === 'AUTO_BY_EMPLOYEES' ? 'border-electric-600 bg-electric-600' : 'border-slate-300'
              }`}>
                {settings.capacityMode === 'AUTO_BY_EMPLOYEES' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              La capacidad diaria se calcula automáticamente multiplicando la cantidad de empleadas activas (<strong>{activeCount}</strong>) por los turnos permitidos por día.
            </p>

            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700">
                Servicios por Empleada / Día:
              </label>
              <select
                value={settings.maxBookingsPerEmployeePerDay || 1}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const updated = { ...settings, maxBookingsPerEmployeePerDay: val };
                  setSettings(updated);
                  handleAutoSave(updated, `Límite actualizado a ${val} servicio(s) por empleada.`);
                }}
                className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-electric-600"
              >
                <option value={1}>1 servicio por empleada (Recomendado para 6h/8h)</option>
                <option value={2}>2 servicios por empleada (Mañana y Tarde)</option>
              </select>
            </div>
          </div>

          <div
            onClick={() => {
              const updated = { ...settings, capacityMode: 'MANUAL_LIMIT' as const };
              setSettings(updated);
              handleAutoSave(updated, 'Modo de límite manual fijo activado.');
            }}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              settings.capacityMode === 'MANUAL_LIMIT'
                ? 'border-electric-600 bg-electric-50/40 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <span className="text-base">🎯</span> Límite Fijo Manual
              </span>
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                settings.capacityMode === 'MANUAL_LIMIT' ? 'border-electric-600 bg-electric-600' : 'border-slate-300'
              }`}>
                {settings.capacityMode === 'MANUAL_LIMIT' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Establece un número fijo estricto de citas máximas que la plataforma puede aceptar por día, independientemente del total de empleadas.
            </p>

            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
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
                  handleAutoSave(updated, `Capacidad diaria fijada en ${val} citas.`);
                }}
                className="w-20 text-xs font-bold border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-electric-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: DÍAS DE LA SEMANA Y DOMINGOS */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Días de Atención Semanal
              </h3>
              <p className="text-xs text-slate-500">
                Habilita o deshabilita los días en que el sistema permite reservar servicios.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleDay('sunday')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              settings.workingDays.sunday.enabled
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {settings.workingDays.sunday.enabled ? 'Cerrar Domingos' : 'Abrir Domingos'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900">{label}</span>
                    {isSunday && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                        Fin de Semana
                      </span>
                    )}
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.enabled}
                      onChange={() => toggleDay(id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-electric-600"></div>
                  </label>
                </div>

                <p className="text-[10px] text-slate-500">{desc}</p>

                {day.enabled ? (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Apertura</label>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateDayTimes(id, e.target.value, day.endTime)}
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Cierre</label>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateDayTimes(id, day.startTime, e.target.value)}
                        className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                    <span>🔴 Cerrado</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 5: HORARIOS Y TURNOS DE LLEGADA */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Turnos y Horarios de Servicio
              </h3>
              <p className="text-xs text-slate-500">
                Franjas horarias disponibles para que el cliente elija la hora de llegada de su personal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingSlot(!isAddingSlot)}
            className="px-3 py-1.5 bg-electric-50 hover:bg-electric-100 text-electric-700 border border-electric-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Turno</span>
          </button>
        </div>

        {isAddingSlot && (
          <form onSubmit={handleAddCustomSlot} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-end animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hora de Llegada (HH:MM)</label>
              <input
                type="time"
                required
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Etiqueta Visible</label>
              <input
                type="text"
                placeholder="Ej: Turno Vespertino (15:00)"
                value={newSlotLabel}
                onChange={(e) => setNewSlotLabel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-electric-600 text-white rounded-xl text-xs font-bold hover:bg-electric-700"
              >
                Añadir Turno
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSlot(false)}
                className="py-2 px-3 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300"
              >
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
                slot.enabled
                  ? 'bg-slate-50 border-slate-200 shadow-2xs'
                  : 'bg-neutral-100/70 border-neutral-200 opacity-50'
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-slate-900">{slot.time}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    slot.period === 'morning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {slot.period === 'morning' ? 'Mañana' : 'Tarde'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 truncate">{slot.label}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slot.enabled}
                    onChange={() => toggleTimeSlot(slot.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-electric-600"></div>
                </label>

                {slot.id.startsWith('slot_') && slot.id.length > 10 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Eliminar turno personalizado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
